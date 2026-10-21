/* * */

/** Whether both arrays contain the same agency IDs, regardless of order. */
export function haveSameAgencies(first: string[], second: string[]) {
	if (first.length !== second.length) return false;
	const sortedFirst = [...first].sort();
	const sortedSecond = [...second].sort();
	return sortedFirst.every((id, index) => id === sortedSecond[index]);
}
