import { db } from './src/lib/server/db.ts';
import { snippets } from './src/lib/server/schema.ts';
async function run() {
  try {
    const res = await db.select().from(snippets).limit(1);
    console.log("DB OK:", res);
  } catch (e) {
    console.error("DB Error:", e);
  }
}
run();
