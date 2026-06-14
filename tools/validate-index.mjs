import fs from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const index = JSON.parse(fs.readFileSync("registry/servers.index.json", "utf8"));
const schema = JSON.parse(
  fs.readFileSync("schema/servers.index.schema.json", "utf8"),
);

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile(schema);

if (!validate(index)) {
  for (const error of validate.errors ?? []) {
    console.error(error.instancePath || "(root)", error.message);
  }
  process.exit(1);
}

console.log(`Index valid with ${index.servers.length} servers`);
