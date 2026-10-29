'use client';

/* * */

import { IconAlertCircle, IconServerCog, IconSpeakerphone, IconX } from '@tabler/icons-react';
import { type BannerKind, type BannerPlatformResponse } from '@tmlmobilidade/go-types-core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export const BANNER_KIND_ICONS: Record<BannerKind, typeof IconAlertCircle> = {
	announcement: IconSpeakerphone,
	incident: IconAlertCircle,
	maintenance: IconServerCog,
};

interface BannerNoticeProps {
	banner: Pick<BannerPlatformResponse, 'dismissible' | 'ends_at' | 'kind' | 'link' | 'message' | 'severity' | 'starts_at' | 'title'>
	onDismiss?: () => void
}

/* * */

export function BannerNotice({ banner, onDismiss }: BannerNoticeProps) {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation();
	const [isExpanded, setIsExpanded] = useState(false);
	const KindIcon = BANNER_KIND_ICONS[banner.kind];

	const formatTime = (value: number) => new Date(value).toLocaleString(i18n.resolvedLanguage, { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Lisbon' });

	const schedule = banner.ends_at && t('shared:components.banner.until', '', { end: formatTime(banner.ends_at) });

	//
	// B. Render components

	return (
		<div className={styles.root} data-expanded={isExpanded} data-severity={banner.severity} role="status">
			<KindIcon className={styles.icon} size={18} aria-hidden />
			<button aria-expanded={isExpanded} className={styles.summary} onClick={() => setIsExpanded(value => !value)} type="button">
				<span className={styles.title}>{banner.title}</span>
				<span className={styles.message}>{banner.message}</span>
			</button>
			{schedule && <span className={styles.schedule}>{schedule}</span>}
			{banner.link && (
				<a className={styles.link} href={banner.link.url} rel="noopener noreferrer" target="_blank">
					{banner.link.label}
				</a>
			)}
			{banner.dismissible && (
				<button aria-label={t('shared:components.banner.dismiss')} className={styles.dismiss} disabled={!onDismiss} onClick={onDismiss} type="button">
					<IconX size={16} />
				</button>
			)}
		</div>
	);
}
