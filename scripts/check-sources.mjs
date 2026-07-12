import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { createHash } from "crypto";

const sources = JSON.parse(readFileSync("scripts/sources.json", "utf8"));
const statePath = "scripts/state.json";
const state = existsSync(statePath) ? JSON.parse(readFileSync(statePath, "utf8")) : {};
const changes = [];

for (const s of sources) {
  for (const u of s.urls) {
    const key = `${s.insurer}/${s.product}/${u.type}`;
    try {
      const res = await fetch(u.url, { headers: { "User-Agent": "CheckaliaBot/1.0 (+https://checkalia.es)" } });
      if (!res.ok) { changes.push(`WARN ${key} -> HTTP ${res.status} (URL moved?)`); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      const hash = createHash("sha256").update(buf).digest("hex");
      if (state[key] && state[key] !== hash) changes.push(`CHANGED: ${key} - ${u.url}`);
      if (!state[key]) changes.push(`NEW: ${key}`);
      state[key] = hash;
      if (u.url.endsWith(".pdf")) {
        const dir = `src/data/sources/${s.insurer}`;
        mkdirSync(dir, { recursive: true });
        writeFileSync(`${dir}/${s.product}-${u.type}.pdf`, buf);
      }
    } catch (e) { changes.push(`ERROR: ${key} - ${e.message}`); }
    await new Promise(r => setTimeout(r, 2000));
  }
}
writeFileSync(statePath, JSON.stringify(state, null, 2));
writeFileSync("CHANGES.md", changes.length ? `# Source check ${new Date().toISOString().slice(0,10)}\n\n${changes.join("\n")}` : "# No changes");
console.log(changes.join("\n") || "No changes");
