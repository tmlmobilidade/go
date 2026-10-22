'use client';

import { Select as MantineSelect, type SelectProps as MantineSelectProps } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { SelectOption } from '../SelectOption';
import { filterSelectOptions } from './filter-select-options';

export type { ComboboxItem, ComboboxItemGroup } from '@mantine/core';

/* * */

export interface SelectDataItem {
	checked?: boolean
	description?: string
	disabled?: boolean
	keywords?: string
	label: string
	/** Keep special actions before the alphabetically sorted options. */
	pinned?: boolean
	value: string
};

/* * */

export interface SelectProps extends MantineSelectProps {

	/**
	 * The data items to be displayed in the Select component.
	 * Supports Mantine's grouped options as well as `SelectDataItem` values.
	 */
	data?: MantineSelectProps['data']

};

/**
 * Renders a Select component with customized default props.
 */
export function Select(props: SelectProps) {
	const { t } = useTranslation();

	return (
		<MantineSelect
			allowDeselect={props.clearable ?? true}
			clearable={props.clearable ?? true}
			filter={filterSelectOptions}
			limit={25}
			nothingFoundMessage={props.nothingFoundMessage ?? t('shared:components.inputs.Select.nothing_found')}
			placeholder={t('shared:components.inputs.Select.placeholder')}
			renderOption={({ option }) => <SelectOption option={option} />}
			searchable
			withAlignedLabels
			{...props}
		/>
	);
}
