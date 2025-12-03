'use client';

/* * */

import { Select as MantineSelect, type SelectProps as MantineSelectProps } from '@mantine/core';

/* * */

type SelectProps = Omit<MantineSelectProps, 'allowDeselect'>;

/**
 * Renders a Select component with customized default props.
 */
export function Select({ ...props }: SelectProps) {
	return (
		<MantineSelect
			allowDeselect={props.clearable ?? true}
			clearable={props.clearable ?? true}
			nothingFoundMessage={props.nothingFoundMessage || 'Nenhum resultado encontrado'}
			searchable
			withAlignedLabels
			{...props}
		/>
	);
}
