/* * */

import { FilterWrapper } from '@/components/filters/FilterWrapper';
import { Checkbox, ScrollArea } from '@mantine/core';
import { useMemo } from 'react';

/* * */

interface FilterTypeListOption {
	checked?: boolean
	disabled?: boolean
	label: string
	value: string
}

interface FilterTypeListProps {
	active?: boolean
	disabled?: boolean
	label: string
	onChange?: (values: string[]) => void
	options?: FilterTypeListOption[]
	withToggleAll?: boolean
}

/* * */

export function FilterTypeList({ active, disabled, label, onChange, options, withToggleAll }: FilterTypeListProps) {
	//

	//
	// A. Transform data

	const isDisabled = useMemo(() => {
		// If options are not provided or are empty,
		// the menu should be disabled.
		return !options?.length || disabled;
	}, [options]);

	const checkedOptionValues = useMemo(() => {
		// Skip if options are not provided or are empty.
		if (!options?.length) return;
		// Parse options to the
		return options
			.filter(option => option.checked)
			.map(option => option.value);
	}, [options]);

	const toggleAllActive = useMemo(() => {
		// The toggleAllActive state should be set to true
		// if all options are checked, otherwise it should be false.
		if (!options?.length) return;
		return options.every(option => option.checked);
	}, [options]);

	//
	// B. Handle actions

	const handleToggleAll = () => {
		// Skip if no onChange callback is provided.
		if (!onChange || !options) return;
		// If the toggle is enabled, then toggle OFF
		// all options by setting a new empty array.
		if (toggleAllActive) onChange([]);
		// If the toggle is disabled, then toggle ON
		// all options by setting the values of all options.
		else onChange(options.map(option => option.value));
	};

	//
	// C. Render components

	return (
		<FilterWrapper
			active={active}
			disabled={isDisabled}
			label={label}
		>
			<ScrollArea.Autosize mah={400} offsetScrollbars="y" scrollbars="y" type="auto">
				{withToggleAll && (
					<Checkbox
						key="toggle-all"
						checked={toggleAllActive}
						label="Selecionar Tudo"
						onChange={handleToggleAll}
						value="all"
					/>
				)}
				<Checkbox.Group onChange={onChange} value={checkedOptionValues}>
					{options?.map(option => (
						<Checkbox
							key={option.value}
							disabled={option.disabled}
							label={option.label}
							value={option.value}
						/>
					))}
				</Checkbox.Group>
			</ScrollArea.Autosize>
		</FilterWrapper>
	);

	//
};
