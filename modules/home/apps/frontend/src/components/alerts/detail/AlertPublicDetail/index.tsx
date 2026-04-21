'use client';

/* * */

import { AlertPublicDetailBody } from '@/components/alerts/detail/AlertPublicDetailBody';
import { AlertPublicDetailHeader } from '@/components/alerts/detail/AlertPublicDetailHeader';
import { AlertPublicDetailLines } from '@/components/alerts/detail/AlertPublicDetailLines';
import { AlertPublicDetailMeta } from '@/components/alerts/detail/AlertPublicDetailMeta';
import { AlertPublicDetailNotFound } from '@/components/alerts/detail/AlertPublicDetailNotFound';
import { AlertsPublicListSkeleton } from '@/components/alerts/list/AlertsPublicListSkeleton';
import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

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

	if (isNotFound) {
		return <AlertPublicDetailNotFound />;
	}

	if (alertDetailContext.flags.loading || !alertData) {
		return (
			<div className={styles.headCardWrapper}>
				<AlertsPublicListSkeleton />
			</div>
		);
	}

	return (
		<Section>
			<div className={styles.headCardWrapper}>
				<AlertPublicDetailHeader />
				<div className={styles.headCard}>
					<h1 className={styles.title}>{alertData.title}</h1>
					<AlertPublicDetailMeta />
					<AlertPublicDetailLines />
				</div>
				<AlertPublicDetailBody />
			</div>
		</Section>
	);

	//
}
