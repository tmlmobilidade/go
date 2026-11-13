'use client';

import { IconLink } from '@tabler/icons-react';
import { TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface AnnotationsSourceInputProps {
	error?: string
	onChange: (value: string) => void
	readOnly: boolean
	value?: string
}

/* * */

export function AnnotationsSourceInput({ error, onChange, readOnly, value }: AnnotationsSourceInputProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<TextInput
			description={t('annotations:AnnotationsSourceInput.description')}
			error={error}
			label={t('annotations:AnnotationsSourceInput.label')}
			leftSection={<IconLink size={18} aria-hidden />}
			onChange={event => onChange(event.currentTarget.value)}
			placeholder={t('annotations:AnnotationsSourceInput.placeholder')}
			readOnly={readOnly}
			value={value ?? ''}
			w="100%"
		/>
	);
}
