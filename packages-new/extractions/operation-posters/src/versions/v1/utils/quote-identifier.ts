/* * */

export function quoteIdentifier(name: string): string {
	return `"${name.replaceAll('"', '""')}"`;
}
