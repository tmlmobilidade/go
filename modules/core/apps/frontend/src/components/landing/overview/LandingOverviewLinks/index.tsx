'use client';

import { IconApi, IconArrowRight, IconCalendarTime, IconPlugConnected, IconTicket } from '@tabler/icons-react';
import { Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function LandingOverviewLinks() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const linkGroups = [
		{
			label: t('landing:LandingOverviewLinks.operators.label'),
			links: [
				{ description: t('landing:LandingOverviewLinks.operators.links.gtfs.description'), href: '#modules', icon: IconCalendarTime, title: t('landing:LandingOverviewLinks.operators.links.gtfs.title') },
				{ description: t('landing:LandingOverviewLinks.operators.links.apex.description'), href: '#modules', icon: IconTicket, title: t('landing:LandingOverviewLinks.operators.links.apex.title') },
			],
			title: t('landing:LandingOverviewLinks.operators.title'),
		},
		{
			label: t('landing:LandingOverviewLinks.developers.label'),
			links: [
				{ description: t('landing:LandingOverviewLinks.developers.links.open_data.description'), href: '#modules', icon: IconApi, title: t('landing:LandingOverviewLinks.developers.links.open_data.title') },
				{ description: t('landing:LandingOverviewLinks.developers.links.open_services.description'), href: '#modules', icon: IconPlugConnected, title: t('landing:LandingOverviewLinks.developers.links.open_services.title') },
			],
			title: t('landing:LandingOverviewLinks.developers.title'),
		},
	];

	//
	// B. Render components

	return linkGroups.map(group => (
		<nav key={group.label} className={styles.container}>
			<div className={styles.header}>
				<Tag label={group.label} variant="primary" />
				<h3 className={styles.heading}>{group.title}</h3>
			</div>
			<div className={styles.links}>
				{group.links.map(({ description, href, icon: Icon, title }) => (
					<a key={title} className={styles.link} href={href}>
						<span className={styles.iconChip}>
							<Icon size={22} stroke={1.75} />
						</span>
						<span className={styles.text}>
							<span className={styles.title}>{title}</span>
							<span className={styles.description}>{description}</span>
						</span>
						<IconArrowRight className={styles.arrow} size={20} stroke={2.5} />
					</a>
				))}
			</div>
		</nav>
	));
}
