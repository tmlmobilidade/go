/* * */

import styles from './style.module.css';

/* * */

interface LiveIconProps {
	color?: string
}

/* * */

export function LiveIcon({ color = 'var(--color-status-live-primary)' }: LiveIconProps) {
	return (
		<div className={styles.container}>
			<div className={styles.ripple} style={{ backgroundColor: color }} />
			<div className={styles.dot} style={{ backgroundColor: color }} />
		</div>
	);
}
