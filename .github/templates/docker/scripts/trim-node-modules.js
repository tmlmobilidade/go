import fs from "node:fs";
import path from "node:path";

const SKIP_DIRS = new Set([".bin"]);
const PRUNE_DIRS = new Set([
	"__tests__",
	"test",
	"tests",
	"docs",
	"doc",
	"example",
	"examples",
	"coverage",
	".github",
	".vscode",
]);
const ROOT = process.argv[2] || "node_modules";

const stack = [ROOT];

while (stack.length > 0) {
	const current = stack.pop();
	if (!current) continue;

	let entries = [];
	try {
		entries = fs.readdirSync(current, { withFileTypes: true });
	}
	catch {
		continue;
	}

	for (const entry of entries) {
		if (SKIP_DIRS.has(entry.name)) continue;

		const fullPath = path.join(current, entry.name);

		if (entry.isSymbolicLink()) continue;

		if (entry.isDirectory()) {
			if (PRUNE_DIRS.has(entry.name)) {
				fs.rmSync(fullPath, { recursive: true, force: true });
				continue;
			}

			stack.push(fullPath);
			continue;
		}

		if (
			entry.isFile() &&
			(
				/\.md$/i.test(entry.name) ||
				/\.markdown$/i.test(entry.name) ||
				/\.map$/i.test(entry.name) ||
				entry.name === "LICENSE" ||
				entry.name === "LICENSE.md" ||
				entry.name === "CHANGELOG.md"
			)
		) {
			fs.rmSync(fullPath, { force: true });
		}
	}
}
