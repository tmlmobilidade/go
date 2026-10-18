'use client';

import { Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { LandingSection } from '../../shared/LandingContainer';
import { LandingInfoBlock } from '../../shared/LandingInfoBlock';
import { LandingModuleBlock } from '../LandingModuleBlock';
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
					index={1}
					title={t('landing:LandingModules.infrastructure.title')}
					content={[{
						description: t('landing:LandingModules.infrastructure.description'),
						subtitle: t('landing:LandingModules.infrastructure.subtitle'),
						thumbnailSrc: '/core/assets/landing/modules/infrastructure/infrastructure-video-thumbnail.jpg',
						videoSrc: 'https://storage.carrismetropolitana.pt/static/app/assets/widgets/app-widget-lines.mp4',
					}]}
				/>

				<LandingModuleBlock
					index={1}
					title={t('landing:LandingModules.infrastructure.title')}
					content={[{
						description: t('landing:LandingModules.infrastructure.description'),
						subtitle: t('landing:LandingModules.infrastructure.subtitle'),
						thumbnailSrc: '/core/assets/landing/modules/infrastructure/infrastructure-video-thumbnail.jpg',
						videoSrc: 'https://storage.carrismetropolitana.pt/static/app/assets/widgets/app-widget-lines.mp4',
					}]}
				/>

				<LandingModuleBlock
					index={1}
					title={t('landing:LandingModules.infrastructure.title')}
					content={[
						{
							description: t('landing:LandingModules.infrastructure.description'),
							subtitle: t('landing:LandingModules.infrastructure.subtitle'),
							thumbnailSrc: '/core/assets/landing/modules/infrastructure/infrastructure-video-thumbnail.jpg',
							videoSrc: 'https://storage.carrismetropolitana.pt/static/app/assets/widgets/app-widget-lines.mp4',
						},
						{
							description: t('landing:LandingModules.infrastructure.description'),
							subtitle: t('landing:LandingModules.infrastructure.subtitle'),
							thumbnailSrc: '/core/assets/landing/modules/infrastructure/infrastructure-video-thumbnail.jpg',
							videoSrc: 'https://storage.carrismetropolitana.pt/static/app/assets/widgets/app-widget-lines.mp4',
						},
						{
							description: t('landing:LandingModules.infrastructure.description'),
							subtitle: t('landing:LandingModules.infrastructure.subtitle'),
							thumbnailSrc: '/core/assets/landing/modules/infrastructure/infrastructure-video-thumbnail.jpg',
							videoSrc: 'https://storage.carrismetropolitana.pt/static/app/assets/widgets/app-widget-lines.mp4',
						},
					]}
				/>

				<LandingModuleBlock
					index={1}
					title={t('landing:LandingModules.infrastructure.title')}
					content={[{
						description: t('landing:LandingModules.infrastructure.description'),
						subtitle: t('landing:LandingModules.infrastructure.subtitle'),
						thumbnailSrc: '/core/assets/landing/modules/infrastructure/infrastructure-video-thumbnail.jpg',
						videoSrc: 'https://storage.carrismetropolitana.pt/static/app/assets/widgets/app-widget-lines.mp4',
					}]}
				/>

			</div>

		</LandingSection>
	);
}
