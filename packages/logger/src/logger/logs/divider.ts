export function divider(message?: string, size = 75): void {
	console.log();
	if (message) console.log(`- ${message} ${'-'.repeat(size - 2 - message.length < 1 ? 1 : size - 2 - message.length)}`);
	else console.log('-'.repeat(size));
	console.log();
}
