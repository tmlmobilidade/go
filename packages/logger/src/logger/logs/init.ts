export function init() {
	const currentDate = new Date().toISOString();
	console.log();
	console.log('-'.repeat(currentDate.length));
	console.log(currentDate);
	console.log('-'.repeat(currentDate.length));
	console.log();
}
