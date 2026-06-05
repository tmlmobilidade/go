/**
 * Prune bulky, non-runtime content from a `node_modules` tree (or any dependency root).
 *
 * Purpose
 * -------
 * Production images and deployment bundles often need installed packages to execute,
 * but not documentation, source maps, test suites, or editor metadata. This script
 * performs a conservative, name-based cleanup: it removes known "heavy but usually
 * optional" subtrees and files while preserving the dependency graph and executables
 * under `.bin/`.
 *
 * CLI
 * -----
 * `node trim-node-modules.js [root]`
 * - `root`: directory to walk; defaults to `node_modules` (relative to CWD).
 *   Can be an absolute path.
 *
 * Traversal
 * -----------
 * Iterative depth-first walk using an explicit stack (avoids deep recursion limits).
 * Symbolic links are never followed: symlink entries are skipped entirely so linked
 * targets outside the tree are not traversed or deleted.
 *
 * Directory rules
 * ---------------
 * - `.bin`: never entered and never removed. Skipping traversal here keeps npm/pnpm/yarn
 *   shim scripts and their wiring intact while still allowing cleanup inside the
 *   packages those shims point at (when those targets live under the same `root`).
 * - `assets`: never entered and never removed. Many packages ship runtime images, fonts,
 *   or other static files under an `assets/` subtree that must survive pruning.
 * - If a subdirectory's basename matches any of the prune list, the entire directory
 *   is removed recursively (`rm` with `force`) and not descended into. Names are
 *   exact, case-sensitive matches: `__tests__`, `test`, `tests`, `docs`, `doc`,
 *   `example`, `examples`, `coverage`, `.github`, `.vscode`.
 *
 * File rules
 * ----------
 * At leaf files (non-directories), delete when basename matches:
 * - ends with `.md` or `.markdown` (case-insensitive),
 * - ends with `.map` (source maps),
 * - exactly `LICENSE`, `LICENSE.md`, or `CHANGELOG.md`.
 * Other files are left unchanged (including minified `.js`, binaries, JSON, etc.).
 *
 * Limitations
 * -----------
 * - Heuristic only: does not parse `package.json` "files" fields; may leave other
 *   optional assets (e.g. `.ts` sources) if not under a pruned directory name.
 * - Skipped/unreadable directories: read errors are ignored; that path is skipped.
 * - Run from the intended root; deleting wrong `root` is destructive.
 */

import fs from "node:fs";
import path from "node:path";

const SKIP_DIRS = new Set([".bin", "assets"]);
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
