'use client';

import { Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { LandingSection } from '../../shared/LandingContainer';
import { LandingInfoBlock } from '../../shared/LandingInfoBlock';

/* * */

export function LandingModulesIntro() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<LandingSection>
			<Section>
				<LandingInfoBlock
					description={t('landing:LandingModulesIntro.description')}
					title={t('landing:LandingModulesIntro.title')}
				/>
			</Section>
		</LandingSection>
	);
}
