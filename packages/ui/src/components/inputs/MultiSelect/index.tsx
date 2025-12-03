'use client';

/* * */

import { MultiSelect as MantineMultiSelect, type MultiSelectProps as MantineMultiSelectProps } from '@mantine/core';

/* * */

interface MultiSelectProps extends MantineMultiSelectProps {
	/**
	 * The `key` prop is required to ensure correct re-mounting behavior.
	 * Use the `form.key('fieldName')` method to generate a unique key based on the form state.
	 */
	key?: string
};

/**
 * Renders a multi-select dropdown component.
 */
export function MultiSelect({ ...props }: MultiSelectProps) {
	return (
		<MantineMultiSelect
			clearable={props.clearable ?? true}
			nothingFoundMessage={props.nothingFoundMessage || 'Nenhum resultado encontrado'}
			searchable
			withAlignedLabels
			{...props}
		/>
	);
}
