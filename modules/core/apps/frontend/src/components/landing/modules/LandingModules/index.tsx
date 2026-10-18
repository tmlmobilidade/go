'use client';

import { Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { LandingSection } from '../../shared/LandingContainer';
import { LandingInfoBlock } from '../../shared/LandingInfoBlock';
import { LandingModuleBlock } from '../../shared/LandingModuleBlock';
import { LandingVideoModalButton } from '../LandingVideoModalButton';

/* * */

export function LandingModules() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<LandingSection>

			<Section gap="lg">
				<LandingInfoBlock
					description={t('landing:LandingModules.intro.description')}
					title={t('landing:LandingModules.intro.title')}
				>
					<LandingVideoModalButton
						thumbnailSrc="/core/assets/landing/modules/infrastructure/infrastructure-video-thumbnail.jpg"
						videoSrc="https://storage.carrismetropolitana.pt/static/app/assets/widgets/app-widget-lines.mp4"
					/>
				</LandingInfoBlock>
			</Section>

			<div className={styles.grid}>

				<LandingModuleBlock
					description={t('landing:LandingModules.infrastructure.description')}
					index={1}
					subtitle={t('landing:LandingModules.infrastructure.subtitle')}
					thumbnailSrc="/core/assets/landing/modules/infrastructure/infrastructure-video-thumbnail.jpg"
					title={t('landing:LandingModules.infrastructure.title')}
					videoSrc="https://storage.carrismetropolitana.pt/static/app/assets/widgets/app-widget-lines.mp4"
				/>

				<LandingModuleBlock
					description={t('landing:LandingModules.infrastructure.description')}
					index={2}
					subtitle={t('landing:LandingModules.infrastructure.subtitle')}
					thumbnailSrc="/core/assets/landing/modules/infrastructure/infrastructure-video-thumbnail.jpg"
					title={t('landing:LandingModules.infrastructure.title')}
					videoSrc="https://storage.carrismetropolitana.pt/static/app/assets/widgets/app-widget-lines.mp4"
				/>

				<LandingModuleBlock
					description={t('landing:LandingModules.infrastructure.description')}
					index={3}
					subtitle={t('landing:LandingModules.infrastructure.subtitle')}
					thumbnailSrc="/core/assets/landing/modules/infrastructure/infrastructure-video-thumbnail.jpg"
					title={t('landing:LandingModules.infrastructure.title')}
					videoSrc="https://storage.carrismetropolitana.pt/static/app/assets/widgets/app-widget-lines.mp4"
				/>

				<LandingModuleBlock
					description={t('landing:LandingModules.infrastructure.description')}
					index={3}
					subtitle={t('landing:LandingModules.infrastructure.subtitle')}
					thumbnailSrc="/core/assets/landing/modules/infrastructure/infrastructure-video-thumbnail.jpg"
					title={t('landing:LandingModules.infrastructure.title')}
					videoSrc="https://storage.carrismetropolitana.pt/static/app/assets/widgets/app-widget-lines.mp4"
				/>

			</div>

		</LandingSection>
	);
}
