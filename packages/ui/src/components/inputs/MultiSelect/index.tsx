'use client';

import { MultiSelect as MantineMultiSelect, type MultiSelectProps as MantineMultiSelectProps } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { useMultiSelectPaste } from '../../../hooks/useMultiSelectPaste';
import { filterSelectOptions } from '../Select/filter-select-options';
import { SelectOption } from '../SelectOption';

/* * */

interface MultiSelectProps extends MantineMultiSelectProps {

	/**
	 * The `key` prop is required to ensure correct re-mounting behavior.
	 * Use the `form.key('fieldName')` method to generate a unique key based on the form state.
	 */
	key?: string

}

/**
 * Renders a multi-select dropdown component.
 * Supports pasting comma-separated values; only values that exist in data are applied.
 */
export function MultiSelect({ data, defaultValue, onChange, onPaste, value, ...props }: MultiSelectProps) {
	const { t } = useTranslation();
	const handlePaste = useMultiSelectPaste({ data, defaultValue, onChange, onPaste, value });

	return (
		<MantineMultiSelect
			clearable={props.clearable ?? true}
			data={data}
			defaultValue={defaultValue}
			filter={filterSelectOptions}
			limit={props.limit ?? 50}
			nothingFoundMessage={props.nothingFoundMessage ?? t('shared:components.inputs.Select.nothing_found')}
			onChange={onChange}
			onPaste={handlePaste}
			placeholder={t('shared:components.inputs.MultiSelect.placeholder')}
			renderOption={({ option }) => <SelectOption option={option} />}
			value={value}
			searchable
			withAlignedLabels
			{...props}
		/>
	);
}
