'use client';

import { closeModal, openModal, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { LandingSection } from '../../shared/LandingContainer';
import { LandingInfoBlock } from '../../shared/LandingInfoBlock';

/* * */

const MODAL_ID = 'extractions-list-modal';

/* * */

export const openLandingVideoModal = (videoSrc: string) => {
	openModal({
		children: (
			<LandingVideoModalContent videoSrc={videoSrc} />
		),
		closeOnClickOutside: true,
		closeOnEscape: true,
		fullScreen: true,
		modalId: MODAL_ID,
		padding: 0,
		styles: {
			body: { backgroundColor: 'transparent' },
			content: { backgroundColor: 'transparent' },
			overlay: { backdropFilter: 'blur(5px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
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
	//

	const { t } = useTranslation();

	return (
		<div className={styles.overlay} onClick={closeLandingVideoModal}>
			<LandingSection>
				<div className={styles.container}>
					<video className={styles.video} preload="metadata" autoPlay controls>
						<source src={videoSrc} type="video/mp4" />
					</video>
					<Section padding="lg">
						<LandingInfoBlock
							description={t('landing:LandingModules.intro.description')}
							title={t('landing:LandingModules.intro.title')}
						/>
						<LandingInfoBlock
							description={t('landing:LandingModules.intro.description')}
							title={t('landing:LandingModules.intro.title')}
						/>
					</Section>
				</div>
			</LandingSection>
		</div>
	);
}
