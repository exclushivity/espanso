use eventsource_stream::Eventsource;
use futures_util::StreamExt;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::PathBuf;
use std::thread;
use tokio::runtime::Runtime;

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct SyncConfig {
    pub user_id: String,
    pub api_url: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Snippet {
    pub trigger: String,
    pub replacement: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SyncFile {
    pub matches: Vec<EspansoMatch>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct EspansoMatch {
    pub trigger: String,
    pub replace: String,
}

pub fn login_cli(config_dir: PathBuf) -> Result<(), anyhow::Error> {
    let server = tiny_http::Server::http("127.0.0.1:11034").map_err(|e| anyhow::anyhow!("Failed to start server: {}", e))?;
    
    let login_url = "https://devspanso.pages.dev/api/cli/login?port=11034";
    println!("Opening your browser to authenticate with Devspanso...");
    println!("If your browser doesn't open automatically, visit: {}", login_url);
    
    if let Err(e) = open::that(login_url) {
        log::error!("Failed to open browser: {}", e);
    }
    
    println!("Waiting for authentication callback...");
    
    for request in server.incoming_requests() {
        let url = request.url();
        if url.starts_with("/callback") {
            let mut user_id = String::new();
            if let Some(query) = url.split('?').nth(1) {
                for pair in query.split('&') {
                    let mut parts = pair.split('=');
                    if parts.next() == Some("userId") {
                        if let Some(id) = parts.next() {
                            user_id = id.to_string();
                        }
                    }
                }
            }
            
            let response = tiny_http::Response::from_string("Authentication successful! You can close this window and return to your terminal.");
            let _ = request.respond(response);
            
            if !user_id.is_empty() {
                let sync_config = SyncConfig {
                    user_id: user_id.clone(),
                    api_url: "https://devspanso.pages.dev".to_string(),
                };
                
                let sync_config_path = config_dir.join("sync.yml");
                let yaml = serde_yaml::to_string(&sync_config)?;
                fs::write(&sync_config_path, yaml)?;
                
                println!("Successfully logged in! Your credentials are saved to {:?}", sync_config_path);
                return Ok(());
            } else {
                return Err(anyhow::anyhow!("Callback received but no userId parameter found."));
            }
        }
    }
    
    Ok(())
}

pub fn initialize_and_spawn(config_dir: PathBuf, match_dir: PathBuf) -> Result<(), anyhow::Error> {
    let sync_config_path = config_dir.join("sync.yml");

    if !sync_config_path.exists() {
        log::info!("No sync.yml found at {:?}, cloud sync disabled.", sync_config_path);
        return Ok(());
    }

    let config_content = fs::read_to_string(&sync_config_path)?;
    let sync_config: SyncConfig = serde_yaml::from_str(&config_content)
        .map_err(|e| anyhow::anyhow!("Failed to parse sync.yml: {}", e))?;

    log::info!("Cloud sync initialized for user: {}", sync_config.user_id);

    thread::spawn(move || {
        let rt = Runtime::new().unwrap();
        rt.block_on(async move {
            run_sync_loop(sync_config, match_dir).await;
        });
    });

    Ok(())
}

async fn run_sync_loop(config: SyncConfig, match_dir: PathBuf) {
    let client = Client::new();
    let sync_file_path = match_dir.join("sync.yml");

    if let Err(e) = perform_sync(&client, &config, &sync_file_path).await {
        log::error!("Initial cloud sync failed: {}", e);
    }

    let push_url = format!("{}/api/push?userId={}", config.api_url, config.user_id);
    
    loop {
        log::info!("Connecting to SSE push endpoint...");
        match client.get(&push_url).send().await {
            Ok(response) => {
                let mut stream = response.bytes_stream().eventsource();
                
                while let Some(event_res) = stream.next().await {
                    match event_res {
                        Ok(event) => {
                            if event.event == "sync" {
                                log::info!("Received sync notification.");
                                if let Err(e) = perform_sync(&client, &config, &sync_file_path).await {
                                    log::error!("Cloud sync failed after notification: {}", e);
                                }
                            }
                        }
                        Err(e) => {
                            log::error!("SSE stream error: {}", e);
                            break;
                        }
                    }
                }
            }
            Err(e) => {
                log::error!("Failed to connect to SSE endpoint: {}. Retrying...", e);
            }
        }

        tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
    }
}

async fn perform_sync(client: &Client, config: &SyncConfig, sync_file_path: &PathBuf) -> Result<(), anyhow::Error> {
    let sync_url = format!("{}/api/sync?userId={}", config.api_url, config.user_id);
    let response = client.get(&sync_url).send().await?;
    
    if !response.status().is_success() {
        return Err(anyhow::anyhow!("Sync API returned status: {}", response.status()));
    }
    
    let snippets: Vec<Snippet> = response.json().await?;
    
    let mut local_hash = String::new();
    if sync_file_path.exists() {
        if let Ok(content) = fs::read_to_string(sync_file_path) {
            let mut hasher = Sha256::new();
            hasher.update(content.as_bytes());
            local_hash = hasher.finalize().iter().map(|b| format!("{:02x}", b)).collect::<String>();
        }
    }
    
    let new_sync_file = SyncFile {
        matches: snippets.into_iter().map(|s| EspansoMatch {
            trigger: s.trigger,
            replace: s.replacement,
        }).collect(),
    };
    
    let new_content = serde_yaml::to_string(&new_sync_file)?;
    
    let mut hasher = Sha256::new();
    hasher.update(new_content.as_bytes());
    let new_hash = hasher.finalize().iter().map(|b| format!("{:02x}", b)).collect::<String>();
    
    if local_hash != new_hash {
        log::info!("Cloud sync: Changes detected, updating match/sync.yml");
        fs::write(sync_file_path, new_content)?;
    }
    
    Ok(())
}

pub fn logout_cli(config_dir: std::path::PathBuf) -> Result<(), anyhow::Error> {
    let sync_file = config_dir.join("sync.yml");
    if sync_file.exists() {
        std::fs::remove_file(&sync_file)?;
        println!("Logged out successfully. Cloud Sync is now disabled.");
    } else {
        println!("You are not currently logged in.");
    }
    Ok(())
}
