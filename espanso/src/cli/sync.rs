use super::{CliModule, CliModuleArgs};

pub fn new() -> CliModule {
    CliModule {
        requires_paths: true,
        subcommand: "sync".to_string(),
        entry: sync_main,
        ..Default::default()
    }
}

fn sync_main(args: CliModuleArgs) -> i32 {
    let cli_args = args.cli_args.expect("missing cli_args");
    let paths = args.paths.expect("missing paths");

    if cli_args.subcommand_matches("login").is_some() {
        if let Err(e) = espanso_cloud_sync::login_cli(paths.config) {
            eprintln!("Login failed: {}", e);
            return 1;
        }
    } else if cli_args.subcommand_matches("logout").is_some() {
        if let Err(e) = espanso_cloud_sync::logout_cli(paths.config) {
            eprintln!("Logout failed: {}", e);
            return 1;
        }
    } else {
        eprintln!("unknown command, please run `espanso sync --help` to see a list of valid ones.");
        return 1;
    }

    0
}
