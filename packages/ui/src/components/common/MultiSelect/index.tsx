'use client';

/* * */

import { MultiSelect as MantineMultiSelect, type MultiSelectProps as MantineMultiSelectProps } from '@mantine/core';

/* * */

type MultiSelectProps = MantineMultiSelectProps;

/**
 * Renders a Select component with customized default props.
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
