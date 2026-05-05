'use client';

/* * */

import { MultiSelect as MantineMultiSelect, type MultiSelectProps as MantineMultiSelectProps } from '@mantine/core';

import { useMultiSelectPaste } from '../../../hooks/useMultiSelectPaste';

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
	const handlePaste = useMultiSelectPaste({ data, defaultValue, onChange, onPaste, value });

	return (
		<MantineMultiSelect
			clearable={props.clearable ?? true}
			data={data}
			defaultValue={defaultValue}
			limit={props.limit ?? 50}
			nothingFoundMessage={props.nothingFoundMessage || 'Nenhum resultado encontrado'}
			onChange={onChange}
			onPaste={handlePaste}
			placeholder="Selecione uma ou mais opções..."
			value={value}
			searchable
			selectFirstOptionOnDropdownOpen
			withAlignedLabels
			{...props}
		/>
	);
}
