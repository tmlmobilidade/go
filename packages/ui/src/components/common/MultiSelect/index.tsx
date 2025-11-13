'use client';

import { CheckIcon, Combobox, Group, Pill, PillsInput, ScrollArea, useCombobox } from '@mantine/core';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

interface DataItem {
	icon?: React.ReactNode
	label: string
	value: string
}

interface MultiSelectProps {
	className?: string
	clearable?: boolean
	data: DataItem[]
	description?: string
	disabled?: boolean
	error?: string
	label?: string
	limit?: number
	maxHeight?: number
	onChange?: (selected: string[]) => void
	onPaste?: (pastedValues: string[]) => void
	searchable?: boolean
	selected: string[]
	width?: number | string
}

export default function MultiSelect({
	clearable = true,
	data,
	description,
	disabled,
	error,
	label,
	limit,
	maxHeight,
	onChange,
	onPaste,
	searchable = true,
	selected,
	width,
}: MultiSelectProps) {
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
		onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
	});

	const [search, setSearch] = useState('');
	const [value, setValue] = useState<DataItem[]>(() => {
		// Initialize with DataItems that match the selected values
		return data.filter(item => selected.includes(item.value));
	});

	// Sync internal state with selected prop
	useEffect(() => {
		// Convert selected values to DataItems
		const selectedItems = data.filter(item => selected.includes(item.value));
		setValue(selectedItems);
	}, [selected, data]);

	const handleValueSelect = (selectedItem: DataItem) => {
		const newValue = value.some(item => item.value === selectedItem.value)
			? value.filter(item => item.value !== selectedItem.value)
			: [...value, selectedItem];

		setSearch('');
		setValue(newValue);
		onChange?.(newValue.map(item => item.value));
	};

	const handleOptionSubmit = (optionValue: string) => {
		const selectedItem = data.find(item => item.value === optionValue);
		if (selectedItem) {
			handleValueSelect(selectedItem);
		}
	};

	const handleValueRemove = (itemToRemove: DataItem) => {
		const newValue = value.filter(item => item.value !== itemToRemove.value);
		setValue(newValue);
		onChange?.(newValue.map(item => item.value));
	};

	const values = value.map(item => (
		<Pill key={item.value} className={styles.pill} onRemove={() => handleValueRemove(item)} withRemoveButton>
			{item.icon && <span style={{ marginRight: '0.25rem' }}>{item.icon}</span>}
			{item.label}
		</Pill>
	));

	const filteredData = searchable
		? data.filter(item =>
			item.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')),
		)
		: data;

	// Apply limit if specified
	const limitedData = limit && filteredData.length > limit ? filteredData.slice(0, limit) : filteredData;
	const hasMoreItems = limit && filteredData.length > limit;
	const hiddenCount = hasMoreItems ? filteredData.length - limit : 0;

	const options = limitedData.map((item) => {
		const isSelected = value.some(selectedItem => selectedItem.value === item.value);
		return (
			<Combobox.Option
				key={item.value}
				active={isSelected}
				onClick={() => handleValueSelect(item)}
				value={item.value}
			>
				<Group gap="sm">
					{isSelected ? <CheckIcon size={12} /> : null}
					{item.icon && <span>{item.icon}</span>}
					<span>{item.label}</span>
				</Group>
			</Combobox.Option>
		);
	});

	const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		event.preventDefault();

		const pastedText = event.clipboardData.getData('text');
		if (!pastedText.trim()) return;

		// Split by common delimiters: comma, semicolon, newline, tab
		const pastedValues = pastedText
			.split(/[,;\n\t]+/)
			.map(val => val.trim())
			.filter(val => val.length > 0);

		// Call custom onPaste handler if provided
		onPaste?.(pastedValues);

		// Find matching items from data
		const matchingItems: DataItem[] = [];

		pastedValues.forEach((pastedValue) => {
			// Try to match by value first
			let matchedItem = data.find(item =>
				item.value.toLowerCase() === pastedValue.toLowerCase(),
			);

			// If no match by value, try to match by label
			if (!matchedItem) {
				matchedItem = data.find(item =>
					item.label.toLowerCase() === pastedValue.toLowerCase(),
				);
			}

			// If found and not already selected, add to matching items
			if (matchedItem && !value.some(v => v.value === matchedItem.value)) {
				matchingItems.push(matchedItem);
			}
		});

		// Add matching items to selection
		if (matchingItems.length > 0) {
			const newValue = [...value, ...matchingItems];
			setValue(newValue);
			onChange?.(newValue.map(item => item.value));
		}

		// Clear search after paste
		setSearch('');
	};

	return (
		<div style={{ width }}>
			<Combobox
				disabled={disabled}
				onOptionSubmit={handleOptionSubmit}
				store={combobox}
				withinPortal={false}
				classNames={{
					dropdown: styles.dropdown,
					option: styles.option,
				}}
			>
				<Combobox.DropdownTarget>
					<PillsInput
						data-focus={combobox.dropdownOpened}
						description={description}
						error={error}
						label={label}
						onClick={() => combobox.openDropdown()}
						onPaste={handlePaste}
						style={{ width: '100%' }}
						classNames={{
							description: styles.description,
							error: styles.error,
							input: styles.input,
							label: styles.label,
						}}
					>
						<Pill.Group className={styles.pillGroup}>
							{values}

							<Combobox.EventsTarget>
								<PillsInput.Field
									disabled={disabled}
									onBlur={() => combobox.closeDropdown()}
									onFocus={() => combobox.openDropdown()}
									placeholder={searchable ? 'Search values' : 'Select values'}
									readOnly={!searchable}
									value={searchable ? search : ''}
									onChange={(event) => {
										if (searchable) {
											combobox.updateSelectedOptionIndex();
											setSearch(event.currentTarget.value);
										}
									}}
									onKeyDown={(event) => {
										if (event.key === 'Backspace' && search.length === 0 && value.length > 0) {
											event.preventDefault();
											const lastItem = value[value.length - 1];
											if (lastItem) {
												handleValueRemove(lastItem);
											}
										}
									}}
								/>
							</Combobox.EventsTarget>

							{clearable && (
								<Combobox.ClearButton
									className={styles.clearButton}
									onClear={() => {
										setValue([]);
										onChange?.([]);
									}}
								/>
							)}
						</Pill.Group>
					</PillsInput>
				</Combobox.DropdownTarget>

				<Combobox.Dropdown className={styles.dropdownWrapper} style={{ maxHeight }}>
					<Combobox.Options>
						<ScrollArea.Autosize mah={200} type="scroll">
							{options.length > 0 ? (
								<>
									{options}
									{hasMoreItems && (
										<div
											style={{
												borderTop: '1px solid var(--mantine-color-gray-3)',
												color: 'var(--mantine-color-dimmed)',
												fontSize: '0.875rem',
												marginTop: '4px',
												padding: '8px 12px',
											}}
										>
											{hiddenCount} more items... Type to search
										</div>
									)}
								</>
							) : (
								<Combobox.Empty>Nothing found...</Combobox.Empty>
							)}
						</ScrollArea.Autosize>
					</Combobox.Options>
				</Combobox.Dropdown>
			</Combobox>
		</div>
	);
}
