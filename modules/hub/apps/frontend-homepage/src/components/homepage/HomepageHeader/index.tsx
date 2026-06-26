/* * */

import { homepageContent } from '@/content/homepage';
import { Button } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function HomepageHeader() {
	return (
		<header className={styles.container}>
			<div className={styles.inner}>
				<div aria-label="GO" className={styles.brand}>
					<span className={styles.logoMark}>
						<span />
						<span />
					</span>
					<strong>GO</strong>
				</div>
				<div className={styles.actions}>
					<Button label={homepageContent.header.docs.label} variant="transparent" />
					<Button label={homepageContent.header.login.label} variant="secondary" />
				</div>
			</div>
		</header>
	);
}
