import { execSync } from 'node:child_process';

const TRUNK_BRANCHES = new Set(['main', 'master', 'develop', 'production', 'prd']);
const BRANCH_PATTERN =
	/^(feature|feat|bugfix|fix|hotfix|release|chore)\/([a-z0-9]+(?:\.[a-z0-9]+)*(?:-[a-z0-9]+(?:\.[a-z0-9]+)*)*)$/;

const EXAMPLES = [
	'feature/add-login-page',
	'feat/issue-123-new-login',
	'fix/header-bug',
	'hotfix/security-patch',
	'release/v1.2.0',
	'chore/update-dependencies'
];

function getCurrentBranch() {
	try {
		return execSync('git symbolic-ref --quiet --short HEAD || git rev-parse --abbrev-ref HEAD', {
			encoding: 'utf8',
			shell: true
		}).trim();
	}
	catch (error) {
		// In some edge cases (e.g. very first commit), skip validation.
		process.exit(0);
	}
}

const currentBranch = getCurrentBranch();

if (TRUNK_BRANCHES.has(currentBranch)) {
	process.exit(0);
}

if (BRANCH_PATTERN.test(currentBranch)) {
	process.exit(0);
}

console.error(`Invalid branch name "${currentBranch}".`);
console.error('Use Conventional Branch format: <type>/<description>.');
console.error('Allowed types: feature, feat, bugfix, fix, hotfix, release, chore.');
console.error('Allowed trunk branches: main, master, develop, production, prd.');
console.error('Description rules: lowercase letters/numbers, hyphens; dots allowed inside tokens (ex: v1.2.0).');
console.error('Examples:');
for (const example of EXAMPLES) {
	console.error(`  - ${example}`);
}
process.exit(1);
