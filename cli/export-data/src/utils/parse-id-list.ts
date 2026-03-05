/* * */

// Parses "id1,id2,start-end" into a flat list of IDs; expands ranges (e.g. 1001-1003)
export function parseIdListWithRanges(input: string, digits: 4 | 6): string[] {
	const re = new RegExp(`^(\\d{${digits}})-(\\d{${digits}})$`);
	const parts = input.replace(/,$/, '').split(',').map(id => id.trim());
	const result: string[] = [];
	for (const part of parts) {
		const m = part.match(re);
		if (m) {
			const lo = Number(m[1]);
			const hi = Number(m[2]);
			for (let n = lo; n <= hi; n++) result.push(String(n).padStart(digits, '0'));
		} else {
			result.push(part);
		}
	}
	return result;
}

// Returns an error message if the value is invalid, otherwise undefined
export function validateIdListWithRanges(value: string, digits: 4 | 6): string | undefined {
	const re = new RegExp(`^(\\d{${digits}})-(\\d{${digits}})$`);
	const singleRe = new RegExp(`^\\d{${digits}}$`);
	const parts = value.replace(/,$/, '').split(',').map(id => id.trim());
	for (const part of parts) {
		const m = part.match(re);
		if (m) {
			if (Number(m[1]) > Number(m[2])) return `Intervalo inválido: ${part}`;
		} else if (!singleRe.test(part)) {
			return `ID ou intervalo inválido: ${part}`;
		}
	}
	return undefined;
}
