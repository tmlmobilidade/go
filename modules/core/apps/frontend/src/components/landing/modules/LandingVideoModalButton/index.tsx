'use client';

import { IconPlayerPlayFilled } from '@tabler/icons-react';
import { Image } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { openLandingVideoModal } from '../LandingVideoModal';

/* * */

interface LandingVideoModalButtonProps {
	thumbnailSrc?: string
	videoSrc?: string
}

/* * */

export function LandingVideoModalButton({ thumbnailSrc, videoSrc }: LandingVideoModalButtonProps) {
	return (
		<div className={styles.container} onClick={() => openLandingVideoModal(videoSrc)}>
			<IconPlayerPlayFilled className={styles.icon} size={30} />
			<Image className={styles.image} fallbackSrc="/images/landing/video-modal-button.png" src={thumbnailSrc} />
		</div>
	);
}
