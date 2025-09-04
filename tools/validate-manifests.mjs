import fs from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const index  = JSON.parse(fs.readFileSync("registry/servers.index.json", "utf8"));
const schema = JSON.parse(fs.readFileSync("schema/mcp-server.schema.json", "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false }); // draft-07
addFormats(ajv);

const validate = ajv.compile(schema);
let failures = 0;

for (const s of index.servers) {
  const p = s.manifest;
  if (!p) continue;                 // reference/hosted — пропускаем
  if (!fs.existsSync(p)) {
    console.warn(`[WARN] ${s.id}: missing ${p}`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  const ok = validate(data);
  if (!ok) {
    failures++;
    console.error(`[FAIL] ${s.id}:`);
    for (const e of validate.errors) {
      console.error("  -", e.instancePath || "(root)", e.message);
    }
  } else {
    console.log(`[OK] ${s.id}: manifest valid`);
  }
}
if (failures) {
  console.error(`Manifests validation failed: ${failures} server(s)`);
  process.exit(1);
} else {
  console.log("All local manifests OK (or skipped).");
}
