/**
 * Utility function that returns a humanized version of a string.
 * @param value The string to humanize. Ex: `ThisIsAString`
 * @returns The humanized string. Ex: `This Is A String`
 */
export function humanize(value: string) {
	const str = value
		.replace(/([a-z\d])([A-Z]+)/g, '$1 $2')
		.replace(/\W|_/g, ' ')
		.trim()
		.toLowerCase();
	return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}
