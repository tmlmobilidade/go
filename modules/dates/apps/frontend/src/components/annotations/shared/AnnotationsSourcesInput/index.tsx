'use client';

import { IconPlus } from '@tabler/icons-react';
import { type AnnotationSource } from '@tmlmobilidade/go-types-dates';
import { Button, Section, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { AnnotationsSourceRow } from '../AnnotationsSourceRow';

/* * */

interface AnnotationsSourcesInputProps {
	error?: string
	onChange: (value: AnnotationSource[]) => void
	readOnly: boolean
	value?: AnnotationSource[]
}

/* * */

export function AnnotationsSourcesInput({ error, onChange, readOnly, value = [] }: AnnotationsSourcesInputProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Handle actions

	const updateSource = (index: number, source: AnnotationSource) => onChange(value.map((current, currentIndex) => currentIndex === index ? source : current));
	const removeSource = (index: number) => onChange(value.filter((_, currentIndex) => currentIndex !== index));
	const addSource = () => onChange([...value, { name: '', url: null }]);

	//
	// C. Render components

	return (
		<Section gap="sm" padding="none">
			<Text weight="semibold">{t('annotations:AnnotationsSourcesInput.label')}</Text>
			<Text size="sm">{t('annotations:AnnotationsSourcesInput.description')}</Text>
			{!value.length && <Text size="sm">{t('annotations:AnnotationsSourcesInput.empty')}</Text>}
			{value.map((source, index) => (
				<AnnotationsSourceRow key={index} onChange={source => updateSource(index, source)} onRemove={() => removeSource(index)} readOnly={readOnly} value={source} />
			))}
			{error && <div role="alert"><Text size="sm">{error}</Text></div>}
			{!readOnly && <Button label={t('annotations:AnnotationsSourcesInput.add')} leftSection={<IconPlus size={16} />} onClick={addSource} size="sm" variant="transparent" />}
		</Section>
	);
}
