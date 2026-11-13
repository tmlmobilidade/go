'use client';

import { IconTag } from '@tabler/icons-react';
import { type AnnotationCategory, AnnotationCategorySchema, AnnotationCategoryValues } from '@tmlmobilidade/go-types-dates';
import { Section, Select } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { annotationCategoryIcons } from '../annotation-category-icons';

/* * */

interface AnnotationsCategorySelectProps {
	error?: string
	onChange: (value: AnnotationCategory | null) => void
	readOnly: boolean
	value?: AnnotationCategory | null
}

/* * */

export function AnnotationsCategorySelect({ error, onChange, readOnly, value }: AnnotationsCategorySelectProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const SelectedIcon = value ? annotationCategoryIcons[value] : IconTag;
	const options = AnnotationCategoryValues.map(category => ({ label: t(`annotations:categories.values.${category}`), value: category }));

	//
	// B. Render components

	return (
		<Select
			data={options}
			description={t('annotations:AnnotationsCategorySelect.description')}
			error={error}
			label={t('annotations:AnnotationsCategorySelect.label')}
			leftSection={<SelectedIcon size={18} aria-hidden />}
			nothingFoundMessage={t('annotations:AnnotationsCategorySelect.no_results')}
			onChange={category => onChange(category ? AnnotationCategorySchema.parse(category) : null)}
			placeholder={t('annotations:categories.uncategorized')}
			readOnly={readOnly}
			value={value ?? null}
			w="100%"
			renderOption={({ option }) => {
				const OptionIcon = annotationCategoryIcons[AnnotationCategorySchema.parse(option.value)];
				return (
					<Section alignItems="center" flexDirection="row" gap="xs" padding="none">
						<OptionIcon size={18} aria-hidden />
						{option.label}
					</Section>
				);
			}}
			clearable
		/>
	);
}
