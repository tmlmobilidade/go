'use client';

/* * */

import { Select as MantineSelect, type SelectProps as MantineSelectProps } from '@mantine/core';

/* * */

export interface SelectDataItem {
	checked?: boolean
	disabled?: boolean
	label: string
	value: string
};

/* * */

export interface SelectProps extends Omit<MantineSelectProps, 'allowDeselect' | 'data'> {

	data?: SelectDataItem[]

	/**
	 * The `key` prop is required to ensure correct re-mounting behavior.
	 * Use the `form.key('fieldName')` method to generate a unique key based on the form state.
	 */
	key?: string

};

/**
 * Renders a Select component with customized default props.
 */
export function Select({ ...props }: SelectProps) {
	return (
		<MantineSelect
			allowDeselect={props.clearable ?? true}
			clearable={props.clearable ?? true}
			nothingFoundMessage={props.nothingFoundMessage || 'Nenhum resultado encontrado'}
			placeholder="Selecione uma opção..."
			searchable
			withAlignedLabels
			{...props}
		/>
	);
}
