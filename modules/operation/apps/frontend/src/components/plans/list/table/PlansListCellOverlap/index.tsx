'use client';

import { IconAlertTriangle } from '@tabler/icons-react';
import { Tooltip } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function PlansListCellOverlap({ value }: { value: boolean }) {
	const { t } = useTranslation();
	const overlapWarning = t('default:plans.list.PlansListCellOverlap.overlap_warning');

	if (!value) return null;

	return (
		<Tooltip events={{ focus: true, hover: true, touch: true }} label={overlapWarning}>
			<span aria-label={overlapWarning} className={styles.warning} role="img" tabIndex={0}>
				<IconAlertTriangle size={18} aria-hidden />
			</span>
		</Tooltip>
	);
}
