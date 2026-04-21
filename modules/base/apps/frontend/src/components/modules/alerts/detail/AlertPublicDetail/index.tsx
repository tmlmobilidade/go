'use client';

/* * */

import { AlertPublicDetailHeader } from '@/components/modules/alerts/detail/AlertPublicDetailHeader';
import { AlertPublicDetailLines } from '@/components/modules/alerts/detail/AlertPublicDetailLines';
import { AlertPublicDetailNotFound } from '@/components/modules/alerts/detail/AlertPublicDetailNotFound';
import { useAlertDetailPublicContext } from '@/contexts/AlertPublicDetail.context';
import { Section, Surface } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { AlertPublicDetailBody } from '../AlertPublicDetailBody';
import { AlertPublicDetailMeta } from '../AlertPublicDetailMeta';

/* * */

export function AlertPublicDetail() {
	//

	//
	// A. Setup variables

	const alertDetailPublicContext = useAlertDetailPublicContext();
	const alertData = alertDetailPublicContext.data.alert;
	const isNotFound = alertDetailPublicContext.flags.notFound;

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
