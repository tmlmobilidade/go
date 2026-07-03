/**
 * Trim monorepo workspace package trees for lean Docker (or similar) copies.
 *
 * Context
 * -------
 * Workspace members often ship built artifacts under `dist/` plus a `package.json`
 * for resolution/entrypoints. Everything else in that package directory (sources,
 * tests, configs, extra tooling) is usually unnecessary at runtime in a container.
 * This script walks selected roots and, for each directory that looks like a built
 * workspace package, deletes all siblings except `package.json`, `dist/`,
 * `assets/`, and `public/`.
 *
 * Roots
 * -------
 * Pass zero or more directory paths as CLI arguments after `node trim-workspaces.js`.
 * If none are given, defaults to `packages` and `modules` (relative to CWD).
 *
 * Algorithm
 * -----------
 * 1. For each root, depth-first walk the filesystem (directories only; symlinks are
 *    not followed).
 * 2. At each directory, read immediate children. A directory is treated as a
 *    "workspace package" when it contains BOTH:
 *    - a regular file named `package.json`, and
 *    - a subdirectory named `dist/`.
 * 3. If it is a workspace package, remove every child whose name is NOT in the keep
 *    list (`package.json`, `dist`, `assets`, `public`; recursive `rm` with `force`,
 *    so nested trees disappear entirely).
 * 4. Re-read the directory (so subsequent logic sees only what remains), then recurse
 *    into subdirectories (again skipping symlinks). Non-workspace directories are only
 *    recursed into; nothing is deleted there.
 *
 * Safety / behavior notes
 * -------------------------
 * - Only deletes inside directories that match the `package.json` + `dist` heuristic;
 *   arbitrary folders under the roots are left intact aside from recursion.
 * - Errors reading a directory (permissions, race, etc.) are swallowed: that branch
 *   is skipped with no log output.
 * - Intended to be run from the repo root (or wherever those roots exist); paths are
 *   relative unless absolute argv paths are passed.
 */

import fs from "node:fs";
import path from "node:path";

const ROOTS = process.argv.length > 2
	? process.argv.slice(2)
	: ["packages", "packages-new", "modules"];
const KEEP_ENTRIES = new Set(["package.json", "dist", "assets", "public"]);

function walk(dir) {
	let entries = [];
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	}
	catch {
		return;
	}

	const hasPackageJson = entries.some(
		(entry) => entry.isFile() && entry.name === "package.json",
	);
	const hasDistDir = entries.some(
		(entry) => entry.isDirectory() && entry.name === "dist",
	);
	const isWorkspacePackage = hasPackageJson && hasDistDir;

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
