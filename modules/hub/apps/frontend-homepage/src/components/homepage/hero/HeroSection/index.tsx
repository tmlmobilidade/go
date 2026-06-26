'use client';

/* * */

import { homepageContent } from '@/content/homepage';
import { IconBook2, IconMail } from '@tabler/icons-react';
import { Button } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function HeroSection() {
	return (
		<section className={styles.container}>
			<div className={styles.copy}>
				<div className={styles.textBlock}>
					<h1>{homepageContent.hero.title}</h1>
					<p>{homepageContent.hero.body}</p>
				</div>
				<div className={styles.actions}>
					<Button icon={<IconBook2 size={18} stroke={2} />} label={homepageContent.hero.primaryCta.label} onClick={() => {}} variant="primary" />
					<Button icon={<IconMail size={18} stroke={2} />} label={homepageContent.hero.secondaryCta.label} onClick={() => {}} variant="secondary" />
				</div>
			</div>
		</section>
	);
}
