'use client';

import { IconPlayerPlayFilled } from '@tabler/icons-react';
import { Image } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { openLandingVideoModal } from '../LandingVideoModal';

/* * */

interface LandingVideoModalButtonProps {
	className?: string
	thumbnailSrc?: string
	videoSrc?: string
}

/* * */

export function LandingVideoModalButton({ className, thumbnailSrc, videoSrc }: LandingVideoModalButtonProps) {
	return (
		<div className={className ? `${styles.container} ${className}` : styles.container} onClick={() => openLandingVideoModal(videoSrc)}>
			<IconPlayerPlayFilled className={styles.icon} color="#ffffff" size={30} />
			<Image className={styles.image} fallbackSrc="/images/landing/video-modal-button.png" src={thumbnailSrc} />
		</div>
	);
}
