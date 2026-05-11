'use client';

import { type Stop } from '@carrismetropolitana/api-types/network';
import { ActionIcon, Combobox, Group, TextInput, useCombobox } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconBusStop, IconSelector, IconX } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

import styles from './styles.module.css';

import { createDocCollection } from '../../../hooks/use-other-search';
import { Loader } from '../../loaders/Loader';
import { StopDisplay } from '../StopDisplay';

/* * */

interface SelectStopProps {
	data: Stop[]
	label?: string
	loading?: boolean
	nothingFound?: string
	onSelectStopId: (stopId: null | string) => void
	placeholder?: string
	selectedStopId: null | string
	variant: 'default' | 'white'
}

/* * */

export function StopSelect({ data = [], label, loading, nothingFound = 'Nenhuma paragem encontrada', onSelectStopId, placeholder = 'Selecione uma paragem', selectedStopId, variant }: SelectStopProps) {
	//

	//
	// A. Setup variables

	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 200);

	const comboboxStore = useCombobox();

	//
	// B. Transform data

	const { search } = useMemo(() => {
		// Prepare data for search function
		const preparedSearchCollection = data.map(item => ({ ...item, boost: selectedStopId === item.id ? 10 : 1 }));
		return createDocCollection(preparedSearchCollection, {
			id: 1,
			long_name: 0.8,
			short_name: 0.7,
		});
	}, [data]);

	const selectedStopData = useMemo(() => {
		return data.find(item => item.id === selectedStopId);
	}, [data, selectedStopId]);

	//
	// C. Search

	const allStopsDataFilteredBySearchQuery = useMemo(() => {
		const filteredData = debouncedSearchQuery ? search(debouncedSearchQuery) : data;
		return filteredData.slice(0, 100);
	}, [debouncedSearchQuery, search, data]);

	//
	// D. Handle actions

	const handleClickSearchField = ({ currentTarget }: { currentTarget: HTMLInputElement }) => {
		if (currentTarget.select) currentTarget.select();
		comboboxStore.openDropdown();
	};

	const handleExitSearchField = () => {
		comboboxStore.closeDropdown();
	};

	const handleClearSearchField = () => {
		setSearchQuery('');
		onSelectStopId(null);
		comboboxStore.openDropdown();
	};

	const handleSearchQueryChange = ({ currentTarget }: { currentTarget: HTMLInputElement }) => {
		setSearchQuery(currentTarget.value);
		comboboxStore.updateSelectedOptionIndex();
		comboboxStore.selectFirstOption();
	};

	const handleSelectStop = (chosenSelectItemValue: string) => {
		onSelectStopId(chosenSelectItemValue);
		comboboxStore.closeDropdown();
	};

	//
	// E. Render components

	return (
		<Combobox onOptionSubmit={handleSelectStop} store={comboboxStore}>
			<Combobox.Target>
				{selectedStopData && !comboboxStore.dropdownOpened
					? (
						<Group className={`${styles.comboboxTargetWrapper} ${variant === 'white' && styles.variantWhite}`} onClick={() => comboboxStore.openDropdown()}>
							<div className={styles.comboboxTargetSection} data-position="left">
								<IconBusStop size={20} />
							</div>
							<div className={styles.comboboxTargetInput}>
								<StopDisplay stopData={selectedStopData} />
							</div>
							<div className={styles.comboboxTargetSection} data-position="right">
								<ActionIcon color="gray" onClick={handleClearSearchField} size="md" variant="subtle">
									<IconX size={20} />
								</ActionIcon>
							</div>
						</Group>
					)
					: (
						<TextInput
							aria-label={label}
							autoComplete="off"
							classNames={{ input: styles.comboboxTargetTextInput }}
							leftSection={loading ? <Loader size="sm" /> : <IconBusStop size={20} />}
							onBlur={handleExitSearchField}
							onChange={handleSearchQueryChange}
							onClick={handleClickSearchField}
							onFocus={handleClickSearchField}
							placeholder={placeholder}
							type="search"
							value={searchQuery}
							variant={variant}
							rightSection={
								searchQuery
									? (
										<ActionIcon color="gray" onClick={handleClearSearchField} size="md" variant="subtle">
											<IconX size={20} />
										</ActionIcon>
									)
									: (
										<IconSelector size={18} />
									)
							}
						/>
					)}
			</Combobox.Target>

			<Combobox.Dropdown>
				<Combobox.Options mah={200} style={{ overflowY: 'auto' }}>
					{allStopsDataFilteredBySearchQuery.length === 0
						? <Combobox.Empty>{nothingFound}</Combobox.Empty>
						: allStopsDataFilteredBySearchQuery.map(item => (
							<Combobox.Option key={item.id} className={item.id === selectedStopData?.id ? styles.selected : ''} value={item.id}>
								<div className={styles.comboboxOption}>
									<StopDisplay stopData={item} />
								</div>
							</Combobox.Option>
						),
						)}
				</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	);

	//
}
