'use client';

import { IconArrowRight, IconPlayerPlayFilled } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function LandingPage() {
	//

	// A. Setup variables

	const { t } = useTranslation();

	const quickLinks = [
		t('unauthenticated:LandingPage.quick_links.open_data'),
		t('unauthenticated:LandingPage.quick_links.open_services'),
		t('unauthenticated:LandingPage.quick_links.gtfs'),
		t('unauthenticated:LandingPage.quick_links.apex'),
		t('unauthenticated:LandingPage.quick_links.documentation'),
		t('unauthenticated:LandingPage.quick_links.login'),
	];

	//
	// F. Render components

	return (
		<main className={styles.root}>
			<section aria-label={t('unauthenticated:LandingPage.hero.label')} className={styles.hero}>
				<div className={styles.header}>
					<a aria-label="GO" className={styles.logo} href="#top">
						<span>GO</span>
						<i aria-hidden="true" />
					</a>
					<Button href={PAGE_ROUTES.core.LOGIN_LIST} label={t('unauthenticated:LandingPage.login')} variant="primary" />
				</div>
				<div aria-hidden="true" className={styles.location} />
			</section>

			<section className={styles.introduction} id="top">
				<div className={styles.copy}>
					<span className={styles.rule} />
					<h1>{t('unauthenticated:LandingPage.title')}</h1>
					<p>{t('unauthenticated:LandingPage.description')}</p>
					<Button href="#modules" label={t('unauthenticated:LandingPage.explore')} variant="primary" />
				</div>

				<nav aria-label={t('unauthenticated:LandingPage.quick_links.label')} className={styles.quickLinks}>
					<span>{t('unauthenticated:LandingPage.quick_links.label')}</span>
					{quickLinks.map((label, index) => (
						<a key={label} href={index === quickLinks.length - 1 ? PAGE_ROUTES.core.LOGIN_LIST : '#modules'}>
							{label}
							<IconArrowRight aria-hidden="true" />
						</a>
					))}
				</nav>
			</section>

			<section className={styles.modules} id="modules">
				<div className={styles.copy}>
					<span className={styles.rule} />
					<h2>{t('unauthenticated:LandingPage.modules.title')}</h2>
					<p>{t('unauthenticated:LandingPage.modules.description')}</p>
					<button aria-label={t('unauthenticated:LandingPage.modules.play_video')} className={styles.videoPreview} type="button">
						<IconPlayerPlayFilled aria-hidden="true" />
					</button>
				</div>
			</section>
		</main>
	);
}
