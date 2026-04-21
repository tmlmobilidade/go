/* * */

import styles from './style.module.css';

/* * */

export function LiveIcon() {
	return (
		<div className={styles.container}>
			<div className={styles.ripple} />
			<div className={styles.dot} />
		</div>
	);
}
