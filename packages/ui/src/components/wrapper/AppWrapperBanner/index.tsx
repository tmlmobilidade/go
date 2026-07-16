'use client';

import { IconAlertCircle, IconCircleCheck, IconInfoCircle, IconServerCog } from '@tabler/icons-react';
import { type ReactNode } from 'react';

import styles from './styles.module.css';

import { Surface } from '../../layout/Surface';

/* * */

export type AppWrapperBannerVariant = 'danger' | 'info' | 'success' | 'warning';

export interface AppWrapperBannerConfig {

	/**
	 * Short headline shown to users.
	 */
	title: string

	/**
	 * Variant of the banner.
	 */
	variant: AppWrapperBannerVariant

}

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

	const banner: AppWrapperBannerConfig | null = {
		title: 'Manutenção programada — A partir das 16:00',
		variant: 'danger',
	};

	//
	// B. Render components

	if (!banner) {
		return null;
	}

	return (
		<Surface>
			<div className={styles.root} data-variant={banner.variant} role="status">
				{VARIANT_ICONS[banner.variant]}
				<p className={styles.title}>{banner.title}</p>
			</div>
		</Surface>
	);
}
