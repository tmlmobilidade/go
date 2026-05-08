'use client';

import { Tooltip } from '@tmlmobilidade/ui';
import { DateTime } from 'luxon';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import styles from './style.module.css';

/* * */

interface Props {
	className?: string
	color?: string
	updatedAt?: Date | string
}

/* * */

// TODO: maybe move to UI package

export function LiveIcon({ className, color = 'var(--color-primary)', updatedAt }: Props) {
	//

	// A. Setup variables

	const t = useTranslations('updated_at');

	//
	// B. Transform data

	const lastUpdatedText = useMemo(() => {
		if (!updatedAt) return '';

		const now = DateTime.now();

		const updatedAtDate = typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt;
		const updated = DateTime.fromJSDate(updatedAtDate).setZone('Europe/Lisbon');

		const diffInMinutes = Math.floor(now.diff(updated, 'minutes').minutes);

		let relativeText = '';

		if (diffInMinutes < 1) relativeText = t('just_now'); // “Just now”
		else if (diffInMinutes < 60) relativeText = t('minutes', { count: diffInMinutes }); // “X minutes ago”
		else if (diffInMinutes < 1440) relativeText = t('hours', { count: Math.floor(diffInMinutes / 60) }); // “X hours ago”
		else relativeText = t('days', { count: Math.floor(diffInMinutes / 1440) }); // “X days ago”

		return t('relative', { value: relativeText });
	}, [updatedAt, t]);

	// C. Render components

	const content = (
		<div className={`${styles.container} ${className || ''}`}>
			<div className={styles.ripple} style={{ backgroundColor: color }} />
			<div className={styles.dot} style={{ backgroundColor: color }} />
		</div>
	);

	if (!lastUpdatedText) {
		return content;
	}

	return (
		<Tooltip label={lastUpdatedText} position="top">
			{content}
		</Tooltip>
	);
}
