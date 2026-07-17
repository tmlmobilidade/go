'use client';

import { IconAlertCircle, IconCircleCheck, IconInfoCircle, IconServerCog } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AppBanner, type AppBannerVariant } from '@tmlmobilidade/types';
import { type ReactNode } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export type AppWrapperBannerVariant = AppBannerVariant;

/* * */

const VARIANT_ICONS: Record<AppWrapperBannerVariant, ReactNode> = {
	danger: <IconAlertCircle size={18} />,
	info: <IconInfoCircle size={18} />,
	success: <IconCircleCheck size={18} />,
	warning: <IconServerCog size={18} />,
};

/* * */

export function AppWrapperBanner() {
	//

	//
	// A. Fetch data

	const { data: banner } = useSWR<AppBanner | null, Error>(API_ROUTES.auth.APP_CONFIGS_APP_WRAPPER_BANNER, {
		refreshInterval: 60_000,
	});

	//
	// B. Render components

	if (!banner?.enabled || !banner.title) {
		return null;
	}

	const variant = banner.variant ?? 'info';

	return (
		<div className={styles.root} data-variant={variant} role="status">
			<div className={styles.accent} aria-hidden />
			<div className={styles.icon} aria-hidden>
				{VARIANT_ICONS[variant]}
			</div>
			<p className={styles.title}>{banner.title}</p>
		</div>
	);

	//
}
