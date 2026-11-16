'use client';

import { IconNote } from '@tabler/icons-react';
import { Surface } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function AnnotationsEmptyState() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Surface align="center" className={styles.surface} height="full" justify="center" overflow="auto" variant="transparent">
			<section className={styles.content}>
				<IconNote className={styles.icon} size={80} stroke={1.25} aria-hidden />
				<h2 className={styles.title}>{t('annotations:list.AnnotationsEmptyState.title')}</h2>
				<p>{t('annotations:list.AnnotationsEmptyState.description')}</p>
				<p>{t('annotations:list.AnnotationsEmptyState.context')}</p>
			</section>
		</Surface>
	);
}
