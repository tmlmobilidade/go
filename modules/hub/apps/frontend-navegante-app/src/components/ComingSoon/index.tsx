'use client';

import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export function ComingSoon() {
	//

	const { data: appEnabled } = useSWR<{ app_enabled: boolean }>({ credentials: 'omit', url: 'https://storage.carrismetropolitana.pt/static/navegante/flag.json', useProperApiResponse: false }, { refreshInterval: 5_000 });

	//

	return (
		<div className={styles.container} data-app-enabled={appEnabled?.app_enabled ?? false}>
			<h1>Disponível em breve</h1>
			<p>Fique atento às novidades nas nossas redes!</p>
			<p className={styles.dismiss}>dimsiss</p>
		</div>
	);
}
