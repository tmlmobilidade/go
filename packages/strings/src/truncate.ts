/**
 * Truncates a string to a specified length and adds ellipsis if necessary.
 * @param str The string to truncate.
 * @param length The maximum length of the truncated string.
 * @returns The truncated string with ellipsis if it exceeds the specified length, or the original string if it does not.
 */
export const truncate = (str: null | string, length: number): null | string => {
	if (!str || str.length <= length) return str;
	return `${str.slice(0, length - 3)}...`;
};
