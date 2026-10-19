'use client';

import { Checkbox, Divider, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { type SelectDataItem } from '../../../components/inputs/Select';
import { FilterWrapper, type FilterWrapperRef } from '../../shared/FilterWrapper';
import { ListFilterOptions } from '../ListFilterOptions';

/* * */

interface ListFilterProps {
	active?: boolean
	disabled?: boolean
	isMultiple?: boolean
	label: string
	onChange?: (values: string[]) => void
	onClose?: () => void
	options?: SelectDataItem[]
	withSearch?: boolean
	withToggleAll?: boolean
}

/* * */

export function ListFilter({ active, disabled, isMultiple = true, label, onChange, onClose, options = [], withSearch = true, withToggleAll }: ListFilterProps) {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation();
	const [search, setSearch] = useState('');
	const filterWrapperRef = useRef<FilterWrapperRef>(null);

	//
	// B. Transform data

	const checkedOptionValues = useMemo(() => options.filter(option => option.checked).map(option => option.value), [options]);
	const toggleAllActive = options.length > 0 && checkedOptionValues.length === options.length;
	const normalizedSearch = withSearch ? search.trim().toLocaleLowerCase() : '';
	const filteredOptions = useMemo(() => options
		.filter(option => `${option.label} ${option.description ?? ''} ${option.keywords ?? ''}`.toLocaleLowerCase().includes(normalizedSearch))
		.sort((left, right) => left.label.localeCompare(right.label, i18n.language, { numeric: true, sensitivity: 'base' })), [i18n.language, normalizedSearch, options]);

	//
	// C. Handle actions

	const handleClose = () => {
		setSearch('');
		onClose?.();
	};

	const handleToggleAll = () => {
		onChange?.(isMultiple && toggleAllActive ? [] : options.map(option => option.value));
		if (!isMultiple) filterWrapperRef.current?.close();
	};

	const handleOptionSelect = (option: SelectDataItem) => {
		if (option.disabled || !onChange) return;
		if (isMultiple) {
			onChange(option.checked ? checkedOptionValues.filter(value => value !== option.value) : [...checkedOptionValues, option.value]);
		} else {
			onChange([option.value]);
			filterWrapperRef.current?.close();
		}
	};

	//
	// D. Render components

	return (
		<FilterWrapper ref={filterWrapperRef} active={active} disabled={disabled} label={label} onClose={handleClose}>

			{(withSearch || withToggleAll) && (
				<>
					<div className={styles.header}>
						{withSearch && (
							<TextInput
								aria-label={t('shared:filters.ListFilter.search')}
								leftSection={<IconSearch size={16} />}
								onChange={event => setSearch(event.currentTarget.value)}
								placeholder={t('shared:filters.ListFilter.search')}
								value={search}
								autoFocus
							/>
						)}
						{withToggleAll && options.length > 0 && (
							<Checkbox
								checked={toggleAllActive}
								indeterminate={isMultiple && !toggleAllActive && checkedOptionValues.length > 0}
								label={t('shared:filters.ListFilter.toggle_all')}
								onChange={handleToggleAll}
							/>
						)}
					</div>
					<Divider />
				</>
			)}

			<ListFilterOptions
				key={normalizedSearch}
				emptyMessage={t(options.length ? 'shared:filters.ListFilter.no_results' : 'shared:filters.ListFilter.empty')}
				onSelect={handleOptionSelect}
				options={filteredOptions}
			/>

		</FilterWrapper>
	);
}
