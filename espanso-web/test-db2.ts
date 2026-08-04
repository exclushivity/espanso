import { db } from './src/lib/server/db.ts';
import { users, sessions } from './src/lib/server/schema.ts';
async function run() {
  try {
    const u = await db.select().from(users).limit(1);
    const s = await db.select().from(sessions).limit(1);
    console.log("Users:", u);
    console.log("Sessions:", s);
  } catch (e) {
    console.error("DB Error:", e);
  }
}
run();
