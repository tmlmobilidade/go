'use client';

import { IconArrowRight, IconPlayerPlayFilled } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, Modal } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function LandingOverview() {
	//

	// A. Setup variables

	const { t } = useTranslation();
	const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

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
		<>
			<main className={styles.root}>
				<section aria-label={t('unauthenticated:LandingPage.hero.label')} className={styles.hero}>
					<LandingMap />
				</section>

				<LandingPageHeader />

				<section className={styles.introduction} id="top">
					<div className={styles.copy}>
						<span className={styles.rule} />
						<h1>{t('unauthenticated:LandingPage.title')}</h1>
						<p>{t('unauthenticated:LandingPage.description')}</p>
						<Button href="#modules" label={t('unauthenticated:LandingPage.explore')} variant="primary" />
					</div>

					<nav aria-label={t('unauthenticated:LandingPage.quick_links.label')} className={styles.quickLinks}>
						<span>{t('unauthenticated:LandingPage.quick_links.label')}</span>
						{quickLinks.map(({ href, label }) => (
							<a key={label} href={href}>
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
						<button aria-label={t('unauthenticated:LandingPage.modules.play_video')} className={styles.videoPreview} onClick={() => setIsVideoModalOpen(true)} type="button">
							<IconPlayerPlayFilled aria-hidden="true" />
						</button>
					</div>
				</section>
			</main>

			<Modal onClose={() => setIsVideoModalOpen(false)} opened={isVideoModalOpen} size="xl" title={t('unauthenticated:LandingPage.modules.video_title')} centered>
				<video className={styles.video} preload="metadata" autoPlay controls>
					<source src="https://storage.carrismetropolitana.pt/static/app/assets/widgets/app-widget-lines.mp4" type="video/mp4" />
				</video>
			</Modal>
		</>
	);
}
