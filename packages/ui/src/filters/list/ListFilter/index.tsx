'use client';

import { Checkbox, ScrollArea } from '@mantine/core';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Label, type SelectDataItem } from '../../../components';
import { FilterWrapper, FilterWrapperRef } from '../../shared';

/* * */

interface ListFilterProps {
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

export function ListFilter({ active, disabled, isMultiple = true, label, onChange, onClose, options, withToggleAll }: ListFilterProps) {
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
		return [...new Set(options.filter(o => o.checked).map(o => o.value))];
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
			const allOption: SelectDataItem = {
				checked: toggleAllActive,
				disabled: false,
				label: t('shared:filters.ListFilter.toggle_all'),
				value: 'all',
			};
			return [allOption, ...options];
		}
		return options;
	}, [options, isMultiple, withToggleAll, toggleAllActive, t]);

	const optionGroups = useMemo(() => {
		const groups = new Map<string, SelectDataItem[]>();
		for (const option of displayOptions) {
			const group = option.group ?? '';
			const groupOptions = groups.get(group) ?? [];
			groupOptions.push(option);
			groups.set(group, groupOptions);
		}
		return [...groups.entries()];
	}, [displayOptions]);

	//
	// C. Handle actions

	const handleMultiToggleAll = () => {
		if (!onChange || !options) return;
		if (toggleAllActive) onChange([]);
		else onChange([...new Set(options.map(o => o.value))]);
	};

	const handleSingleOptionSelect = (value: string) => {
		if (!onChange) return;
		onChange([value]);
		filterWrapperRef.current?.close();
		if (onClose) onClose();
	};

	const handleSingleAllSelect = () => {
		// For "all" option, select all available options (excluding "all" itself)
		const allValues = [...new Set(options.map(opt => opt.value))];
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
						label={t('shared:filters.ListFilter.toggle_all')}
						onChange={handleMultiToggleAll}
						value="all"
					/>
				)}

				{isMultiple ? (
					<Checkbox.Group onChange={onChange} value={checkedOptionValues}>
						{optionGroups.map(([group, groupOptions]) => (
							<div key={group}>
								{group && <Label size="sm" variant="muted">{group}</Label>}
								{groupOptions.map(option => (
									<Checkbox key={option.value} disabled={option.disabled} label={option.label} value={option.value} />
								))}
							</div>
						))}
					</Checkbox.Group>
				) : optionGroups.map(([group, groupOptions]) => (
					<div key={group}>
						{group && <Label size="sm" variant="muted">{group}</Label>}
						{groupOptions.map(option => (
							<Checkbox
								key={option.value}
								checked={checkedOptionValues.includes(option.value) || (option.value === 'all' && toggleAllActive)}
								disabled={option.disabled}
								label={option.label}
								onChange={() => handleOptionSelect(option)}
								value={option.value}
							/>
						))}
					</div>
				))}

			</ScrollArea.Autosize>
		</FilterWrapper>
	);
}
