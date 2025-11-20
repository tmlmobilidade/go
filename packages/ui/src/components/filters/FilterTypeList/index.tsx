'use client';

/* * */

import { Checkbox, ScrollArea } from '@mantine/core';
import { useMemo, useRef } from 'react';

import { FilterWrapper, FilterWrapperRef } from '../FilterWrapper';

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
	isMultiple?: boolean
	label: string
	onChange?: (values: string[]) => void
	onClose?: () => void
	options?: FilterTypeListOption[]
	withToggleAll?: boolean
}

export function FilterTypeList({
	active,
	disabled,
	isMultiple = true,
	label,
	onChange,
	onClose,
	options,
	withToggleAll,
}: FilterTypeListProps) {
	const filterWrapperRef = useRef<FilterWrapperRef>(null);

	const isDisabled = useMemo(() => {
		return !options?.length || disabled;
	}, [options, disabled]);

	const checkedOptionValues = useMemo(() => {
		if (!options?.length) return [];
		return options.filter(o => o.checked).map(o => o.value);
	}, [options]);

	const toggleAllActive = useMemo(() => {
		if (!options?.length) return false;
		return options.every(o => o.checked);
	}, [options]);

	const handleToggleAll = () => {
		if (!onChange || !options) return;
		if (toggleAllActive) onChange([]);
		else onChange(options.map(o => o.value));
	};

	// When isMultiple = false, selecting one option forces it to be the only selected one.
	const handleSingleSelect = (value: string) => {
		if (!onChange) return;
		onChange([value]);
		// Auto-close dropdown when single selection is made
		filterWrapperRef.current?.close();
		onClose?.();
	};

	// Create options with "all" option when needed
	const displayOptions = useMemo(() => {
		if (!options) return [];

		// If single selection mode and withToggleAll is true, add "all" as first option
		if (!isMultiple && withToggleAll) {
			const allOption = {
				checked: toggleAllActive,
				disabled: false,
				label: 'Selecionar Tudo',
				value: 'all',
			};
			return [allOption, ...options];
		}

		return options;
	}, [options, isMultiple, withToggleAll, toggleAllActive]);

	return (
		<FilterWrapper ref={filterWrapperRef} active={active} disabled={isDisabled} label={label} onClose={onClose}>
			<ScrollArea.Autosize mah={400} offsetScrollbars="y" scrollbars="y" type="auto">

				{withToggleAll && isMultiple && (
					<Checkbox
						key="toggle-all"
						checked={toggleAllActive}
						label="Selecionar Tudo"
						onChange={handleToggleAll}
						value="all"
					/>
				)}

				{isMultiple ? (
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
				) : (
					<>
						{displayOptions?.map((option) => {
							// Handle special "all" option for single selection
							const handleOptionSelect = () => {
								if (option.value === 'all') {
									// For "all" option, select all available options (excluding "all" itself)
									const allValues = options?.map(opt => opt.value) || [];
									onChange?.(allValues);
									// Also close dropdown for "all" selection
									filterWrapperRef.current?.close();
									onClose?.();
								}
								else {
									handleSingleSelect(option.value);
								}
							};

							return (
								<Checkbox
									key={option.value}
									checked={checkedOptionValues.includes(option.value) || (option.value === 'all' && toggleAllActive)}
									disabled={option.disabled}
									label={option.label}
									onChange={handleOptionSelect}
									value={option.value}
								/>
							);
						})}
					</>
				)}

			</ScrollArea.Autosize>
		</FilterWrapper>
	);
}
