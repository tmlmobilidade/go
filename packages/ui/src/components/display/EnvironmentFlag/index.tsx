/* * */

import { getCurrentEnvironment } from '@tmlmobilidade/types';

import styles from './styles.module.css';

/* * */

export function EnvironmentFlag() {
	//

	//
	// A. Setup variables

	const currentEnvironment = getCurrentEnvironment();

	//
	// B. Render components

	if (currentEnvironment === 'development') {
		return (
			<div className={styles.container} data-environment="development">
				<div className={styles.message}>dev</div>
			</div>
		);
	}

	if (currentEnvironment === 'staging') {
		return (
			<div className={styles.container} data-environment="staging">
				<div className={styles.message}>
					Staging
				</div>
			</div>
		);
	}

	return null;

	//
}
