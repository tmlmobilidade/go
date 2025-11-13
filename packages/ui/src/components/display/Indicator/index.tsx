/* * */

import styles from './styles.module.css';

/* * */

interface IndicatorProps {
	filled?: boolean
	variant?: 'danger' | 'muted' | 'primary' | 'secondary' | 'success' | 'warning'
}

/* * */

export function Indicator({ filled = false, variant = 'primary' }: IndicatorProps) {
	return (
		<div className={styles.root} data-filled={filled} data-variant={variant}>
			<div className={styles.indicator} />
		</div>
	);
}
