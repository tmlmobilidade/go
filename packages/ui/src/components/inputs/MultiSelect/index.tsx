'use client';

/* * */

import { MultiSelect as MantineMultiSelect, type MultiSelectProps as MantineMultiSelectProps } from '@mantine/core';
import { useTranslation } from 'react-i18next';

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
	//

	//
	// A. Setup Variables

	const { t } = useTranslation('global', { keyPrefix: 'components.select' });

	//
	// B. Render Components
	return (
		<MantineMultiSelect
			clearable={props.clearable ?? true}
			nothingFoundMessage={props.nothingFoundMessage || t('nothing_found_message')}
			searchable
			withAlignedLabels
			{...props}
		/>
	);
}
