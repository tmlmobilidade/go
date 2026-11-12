'use client';

import { IconClock } from '@tabler/icons-react';
import { Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RuleTimepointCountProps {
	count: number
}

/* * */

/** Shared clock pill for the rule's number of schedules. */
export function RuleTimepointCount({ count }: RuleTimepointCountProps) {
	const { t } = useTranslation();

	return (
		<div className={styles.root}>
			<Tag
				icon={<IconClock size={16} />}
				label={t('default:scheduling.copy.timepointCount', '', { count })}
				variant="muted"
			/>
		</div>
	);
}
