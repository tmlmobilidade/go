'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export function ComingSoon() {
	//

	const { data: appEnabled } = useSWR<{ app_enabled: boolean }>({ credentials: 'omit', url: API_ROUTES.hub.DEBUG_APP_ENABLED, useProperApiResponse: false }, { refreshInterval: 5_000 });

	console.log(appEnabled);

	//

	return (
		<div className={styles.container} data-app-enabled={appEnabled?.app_enabled || false}>
			<h1>Disponível em breve</h1>
			<p>Fique atento às novidades nas nossas redes!</p>
		</div>
	);
}
