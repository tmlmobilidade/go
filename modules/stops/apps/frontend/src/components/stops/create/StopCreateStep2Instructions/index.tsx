'use client';

/* * */

import { Section, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopCreateStep2Instructions() {
	const { t } = useTranslation('stops', { keyPrefix: 'create.step2.instructions' });

	return (
		<Section gap="sm">
			<Text>{t('text')}</Text>
		</Section>
	);
}
