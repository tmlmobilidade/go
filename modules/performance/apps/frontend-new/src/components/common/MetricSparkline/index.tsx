/* * */

import styles from './styles.module.css';

/* * */

export type MetricSparklineTone = 'accent' | 'primary' | 'success' | 'warning';

interface MetricSparklineProps {
	data: number[]
	tone?: MetricSparklineTone
}

/* * */

export function MetricSparkline({ data, tone = 'primary' }: MetricSparklineProps) {
	//

	//
	// A. Transform data

	const minimum = Math.min(...data);
	const maximum = Math.max(...data);
	const range = maximum - minimum || 1;
	const points = data.map((value, index) => {
		const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
		const y = 36 - ((value - minimum) / range) * 30;
		return `${x},${y}`;
	}).join(' ');

	//
	// B. Render components

	return (
		<svg aria-hidden="true" className={styles.root} data-tone={tone} preserveAspectRatio="none" viewBox="0 0 100 42">
			<polyline className={styles.line} fill="none" points={points} vectorEffect="non-scaling-stroke" />
		</svg>
	);

	//
}
