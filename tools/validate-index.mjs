import fs from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const schema = JSON.parse(fs.readFileSync("schema/servers.index.schema.json", "utf8"));
const data   = JSON.parse(fs.readFileSync("registry/servers.index.json", "utf8"));

const ajv = new Ajv({ allErrors: true, strict: true }); // draft-07
addFormats(ajv);

const validate = ajv.compile(schema);
const ok = validate(data);

if (!ok) {
  console.error("Index schema validation failed:");
  for (const e of validate.errors) {
    console.error("-", e.instancePath || "(root)", e.message);
  }
  process.exit(1);
}
console.log("Index OK. Servers:", Array.isArray(data.servers) ? data.servers.length : 0);
