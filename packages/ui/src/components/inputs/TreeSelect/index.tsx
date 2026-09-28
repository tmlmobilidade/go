'use client';

import { TreeSelect as MantineTreeSelect, type TreeSelectProps as MantineTreeSelectProps } from '@mantine/core';

/* * */

export interface TreeSelectDataItem {
	checked?: boolean
	disabled?: boolean
	label: string
	value: string
};

/* * */

export interface TreeSelectProps extends Omit<MantineTreeSelectProps, 'allowDeTreeselect' | 'data'> {

	/**
	 * The data items to be displayed in the TreeSelect component.
	 * Use the `TreeSelectDataItem` interface to define properties for each item.
	 */
	data: TreeSelectDataItem[]

};

/**
 * Renders a TreeSelect component with customized default props.
 */
export function TreeSelect(props: TreeSelectProps) {
	return (
		<MantineTreeSelect
			allowDeselect={props.clearable ?? true}
			clearable={props.clearable ?? true}
			nothingFoundMessage={props.nothingFoundMessage || 'Nenhum resultado encontrado'}
			placeholder="Selecione uma opção..."
			searchable
			{...props}
		/>
	);
}
