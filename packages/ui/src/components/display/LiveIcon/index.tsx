/* * */

import styles from './styles.module.css';

/* * */

export interface LiveIconProps {
	color?: string
}

/* * */

export function LiveIcon({ color = 'var(--color-primary)' }: LiveIconProps) {
	return (
		<span className={styles.root}>
			<span className={styles.ripple} style={{ backgroundColor: color }} />
			<span className={styles.dot} style={{ backgroundColor: color }} />
		</span>
	);
}
