/* * */

import { homepageContent } from '@/content/homepage';
import { IconArrowRight } from '@tabler/icons-react';
import { Button } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function EndSection() {
	return (
		<section className={styles.container} id="contactos">
			<div className={styles.inner}>
				<span className={styles.eyebrow}>{homepageContent.contact.eyebrow}</span>
				<h2>{homepageContent.contact.title}</h2>
				<p>{homepageContent.contact.body}</p>
				<div className={styles.actions} inert>
					<Button icon={<IconArrowRight size={18} stroke={2} />} label={homepageContent.contact.cta.label} variant="primary" />
				</div>
			</div>
		</section>
	);
}
