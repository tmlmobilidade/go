'use client';

import { CloseButton, closeModal, openModal } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { LandingMap } from '../LandingMap';

/* * */

const MODAL_ID = 'landing-map-modal';

/* * */

export const openLandingMapModal = () => {
	openModal({
		children: <LandingMapModalContent />,
		closeOnClickOutside: true,
		closeOnEscape: true,
		fullScreen: true,
		modalId: MODAL_ID,
		padding: 0,
		styles: {
			body: { backgroundColor: 'transparent', height: '100%' },
			content: { backgroundColor: 'transparent' },
			overlay: { backdropFilter: 'blur(5px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
		},
		withCloseButton: false,
	});
};

/* * */

export const closeLandingMapModal = () => {
	closeModal(MODAL_ID);
};

/* * */

export function LandingMapModalContent() {
	//

	const { t } = useTranslation();

	return (
		<div className={styles.overlay} onClick={closeLandingMapModal}>
			<div className={styles.container} onClick={event => event.stopPropagation()}>
				<div className={styles.close}>
					<CloseButton ariaLabel={t('landing:LandingMap.close')} onClick={closeLandingMapModal} type="close" />
				</div>
				<LandingMap fitToVehicles interactive />
			</div>
		</div>
	);

	//
}
