'use client';

import { enabledLocales, useLocaleContext } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function LandingOverviewI18n() {
	//

	//
	// A. Setup variables

	const localeContext = useLocaleContext();

	//
	// B. Render components

	return (
		<div className={styles.container}>
			{enabledLocales.map(item => (
				<div
					key={item._id}
					className={styles.locale}
					data-active={localeContext.data.locale === item._id}
					onClick={() => localeContext.actions.setLocale(item._id)}
				>
					{item.name}
				</div>
			))}
		</div>
	);
}
