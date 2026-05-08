'use client';

import Button from '@/components/common/Button';
import { useEnvironmentContext } from '@/contexts/Environment.context';
import { Image } from '@mantine/core';
import { IconArrowUpRight } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import styles from './styles.module.css';

/* * */

interface Props {
	imageUrl: string
	title?: string
}

/* * */

export function AlertsDetailImageThumbnail({ imageUrl, title }: Props) {
	//

	//
	// A. Setup variables

	const t = useTranslations('alerts.AlertsDetailImageThumbnail');
	const environmentContext = useEnvironmentContext();

	//
	// B. Handle actions

	const handleOpenImage = () => {
		if (environmentContext.data.value === 'app-ios') {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(window as any).webkit.messageHandlers.onImageClick.postMessage(imageUrl);
		}
		if (environmentContext.data.value === 'app-android') {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(window as any).Android.onImageClick(imageUrl);
		}
		else {
			window.open(imageUrl, '_blank');
		}
	};

	//
	// C. Render components

	return (
		<>
			<Image alt={title} className={styles.image} src={imageUrl} />
			<Button icon={<IconArrowUpRight size={16} />} label={t('open_full_image')} onClick={handleOpenImage} variant="pill" />
		</>
	);

	//
}
