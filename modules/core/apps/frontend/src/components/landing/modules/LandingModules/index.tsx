'use client';

import { Button, Section } from '@tmlmobilidade/ui';
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
						thumbnailSrc="/core/assets/landing/modules/hub-video-thumbnail.jpg"
						videoSrc="https://storage.carrismetropolitana.pt/static/go/hub.mp4"
					/>
				</LandingInfoBlock>
			</Section>

			<div className={styles.grid}>

				<LandingModuleBlock
					index={1}
					title={t('landing:LandingModules.infrastructure.title')}
					content={[{
						description: t('landing:LandingModules.infrastructure.stops.description'),
						subtitle: t('landing:LandingModules.infrastructure.stops.subtitle'),
						thumbnailSrc: '/core/assets/landing/modules/stops-video-thumbnail.jpg',
						videoSrc: 'https://storage.carrismetropolitana.pt/static/go/stops.mp4',
					}]}
				/>

				<LandingModuleBlock
					index={2}
					title={t('landing:LandingModules.offer.title')}
					content={[{
						description: t('landing:LandingModules.offer.offer.description'),
						subtitle: t('landing:LandingModules.offer.offer.subtitle'),
						thumbnailSrc: '/core/assets/landing/modules/offer-video-thumbnail.jpg',
						videoSrc: 'https://storage.carrismetropolitana.pt/static/go/offer.mp4',
					}]}
				/>

				<LandingModuleBlock
					index={3}
					title={t('landing:LandingModules.operation.title')}
					content={[
						{
							description: t('landing:LandingModules.operation.plans.description'),
							subtitle: t('landing:LandingModules.operation.plans.subtitle'),
							thumbnailSrc: '/core/assets/landing/modules/plans-video-thumbnail.jpg',
							videoSrc: 'https://storage.carrismetropolitana.pt/static/go/plans.mp4',
						},
						{
							description: t('landing:LandingModules.operation.rides.description'),
							subtitle: t('landing:LandingModules.operation.rides.subtitle'),
							thumbnailSrc: '/core/assets/landing/modules/rides-video-thumbnail.jpg',
							videoSrc: 'https://storage.carrismetropolitana.pt/static/go/rides.mp4',
						},
						{
							description: t('landing:LandingModules.operation.alerts.description'),
							subtitle: t('landing:LandingModules.operation.alerts.subtitle'),
							thumbnailSrc: '/core/assets/landing/modules/alerts-video-thumbnail.jpg',
							videoSrc: 'https://storage.carrismetropolitana.pt/static/go/alerts.mp4',
						},
					]}
				/>

				<div className={styles.lastBlock}>
					<LandingModuleBlock
						index={4}
						title={t('landing:LandingModules.performance.title')}
						content={[{
							description: t('landing:LandingModules.performance.performance.description'),
							subtitle: t('landing:LandingModules.performance.performance.subtitle'),
							thumbnailSrc: '/core/assets/landing/modules/performance-video-thumbnail.jpg',
							videoSrc: 'https://storage.carrismetropolitana.pt/static/go/performance.mp4',
						}]}
					/>
					<div className={styles.meetingsBlock}>
						<LandingInfoBlock
							description={t('landing:LandingModules.meetings.description')}
							title={t('landing:LandingModules.meetings.title')}
						>
							<Section gap="md" padding="none">
								<Button label={t('landing:LandingModules.meetings.actions.send_email')} />
								<Button label={t('landing:LandingModules.meetings.actions.schedule_meeting')} />
							</Section>
						</LandingInfoBlock>
					</div>
				</div>

			</div>

		</LandingSection>
	);
}
