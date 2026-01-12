'use client';

/* * */

import { Section, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopCreateStep2Instructions() {
	const { t } = useTranslation();

	return (
		<Section gap="sm">
			<Text>{t('stops:stops.create.Step2.Instructions.text')}</Text>
		</Section>
	);
}
