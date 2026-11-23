'use client';

import { IconHandClick } from '@tabler/icons-react';
import { CalendarAffectedDaysCount, CloseButton, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { closeRulesCalendarPreviewModal } from '../RulesCalendarPreview.modal';

/* * */

export function RulesCalendarPreviewHeader({ affectedDayCount }: { affectedDayCount: number }) {
	const { t } = useTranslation();

	return (
		<div className={styles.header}>
			<CloseButton onClick={closeRulesCalendarPreviewModal} type="close" />
			<div className={styles.hint}>
				<IconHandClick size={20} />
				<Text c="dimmed" size="sm">{t('default:scheduling.copy.dayDetailsHint')}</Text>
			</div>
			<CalendarAffectedDaysCount count={affectedDayCount} layout="inline" />
		</div>
	);
}
