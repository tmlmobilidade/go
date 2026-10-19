'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, Grid, Section, Space } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { LandingSection } from '../../shared/LandingContainer';
import { LandingInfoBlock } from '../../shared/LandingInfoBlock';
import { LandingOverviewI18n } from '../LandingOverviewI18n';
import { LandingOverviewLinks } from '../LandingOverviewLinks';
import { LandingOverviewTheme } from '../LandingOverviewTheme';

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
				<Grid columns="aab" gap="md">

					<LandingInfoBlock
						description={t('landing:LandingOverview.description')}
						title={t('landing:LandingOverview.title')}
					>
						<>
							<Section flexDirection="row" gap="md" padding="none">
								<Button href={PAGE_ROUTES.core.LOGIN_LIST} label={t('landing:LandingOverview.actions.login')} />
								<Button href="#modules" label={t('landing:LandingOverview.actions.explore')} variant="secondary" />
							</Section>
							<Space h={15} />
							<Section gap="md" padding="none">
								<LandingOverviewI18n />
								<LandingOverviewTheme />
							</Section>
						</>
					</LandingInfoBlock>

					<LandingOverviewLinks />

				</Grid>
			</Section>
		</LandingSection>
	);
}
