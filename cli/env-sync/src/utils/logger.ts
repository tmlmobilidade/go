import chalk from 'chalk';

let verboseMode = false;

function getTimestamp(): string {
	return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

export const logger = {
	setVerbose(enabled: boolean) {
		verboseMode = enabled;
	},
	isVerbose() {
		return verboseMode;
	},
	clearPreviousLine() {
		process.stdout.clearLine(0);
		process.stdout.cursorTo(0);
	},
	error(...args: unknown[]) {
		console.error(chalk.red(`[ERROR]`), ...args);
	},
	info(...args: unknown[]) {
		console.log(chalk.green(`[${getTimestamp()}]`), ...args);
	},
	log(...args: unknown[]) {
		console.log(...args);
	},
	success(...args: unknown[]) {
		console.log(chalk.green(`[${getTimestamp()}]`), ...args);
	},
	verbose(...args: unknown[]) {
		if (verboseMode) {
			console.log(chalk.dim(`[VERBOSE]`), ...args);
		}
	},
	warn(...args: unknown[]) {
		console.log(chalk.yellow(`[WARNING]`), ...args);
	},
};
