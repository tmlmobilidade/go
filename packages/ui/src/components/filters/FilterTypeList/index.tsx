'use client';

import { Checkbox, ScrollArea } from '@mantine/core';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { SelectDataItem } from '../../inputs/Select';
import { FilterWrapper, FilterWrapperRef } from '../FilterWrapper';

/* * */

interface FilterTypeListProps {
	active?: boolean
	disabled?: boolean
	isMultiple?: boolean
	label: string
	onChange?: (values: string[]) => void
	onClose?: () => void
	options?: SelectDataItem[]
	withToggleAll?: boolean
}

/* * */

export function FilterTypeList({ active, disabled, isMultiple = true, label, onChange, onClose, options, withToggleAll }: FilterTypeListProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterWrapperRef = useRef<FilterWrapperRef>(null);

	//
	// B. Transform data

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

	// Create options with "all" option when needed
	const displayOptions = useMemo(() => {
		if (!options) return [];
		// If single selection mode and withToggleAll is true,
		// add "all" as first option.
		if (!isMultiple && withToggleAll) {
			const allOption = {
				checked: toggleAllActive,
				disabled: false,
				label: t('shared:components.filters.FilterTypeList.toggle_all'),
				value: 'all',
			};
			return [allOption, ...options];
		}
		return options;
	}, [options, isMultiple, withToggleAll, toggleAllActive]);

	//
	// C. Handle actions

	const handleMultiToggleAll = () => {
		if (!onChange || !options) return;
		if (toggleAllActive) onChange([]);
		else onChange(options.map(o => o.value));
	};

	const handleSingleOptionSelect = (value: string) => {
		if (!onChange) return;
		onChange([value]);
		filterWrapperRef.current?.close();
		if (onClose) onClose();
	};

	const handleSingleAllSelect = () => {
		// For "all" option, select all available options (excluding "all" itself)
		const allValues = options.map(opt => opt.value) || [];
		if (onChange) onChange(allValues);
		// Also close dropdown for "all" selection
		filterWrapperRef.current?.close();
		if (onClose) onClose();
	};

	const handleOptionSelect = (option: SelectDataItem) => {
		if (option.value === 'all') handleSingleAllSelect();
		else handleSingleOptionSelect(option.value);
	};

	//
	// D. Render components

	return (
		<FilterWrapper ref={filterWrapperRef} active={active} disabled={isDisabled} label={label} onClose={onClose}>
			<ScrollArea.Autosize mah={400} offsetScrollbars="y" scrollbars="y" type="auto">

				{isMultiple && withToggleAll && (
					<Checkbox
						key="toggle-all"
						checked={toggleAllActive}
						label={t('shared:components.filters.FilterTypeList.toggle_all')}
						onChange={handleMultiToggleAll}
						value="all"
					/>
				)}

				{isMultiple && (
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
				)}

				{!isMultiple && displayOptions?.map(option => (
					<Checkbox
						key={option.value}
						checked={checkedOptionValues.includes(option.value) || (option.value === 'all' && toggleAllActive)}
						disabled={option.disabled}
						label={option.label}
						onChange={() => handleOptionSelect(option)}
						value={option.value}
					/>
				))}

			</ScrollArea.Autosize>
		</FilterWrapper>
	);

	//
}
