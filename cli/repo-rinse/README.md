### @tmlmobilidade/repo-rinse 🧼

Repo Rinse is a simple CLI tool that scrubs your project clean by removing common build artifacts and lockfiles. It’s perfect for fresh starts, CI cleanup, or clearing out stale dev cruft.

This is sometimes required as large package-lock.json files may become out-of-sync after a lot of package updates.

#### What it removes:
- `node_modules/`
- `dist/`
- `.next/`
- `.turbo/`
- `.source/`
- `.yalc/`
- `.expo/`
- `package-lock.json`
- `pnpm-lock.yaml`
- `yalc.lock`

### ⚠️ WARNING

**This script removes files and directories. Use it with caution!**

Currently, the script deletes files and folders recursively from the directory where it is executed.

If you run it from `/` (root), it will remove **all** matching files and directories from your entire machine.

#### Usage:

**Always double-check your current working directory before running!**

```
npx @tmlmobilidade/repo-rinse
```