'use client';

import { IconArrowRight } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function LandingOverviewLinks() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const quickLinks = [
		{ href: '#modules', label: t('landing:LandingOverviewLinks.links.open_data') },
		{ href: '#modules', label: t('landing:LandingOverviewLinks.links.open_services') },
		{ href: '#modules', label: t('landing:LandingOverviewLinks.links.gtfs') },
		{ href: '#modules', label: t('landing:LandingOverviewLinks.links.apex') },
		{ href: `${PAGE_ROUTES.root.BASE}/hub/reference`, label: t('landing:LandingOverviewLinks.links.documentation') },
		{ href: '#modules', label: t('landing:LandingOverviewLinks.links.roadmap') },
	];

	//
	// B. Render components

	return (
		<nav className={styles.container}>
			<p className={styles.label}>{t('landing:LandingOverviewLinks.label')}</p>
			{quickLinks.map(({ href, label }) => (
				<a key={label} className={styles.link} href={href}>
					{label}
					<IconArrowRight className={styles.icon} size={34} stroke={2} />
				</a>
			))}
		</nav>
	);
}
