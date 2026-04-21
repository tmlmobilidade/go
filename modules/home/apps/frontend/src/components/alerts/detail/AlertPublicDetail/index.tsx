'use client';

/* * */

import { AlertPublicDetailHeader } from '@/components/alerts/detail/AlertPublicDetailHeader';
import { AlertPublicDetailLines } from '@/components/alerts/detail/AlertPublicDetailLines';
import { AlertPublicDetailNotFound } from '@/components/alerts/detail/AlertPublicDetailNotFound';
import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { Section, Surface } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { AlertPublicDetailBody } from '../AlertPublicDetailBody';
import { AlertPublicDetailMeta } from '../AlertPublicDetailMeta';

/* * */

export function AlertPublicDetail() {
	//

	//
	// A. Setup variables

	const alertDetailContext = useAlertDetailContext();
	const alertData = alertDetailContext.data.alert;
	const isNotFound = alertDetailContext.flags.notFound;

	//
	// B. Render components

	if (isNotFound || !alertData) {
		return <AlertPublicDetailNotFound />;
	}

	return (
		<Surface>
			<Section gap="lg">
				<AlertPublicDetailHeader />
				<div className={styles.headCard}>
					<h1 className={styles.title}>{alertData.title}</h1>
					<AlertPublicDetailMeta />
					<AlertPublicDetailLines />
				</div>
				<AlertPublicDetailBody />
			</Section>
		</Surface>
	);

	//
}
