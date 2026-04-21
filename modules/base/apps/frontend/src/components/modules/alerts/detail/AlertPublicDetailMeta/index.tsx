'use client';

/* * */

import { useAlertDetailPublicContext } from '@/contexts/AlertPublicDetail.context';
import { Description, Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function AlertPublicDetailMeta() {
	//
	// A. Setup variables

	const { t } = useTranslation();
	const alertDetailPublicContext = useAlertDetailPublicContext();

	//
	// B. Render components

	return (
		<div className={styles.metaRow}>
			<Tag label={t(`shared:alerts.causes.${alertDetailPublicContext.data.alert?.cause}.title`)} variant="danger" />
			<Tag label={t(`shared:alerts.effects.${alertDetailPublicContext.data.alert?.effect}.title`)} variant="warning" />
			<Description>Início: {alertDetailPublicContext.data.activePeriodStart}</Description>
		</div>
	);

	//
}
