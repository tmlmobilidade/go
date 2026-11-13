'use client';

import { Textarea } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface AnnotationsImpactInputProps {
	error?: string
	onChange: (value: string) => void
	readOnly: boolean
	value?: string
}

/* * */

export function AnnotationsImpactInput({ error, onChange, readOnly, value }: AnnotationsImpactInputProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Textarea
			description={t('annotations:AnnotationsImpactInput.description')}
			error={error}
			label={t('annotations:AnnotationsImpactInput.label')}
			minRows={3}
			onChange={event => onChange(event.currentTarget.value)}
			placeholder={t('annotations:AnnotationsImpactInput.placeholder')}
			readOnly={readOnly}
			value={value ?? ''}
			w="100%"
			autosize
		/>
	);
}
