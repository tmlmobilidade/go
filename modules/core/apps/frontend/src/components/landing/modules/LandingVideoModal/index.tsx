'use client';

import { closeModal, openModal } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

const MODAL_ID = 'extractions-list-modal';

/* * */

export const openLandingVideoModal = (videoSrc: string) => {
	openModal({

		centered: true,
		children: (
			<LandingVideoModalContent videoSrc={videoSrc} />
		),
		closeOnClickOutside: true,
		closeOnEscape: true,
		modalId: MODAL_ID,
		padding: 0,
		size: 'auto',
		styles: {
			content: { backgroundColor: 'transparent' },
		},
		withCloseButton: false,
	});
};

/* * */

export const closeLandingVideoModal = () => {
	closeModal(MODAL_ID);
};

/* * */

interface LandingVideoModalContentProps {
	videoSrc: string
}

export function LandingVideoModalContent({ videoSrc }: LandingVideoModalContentProps) {
	return (
		<video className={styles.video} preload="metadata" autoPlay controls>
			<source src={videoSrc} type="video/mp4" />
		</video>
	);
}
