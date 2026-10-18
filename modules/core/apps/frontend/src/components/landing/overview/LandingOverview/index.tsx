'use client';

import { IconArrowRight } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, Grid, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { LandingSection } from '../../shared/LandingContainer';
import { LandingInfoBlock } from '../../shared/LandingInfoBlock';

/* * */

export function LandingOverview() {
	//

	// A. Setup variables

	const { t } = useTranslation();

	const quickLinks = [
		{ href: '#modules', label: t('unauthenticated:LandingPage.quick_links.open_data') },
		{ href: '#modules', label: t('unauthenticated:LandingPage.quick_links.open_services') },
		{ href: '#modules', label: t('unauthenticated:LandingPage.quick_links.gtfs') },
		{ href: '#modules', label: t('unauthenticated:LandingPage.quick_links.apex') },
		{ href: `${PAGE_ROUTES.root.BASE}/hub/reference`, label: t('unauthenticated:LandingPage.quick_links.documentation') },
		{ href: PAGE_ROUTES.core.LOGIN_LIST, label: t('unauthenticated:LandingPage.quick_links.login') },
	];

	//
	// F. Render components

	return (
		<LandingSection>
			<Section>
				<Grid columns="ab" gap="md">

					<LandingInfoBlock
						description={t('landing:LandingOverview.description')}
						title={t('landing:LandingOverview.title')}
					>
						<Section flexDirection="row" gap="md" padding="none">
							<Button label={t('landing:LandingOverview.actions.login')} />
							<Button label={t('landing:LandingOverview.actions.explore')} variant="secondary" />
						</Section>
					</LandingInfoBlock>

					<nav aria-label={t('unauthenticated:LandingPage.quick_links.label')} className={styles.quickLinks}>
						<span>{t('unauthenticated:LandingPage.quick_links.label')}</span>
						{quickLinks.map(({ href, label }) => (
							<a key={label} href={href}>
								{label}
								<IconArrowRight aria-hidden="true" />
							</a>
						))}
					</nav>

				</Grid>
			</Section>
		</LandingSection>
	);
}
