'use client';

import { TreeSelect as MantineTreeSelect, type TreeSelectProps as MantineTreeSelectProps, type TreeSelectMode } from '@mantine/core';

/* * */

export interface TreeSelectDataItem {
	children?: TreeSelectDataItem[]
	label: string
	value: string
};

/* * */

export interface TreeSelectProps<Mode extends TreeSelectMode = 'single'> extends Omit<MantineTreeSelectProps<Mode>, 'data'> {

	/**
	 * The data items to be displayed in the TreeSelect component.
	 * Use the `TreeSelectDataItem` interface to define properties for each item.
	 */
	data: TreeSelectDataItem[]

};

/**
 * Renders a TreeSelect component with customized default props.
 */
export function TreeSelect<Mode extends TreeSelectMode = 'single'>(props: TreeSelectProps<Mode>) {
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
