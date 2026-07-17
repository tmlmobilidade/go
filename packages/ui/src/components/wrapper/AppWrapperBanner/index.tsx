'use client';

import { IconAlertCircle, IconCircleCheck, IconInfoCircle, IconServerCog } from '@tabler/icons-react';
import { type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

export type AppWrapperBannerVariant = 'danger' | 'info' | 'success' | 'warning';

export interface AppWrapperBannerConfig {
	/** Short headline shown to users. */
	title: string
	/** Variant of the banner. */
	variant?: AppWrapperBannerVariant
}

/**
 * Set to a config object to show the app-wide announcement banner.
 * Set to `null` to hide it.
 */
export const APP_WRAPPER_BANNER: AppWrapperBannerConfig | null = {
	title: 'Manutenção programada — A partir das 16:00',
	variant: 'warning',
};

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
	// A. Setup variables

	const banner = null;

	//
	// B. Render components

	if (!banner) {
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
