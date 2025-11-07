/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ActionIcon, CheckIcon, Group, Input, InputBase, Combobox as MantineCombobox, ComboboxProps as MantineComboboxProps, Pill, PillsInput, useCombobox } from '@mantine/core';
import { IconCaretDownFilled, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { ViewportList } from 'react-viewport-list';

import styles from './styles.module.css';

import { cn } from '../../../lib/utils';

// Define DataItem type
export interface DataItem {
	icon?: React.ReactNode
	label: string
	value: string
}

function parseComboboxItem(item: DataItem | string): DataItem {
	if (typeof item === 'string') {
		return {
			icon: null,
			label: item,
			value: item,
		};
	}
	return item;
}

// Base Props without 'multiple'
interface BaseProps extends Omit<MantineComboboxProps, 'onChange' | 'value'> {
	className?: string
	clearable?: boolean
	data: DataItem[] | string[]
	description?: string
	error?: string
	fullWidth?: boolean
	label?: string
	maxHeight?: number
	placeholder?: string
	searchable?: boolean
}

// Props for single selection
interface SingleProps extends BaseProps {
	multiple?: false
	onChange?: (value: string | undefined) => void
	value?: string | undefined
}

// Props for multiple selection
interface MultipleProps extends BaseProps {
	multiple: true
	onChange?: (value: string[] | undefined) => void
	value?: string[] | undefined
}

// Combine Props using Discriminated Unions
export type Props = MultipleProps | SingleProps;

export default function ComboboxComponent(props: Props) {
	const {
		className,
		clearable = false,
		data = [],
		description,
		error,
		fullWidth = false,
		label,
		maxHeight = 200,
		multiple = false,
		onChange,
		searchable = false,
		...rest
	} = props;

	// Setup Combobox store
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
		onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
	});

	// Define state with conditional types
	const [value, setValue] = useState<string | string[] | undefined>(
		props.value || (clearable ? undefined : multiple ? [] : undefined),
	);
	const [search, setSearch] = useState<string>('');

	// Reset value when props.value changes
	useEffect(() => {
		resetValue(props.value);
	}, [multiple, props.value]);

	// Helper functions
	const getValue = (val: DataItem | string) =>
		typeof val === 'string' ? val : val.value;

	/**
	 * Resets the value based on initialValue or default state.
	 */
	const resetValue = (initialValue?: string | string[]) => {
		const newValue = initialValue || (multiple ? [] : undefined);
		setValue(newValue);
		setSearch('');
		onChange?.(newValue as any); // Type assertion handled via discriminated union
	};

	/**
	 * Updates the current value based on selection.
	 */
	function updateValue(val: string) {
		if (multiple && Array.isArray(value)) {
			let updatedValue: string[];
			if (value.some(v => v === val)) {
				updatedValue = value.filter(
					(v: string) => v !== getValue(val),
				);
			}
			else {
				updatedValue = [...value, val];
			}
			setValue(updatedValue);
			onChange?.(updatedValue as any); // Type assertion handled via discriminated union
		}
		else {
			const newValue = val;
			const itemData = data.find(dataItem => getValue(dataItem) === val);
			if (!itemData) return;

			setSearch(searchable ? parseComboboxItem(itemData)?.label : '');
			setValue(newValue as any);
			onChange?.(newValue as any); // Type assertion handled via discriminated union
			combobox.closeDropdown();
		}
	}

	/**
	 * Removes a specified value from the selection.
	 */
	function removeValue(val: string) {
		if (multiple && Array.isArray(value)) {
			const updatedValue = value.filter(
				(v: string) => v !== val,
			);
			setValue(updatedValue);
			onChange?.(updatedValue as any); // Type assertion handled via discriminated union
		}
		else {
			setValue(undefined);
			onChange?.(undefined);
		}
	}

	/**
	 * Filters data based on search input.
	 */
	function filterData() {
		return searchable
			? data.filter(item =>
				typeof item === 'string'
					? item
						.toLowerCase()
						.includes(search.trim().toLowerCase())
					: item.label
						.toLowerCase()
						.includes(search.trim().toLowerCase()),
			)
			: data;
	}

	/**
	 * Handles changes in the search input field.
	 */
	function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
		const inputValue = event.currentTarget.value;
		setSearch(inputValue);
		combobox.openDropdown();
		combobox.updateSelectedOptionIndex();
	}

	// Render Clear Button
	function renderClearButton() {
		if (
			clearable
			&& value
			&& (Array.isArray(value) ? value.length > 0 : true)
		) {
			return (
				<ActionIcon
					aria-label="Clear value"
					className={styles.icon}
					onClick={() => resetValue()}
					style={{ cursor: 'pointer' }}
					variant="transparent"
				>
					<IconX size={24} />
				</ActionIcon>
			);
		}
		return <IconCaretDownFilled className={styles.icon} size={24} />;
	}

	// Render Selected Values as Pills
	function renderValues() {
		if (multiple && Array.isArray(value)) {
			return value.map((item: string) => {
				const itemData = parseComboboxItem(data.find(dataItem => getValue(dataItem) === item) || '');
				if (!itemData) return null;
				return (
					<Pill
						key={item}
						className={styles.pill}
						onRemove={() => removeValue(item)}
						withRemoveButton
					>
						<div className={styles.labelWrapper}>
							{itemData.icon && <span className={styles.icon}>{itemData.icon}</span>}
							<span>{itemData.label}</span>
						</div>
					</Pill>
				);
			});
		}
		return null;
	}

	// Render Combobox Options
	function renderOptions() {
		const filtered = filterData();
		return (
			<ViewportList itemMargin={maxHeight} items={filtered}>
				{(item) => {
					const itemData = parseComboboxItem(item);

					return (
						<MantineCombobox.Option
							key={itemData.value}
							value={itemData.value}
							active={
								Array.isArray(value)
								&& value.some(v => getValue(v) === itemData.value)
							}
						>
							<Group gap="sm">
								{multiple && Array.isArray(value) && value.some(
									v => getValue(v) === itemData.value,
								) && <CheckIcon size={12} />}
								<div className={styles.labelWrapper}>
									{itemData.icon && <span className={styles.icon}>{itemData.icon}</span>}
									<span>{itemData.label}</span>
								</div>
							</Group>
						</MantineCombobox.Option>
					);
				}}
			</ViewportList>
		);
	}

	// Render Input Field
	function renderInput() {
		if (multiple) {
			return (
				<MantineCombobox.DropdownTarget>
					<PillsInput
						className={cn(styles.input, styles.pillInputWrapper)}
						onClick={() => combobox.openDropdown()}
					>
						<Pill.Group style={{ marginRight: '25px' }}>
							{renderValues()}
							<MantineCombobox.EventsTarget>
								<PillsInput.Field
									onBlur={() => combobox.closeDropdown()}
									onChange={handleSearchChange}
									onFocus={() => combobox.openDropdown()}
									placeholder="Search values"
									style={{ backgroundColor: 'transparent' }}
									type={searchable ? 'visible' : 'hidden'}
									value={search}
									onKeyDown={(event) => {
										if (
											event.key === 'Backspace'
											&& !search
											&& Array.isArray(value)
											&& value.length > 0
										) {
											const lastValue
												= value[value.length - 1];
											if (lastValue) {
												removeValue(lastValue);
											}
										}
									}}
								/>
							</MantineCombobox.EventsTarget>
							<div className={styles.pillClearButton}>
								{renderClearButton()}
							</div>
						</Pill.Group>
					</PillsInput>
				</MantineCombobox.DropdownTarget>
			);
		}

		const itemData = parseComboboxItem(data.find(dataItem => getValue(dataItem) === value) || '');
		return (
			<MantineCombobox.Target>
				{searchable ? (
					<InputBase
						className={styles.input}
						leftSection={itemData?.icon}
						onChange={handleSearchChange}
						onClick={() => combobox.openDropdown()}
						onFocus={() => combobox.openDropdown()}
						placeholder="Search value"
						rightSection={renderClearButton()}
						type="text"
						value={search}
						onBlur={() => {
							combobox.closeDropdown();
							setSearch(itemData ? itemData.label : '');
						}}
						rightSectionPointerEvents={
							value === null ? 'none' : 'all'
						}
					/>
				) : (
					<InputBase
						className={styles.input}
						component="button"
						onClick={() => combobox.openDropdown()}
						onFocus={() => combobox.openDropdown()}
						rightSection={renderClearButton()}
						type="button"
						onBlur={() => {
							combobox.closeDropdown();
							setSearch(value?.toString() || '');
						}}
						rightSectionPointerEvents={
							value === null ? 'none' : 'all'
						}
						pointer
					>
						{itemData ? (
							<div className={styles.labelWrapper}>
								{itemData.icon && <span className={styles.icon}>{itemData.icon}</span>}
								<span>{itemData.label}</span>
							</div>
						) : (
							<Input.Placeholder className={styles.placeholder}>
								Pick value
							</Input.Placeholder>
						)}
					</InputBase>
				)}
			</MantineCombobox.Target>
		);
	}

	return (
		<div
			className={cn(styles.wrapper, className)}
			style={{ width: fullWidth ? '100%' : undefined }}
		>
			{label && <label className={styles.label}>{label}</label>}
			{description && <p className={styles.description}>{description}</p>}
			{error && <p className={styles.error}>{error}</p>}
			<MantineCombobox
				store={combobox}
				withinPortal={false}
				onOptionSubmit={(val) => {
					updateValue(val);
				}}
				{...rest}
			>
				{renderInput()}
				<MantineCombobox.Dropdown className={styles.dropdownWrapper}>
					<MantineCombobox.Options
						style={{ maxHeight, overflowY: 'scroll' }}
					>
						{filterData().length > 0 ? (
							renderOptions()
						) : (
							<MantineCombobox.Empty>
								Nothing found...
							</MantineCombobox.Empty>
						)}
					</MantineCombobox.Options>
				</MantineCombobox.Dropdown>
			</MantineCombobox>
		</div>
	);
}
