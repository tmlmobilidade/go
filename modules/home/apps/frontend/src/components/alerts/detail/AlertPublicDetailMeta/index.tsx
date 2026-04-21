'use client';
/* * */

import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { Description, Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function AlertPublicDetailMeta() {
	//
	// A. Setup variables

	const { t } = useTranslation();
	const alertDetailContext = useAlertDetailContext();

	//
	// B. Render components

	return (
		<div className={styles.metaRow}>
			<Tag label={t(`shared:alerts.causes.${alertDetailContext.data.alert?.cause}.title`)} variant="danger" />
			<Tag label={t(`shared:alerts.effects.${alertDetailContext.data.alert?.effect}.title`)} variant="warning" />
			<Description>Início: {alertDetailContext.data.activePeriodStart}</Description>
		</div>
	);

	//
}
