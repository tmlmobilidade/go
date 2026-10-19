'use client';

/* * */

import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function ViewportHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<p className={styles.title}>{t('default:viewport.ViewportHeader.title')}</p>
		</div>
	);

	//
}
