/* * */

import styles from './styles.module.css';

/* * */

export function LandingHeaderLogo() {
	return (
		<div className={styles.container}>
			<p className={styles.text}>GO</p>
			<div className={styles.liveIcon}>
				<div className={styles.ripple} />
				<div className={styles.dot} />
			</div>
		</div>
	);
}
