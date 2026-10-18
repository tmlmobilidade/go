'use client';

import { IconPlayerPlayFilled } from '@tabler/icons-react';
import { Modal } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { LandingHeader } from '../../header/LandingHeader';
import { LandingMap } from '../../map/LandingMap';
import { LandingModulesInfrastructure } from '../../modules/LandingModulesInfrastructure';
import { LandingModulesIntro } from '../../modules/LandingModulesIntro';
import { LandingOverview } from '../../overview/LandingOverview';

/* * */

export function LandingPage() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

	//
	// B. Render components

	return (
		<>
			<main className={styles.root}>
				<LandingHeader />
				<LandingMap />
				<LandingOverview />
				<LandingModulesIntro />
				<LandingModulesInfrastructure />
			</main>

			<Modal onClose={() => setIsVideoModalOpen(false)} opened={isVideoModalOpen} size="xl" title={t('unauthenticated:LandingPage.modules.video_title')} centered>
				<video className={styles.video} preload="metadata" autoPlay controls>
					<source src="https://storage.carrismetropolitana.pt/static/app/assets/widgets/app-widget-lines.mp4" type="video/mp4" />
				</video>
			</Modal>
		</>
	);
}
