'use client';

import { Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { LandingSection } from '../../shared/LandingContainer';
import { LandingInfoBlock } from '../../shared/LandingInfoBlock';
import { LandingOverviewLinks } from '../LandingOverviewLinks';

/* * */

export function LandingOverview() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<LandingSection>
			<Section>
				<div className={styles.container}>
					<LandingInfoBlock
						description={t('landing:LandingOverview.description')}
						title={t('landing:LandingOverview.title')}
					/>
					<div className={styles.links}>
						<LandingOverviewLinks />
					</div>
				</div>
			</Section>
		</LandingSection>
	);
}
