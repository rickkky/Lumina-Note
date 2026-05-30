import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const releaseDir = path.resolve(process.argv[2] ?? path.join(root, "release"));
const githubSafeName = /^[A-Za-z0-9._+-]+$/;
const uploadableExtensions = new Set([
  ".AppImage",
  ".blockmap",
  ".dmg",
  ".exe",
  ".zip",
]);

function assetNameFromReference(value) {
  const raw = String(value).trim();
  if (!raw) return "";

  try {
    const url = new URL(raw);
    return decodeURIComponent(path.posix.basename(url.pathname));
  } catch {
    const withoutQuery = raw.split(/[?#]/, 1)[0];
    return decodeURIComponent(withoutQuery.split(/[\\/]/).pop() ?? "");
  }
}

function isUploadableAsset(name) {
  return (
    name.startsWith("latest") && name.endsWith(".yml")
  ) || uploadableExtensions.has(path.extname(name));
}

function validateReleaseAssets(dir) {
  const errors = [];

  if (!fs.existsSync(dir)) {
    return [`Release directory does not exist: ${dir}`];
  }

  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
  const entrySet = new Set(entries);
  const latestFiles = entries.filter(
    (name) => name.startsWith("latest") && name.endsWith(".yml"),
  );

  if (latestFiles.length === 0) {
    errors.push(`No latest*.yml files found in ${dir}`);
  }

  for (const name of entries.filter(isUploadableAsset)) {
    if (!githubSafeName.test(name)) {
      errors.push(
        `${name} is not GitHub-safe; release asset names must avoid spaces and special characters`,
      );
    }
  }

  for (const latestFile of latestFiles) {
    const latestPath = path.join(dir, latestFile);
    const doc = parseYaml(fs.readFileSync(latestPath, "utf8"));
    const references = new Set();

    if (typeof doc?.path === "string") {
      references.add(doc.path);
    }
    if (Array.isArray(doc?.files)) {
      for (const file of doc.files) {
        if (typeof file?.url === "string") {
          references.add(file.url);
        }
      }
    }

    if (references.size === 0) {
      errors.push(`${latestFile} does not reference any release assets`);
      continue;
    }

    for (const reference of references) {
      const assetName = assetNameFromReference(reference);
      if (!assetName) {
        errors.push(`${latestFile} contains an empty asset reference`);
        continue;
      }
      if (!githubSafeName.test(assetName)) {
        errors.push(
          `${latestFile} references ${assetName}, which is not GitHub-safe`,
        );
      }
      if (!entrySet.has(assetName)) {
        errors.push(
          `${latestFile} references ${assetName}, but ${path.join(dir, assetName)} does not exist`,
        );
      }
    }
  }

  return errors;
}

const errors = validateReleaseAssets(releaseDir);
if (errors.length > 0) {
  console.error("Release asset validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Release asset validation passed: ${releaseDir}`);
