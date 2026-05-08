'use client';

import { IconArrowRight } from '@tabler/icons-react';
import { type Alert } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface AlertsListCellCauseEffectProps {
	cause: Alert['cause']
	effect: Alert['effect']
}

/* * */

export function AlertsListCellCauseEffect({ cause, effect }: AlertsListCellCauseEffectProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<Tag label={t(`shared:alerts.causes.${cause}.title`)} />
			<IconArrowRight opacity={0.5} size={14} stroke={3} />
			<Tag label={t(`shared:alerts.effects.${effect}.title`)} />
		</div>
	);

	//
}
