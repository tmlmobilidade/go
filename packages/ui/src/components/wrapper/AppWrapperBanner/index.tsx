'use client';

import { IconAlertCircle, IconCircleCheck, IconInfoCircle, IconServerCog } from '@tabler/icons-react';
import { type AppConfigBannerVariant } from '@tmlmobilidade/go-types-core';
import { type ReactNode } from 'react';

import styles from './styles.module.css';

import { Surface } from '../../layout/Surface';
import { useAppConfigBannerData } from './use-app-config-banner-data';

/* * */

const VARIANT_ICONS: Record<AppConfigBannerVariant, ReactNode> = {
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

	const { data } = useAppConfigBannerData();

	//
	// B. Render components

	if (!data?.enabled || !data?.title) {
		return null;
	}

	return (
		<Surface>
			<div className={styles.root} data-variant={data.variant} role="status">
				{VARIANT_ICONS[data.variant]}
				<p className={styles.title}>{data.title}</p>
			</div>
		</Surface>
	);
}
