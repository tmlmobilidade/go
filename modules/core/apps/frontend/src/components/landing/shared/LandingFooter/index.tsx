'use client';

import { Image, Section, WhenMode } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { LandingSection } from '../../shared/LandingContainer';

/* * */

export function LandingFooter() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const footerLinks = [
		{ href: '#', label: t('landing:LandingFooter.links.github') },
		{ href: '#', label: t('landing:LandingFooter.links.status') },
		{ href: '#', label: t('landing:LandingFooter.links.roadmap') },
		{ href: '#', label: t('landing:LandingFooter.links.infrastructure') },
	];

	//
	// B. Render components

	return (
		<LandingSection>
			<Section>
				<footer className={styles.footer}>
					<WhenMode
						dark={<Image alt="TML Mobilidade" className={styles.tmlmobilidade} src="/core/assets/landing/brand/tmlmobilidade-dark.svg" />}
						light={<Image alt="TML Mobilidade" className={styles.tmlmobilidade} src="/core/assets/landing/brand/tmlmobilidade-light.svg" />}
					/>
					<div className={styles.links}>
						{footerLinks.map(({ href, label }) => (
							<a key={label} className={styles.link} href={href}>{label}</a>
						))}
					</div>
				</footer>
			</Section>
		</LandingSection>
	);
}
