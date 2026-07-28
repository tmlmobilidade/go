/* * */

const decimalFormatter = new Intl.NumberFormat('pt-PT', {
	maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat('pt-PT', {
	maximumFractionDigits: 0,
});

/* * */

export function formatDecimal(value: number) {
	return decimalFormatter.format(value);
}

export function formatInteger(value: number) {
	return integerFormatter.format(value);
}

export function formatMinutesAsDuration(value: number) {
	const totalSeconds = Math.round(value * 60);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return `${minutes}m ${seconds}s`;
}

export function formatPercentage(value: null | number, maximumFractionDigits = 2) {
	if (value === null) return '—';

	return `${Intl.NumberFormat('pt-PT', { maximumFractionDigits }).format(value)}%`;
}

export function getPercentage(numerator: number, denominator: number) {
	if (denominator === 0) return null;

	return numerator / denominator * 100;
}
