import fs from "node:fs";
import path from "node:path";

const ROOTS = process.argv.length > 2
	? process.argv.slice(2)
	: ["packages", "modules"];
const KEEP_ENTRIES = new Set(["package.json", "dist"]);

function walk(dir) {
	let entries = [];
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	}
	catch {
		return;
	}

	const isWorkspacePackage = entries.some(
		(entry) => entry.isFile() && entry.name === "package.json",
	);

	if (isWorkspacePackage) {
		for (const entry of entries) {
			if (KEEP_ENTRIES.has(entry.name)) continue;

			fs.rmSync(path.join(dir, entry.name), { recursive: true, force: true });
		}

		entries = fs.readdirSync(dir, { withFileTypes: true });
	}

	for (const entry of entries) {
		if (entry.isSymbolicLink() || !entry.isDirectory()) continue;

		walk(path.join(dir, entry.name));
	}
}

for (const root of ROOTS) {
	walk(root);
}
