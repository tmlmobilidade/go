'use client';

import { IconPlayerPlayFilled } from '@tabler/icons-react';
import { Modal } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { LandingHeader } from '../../header/LandingHeader';
import { LandingMap } from '../../map/LandingMap';
import { LandingOverview } from '../../overview/LandingOverview';

/* * */

export function LandingPage() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

	//
	// F. Render components

	return (
		<>
			<main className={styles.root}>
				<LandingHeader />
				<LandingMap />
				<LandingOverview />

				<section className={styles.modules} id="modules">
					<div className={styles.copy}>
						<span className={styles.rule} />
						<h2>{t('unauthenticated:LandingPage.modules.title')}</h2>
						<p>{t('unauthenticated:LandingPage.modules.description')}</p>
						<button aria-label={t('unauthenticated:LandingPage.modules.play_video')} className={styles.videoPreview} onClick={() => setIsVideoModalOpen(true)} type="button">
							<IconPlayerPlayFilled aria-hidden="true" />
						</button>
					</div>
				</section>
			</main>

			<Modal onClose={() => setIsVideoModalOpen(false)} opened={isVideoModalOpen} size="xl" title={t('unauthenticated:LandingPage.modules.video_title')} centered>
				<video className={styles.video} preload="metadata" autoPlay controls>
					<source src="https://storage.carrismetropolitana.pt/static/app/assets/widgets/app-widget-lines.mp4" type="video/mp4" />
				</video>
			</Modal>
		</>
	);
}
