'use client';

/* * */

import { Section, Surface } from '@tmlmobilidade/ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LineDetailNotFoundStateProps {
	lineId: string
}

/* * */

export function LineDetailNotFoundState({ lineId }: LineDetailNotFoundStateProps) {
	const { t } = useTranslation('default');

	return (
		<Section className={styles.root} padding="md">
			<Surface>
				<Section gap="sm" padding="lg">
					<h1>{t('lineDetail.error.title')}</h1>
					<p>{t('lineDetail.error.description', { lineId })}</p>
					<Link href="/network/lines">{t('lineDetail.error.back')}</Link>
				</Section>
			</Surface>
		</Section>
	);
}
