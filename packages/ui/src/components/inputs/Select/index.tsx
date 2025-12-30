'use client';

/* * */

import { Select as MantineSelect, type SelectProps as MantineSelectProps } from '@mantine/core';
import { useTranslation } from 'react-i18next';

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
	//

	//
	// A. Setup Variables

	const { t } = useTranslation('global', { keyPrefix: 'components.select' });

	//
	// B. Render Components

	return (
		<MantineSelect
			allowDeselect={props.clearable ?? true}
			clearable={props.clearable ?? true}
			placeholder={t('nothingFoundMessage')}
			searchable
			withAlignedLabels
			{...props}
		/>
	);
}
