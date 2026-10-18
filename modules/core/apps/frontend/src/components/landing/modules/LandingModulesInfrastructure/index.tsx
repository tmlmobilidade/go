'use client';

import { Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { LandingSection } from '../../shared/LandingContainer';
import { LandingModuleBlock } from '../../shared/LandingModuleBlock';

/* * */

export function LandingModulesInfrastructure() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<LandingSection>
			<Section>
				<LandingModuleBlock
					description={t('landing:LandingModulesInfrastructure.description')}
					index={1}
					subtitle={t('landing:LandingModulesInfrastructure.subtitle')}
					title={t('landing:LandingModulesInfrastructure.title')}
				/>
			</Section>
		</LandingSection>
	);
}
