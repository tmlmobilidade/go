/* * */

import Image from 'next/image';

import styles from './style.module.css';

/* * */

export function HeaderLogo() {
	//

	//
	// A. Render components

	return (
		<div className={styles.headerLogo}>
			<Image alt="Logo" height={25} src="/assets/brand/logo_tml.png" width={35} />
			<div className={styles.wordmark}>
				<p className={styles.headerLogoText}>GO</p>
				<div className={styles.statusPulse}>
					<span className={styles.statusRipple} />
					<span className={styles.statusRipple} />
					<span className={styles.statusDot} />
				</div>
			</div>
		</div>
	);

	//
}
