/* * */

import { type PassengerDemandTrendPoint } from '@tmlmobilidade/go-types-public-info';

import styles from './styles.module.css';

/* * */

interface Props {
	points: PassengerDemandTrendPoint[]
}

/* * */

function toPath(values: number[], minimum: number, range: number) {
	return values
		.map((value, index) => {
			const x = values.length === 1 ? 0 : index / (values.length - 1) * 100;
			const y = 22 - (value - minimum) / range * 20;
			return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
		})
		.join(' ');
}

function toPoint(value: number, index: number, count: number, minimum: number, range: number) {
	const x = count === 1 ? 0 : index / (count - 1) * 100;
	const y = 22 - (value - minimum) / range * 20;
	return `${x.toFixed(2)} ${y.toFixed(2)}`;
}

/* * */

export function MetricSparkline({ points }: Props) {
	if (points.length < 2) return null;

	const values = points.flatMap(point => [
		point.passenger_validations_qty,
		...(point.typical ? [point.typical.lower, point.typical.upper] : []),
	]);
	const minimum = Math.min(...values);
	const maximum = Math.max(...values);
	const range = Math.max(1, maximum - minimum);
	const currentPath = toPath(
		points.map(point => point.passenger_validations_qty),
		minimum,
		range,
	);
	const hasTypical = points.every(point => point.typical !== null);
	const upperPoints = points.map((point, index) =>
		toPoint(point.typical?.upper ?? 0, index, points.length, minimum, range),
	);
	const lowerPoints = points
		.map((point, index) =>
			toPoint(point.typical?.lower ?? 0, index, points.length, minimum, range),
		)
		.reverse();
	const typicalBandPath = hasTypical
		? `M ${upperPoints.join(' L ')} L ${lowerPoints.join(' L ')} Z`
		: null;

	return (
		<svg
			aria-hidden="true"
			className={styles.root}
			preserveAspectRatio="none"
			viewBox="0 0 100 24"
		>
			{typicalBandPath && <path className={styles.typicalBand} d={typicalBandPath} />}
			<path className={styles.currentLine} d={currentPath} />
		</svg>
	);
}
