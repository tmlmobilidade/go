'use client';

import { TagsInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { Section } from '../../../components';
import { FilterWrapper } from '../../shared';

/* * */

interface TagFilterProps {
	active?: boolean
	disabled?: boolean
	label: string
	onChange?: (values: string[]) => void
	options?: string[]
	value?: string[]
}

/* * */

export function TagFilter({ active, disabled, label, onChange, options, value }: TagFilterProps) {
	//

	const { t } = useTranslation();

	return (
		<FilterWrapper active={active} disabled={disabled} label={label}>
			<Section gap="sm" height="auto" padding="md" width="auto">
				<TagsInput
					data={options}
					onChange={onChange}
					placeholder={t('shared:filters.TagFilter.placeholder')}
					splitChars={[' ', ',', ';', '|']}
					value={value}
				/>
			</Section>
		</FilterWrapper>
	);
}
