'use client';

import { Line } from '@carrismetropolitana/api-types/network';
import { ActionIcon, Combobox, Group, TextInput, useCombobox } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconArrowLoopRight, IconSelector, IconX } from '@tabler/icons-react';
import clsx from 'clsx';
import { useMemo, useState } from 'react';

import styles from './styles.module.css';

import { createDocCollection } from '../../../hooks/use-other-search';
import { Loader } from '../../loaders/Loader';
import { LineDisplay } from '../LineDisplay';

/* * */

export interface LineSelectProps {
	data: Line[]
	label?: string
	loading?: boolean
	nothingFound?: string
	onSelectLineId: (lineId: null | string) => void
	placeholder?: string
	selectedLineId: null | string
	variant: 'default' | 'white'
}

/* * */

export function LineSelect({ data = [], label, loading, nothingFound = 'Nenhuma linha encontrada', onSelectLineId, placeholder = 'Selecione uma linha', selectedLineId, variant }: LineSelectProps) {
	//

	//
	// A. Setup variables

	const comboboxStore = useCombobox();
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 200);

	//
	// B. Transform data

	const { search } = useMemo(() => {
		const boostedData = data.map(item => ({ ...item, boost: selectedLineId === item.id ? 10 : 1 }));
		return createDocCollection(boostedData, {
			id: 1,
			locality_ids: 0.8,
			long_name: 0.8,
			short_name: 0.7,
			tts_name: 0.8,
		});
	}, [data]);

	const selectedLineData = useMemo(() => {
		return data.find(item => item.id === selectedLineId);
	}, [selectedLineId, data]);

	//
	// C. Search

	const allLinesDataFilteredBySearchQuery = useMemo(() => {
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
		onSelectLineId(null);
		comboboxStore.openDropdown();
	};

	const handleSearchQueryChange = ({ currentTarget }: { currentTarget: HTMLInputElement }) => {
		setSearchQuery(currentTarget.value);
		comboboxStore.updateSelectedOptionIndex();
		comboboxStore.selectFirstOption();
	};

	const handleSelectLine = (chosenSelectItemValue: string) => {
		onSelectLineId(chosenSelectItemValue);
		comboboxStore.closeDropdown();
	};

	//
	// E. Render components

	return (
		<Combobox onOptionSubmit={handleSelectLine} store={comboboxStore}>
			<Combobox.Target>
				{selectedLineData && !comboboxStore.dropdownOpened
					? (
						<Group
							className={clsx(styles.comboboxTargetWrapper, variant === 'white' && styles.variantWhite)}
							onClick={() => {
								comboboxStore.openDropdown();
							}}
						>
							<div className={styles.comboboxTargetSection} data-position="left">
								<IconArrowLoopRight size={20} />
							</div>
							<div className={styles.comboboxTargetInput}>
								<LineDisplay lineData={selectedLineData} />
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
							leftSection={loading ? <Loader size="sm" /> : <IconArrowLoopRight size={20} />}
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
					{allLinesDataFilteredBySearchQuery.length === 0
						? <Combobox.Empty>{nothingFound}</Combobox.Empty>
						: allLinesDataFilteredBySearchQuery.map(item => (
							<Combobox.Option key={item.id} className={item.id === selectedLineData?.id ? styles.selected : ''} value={item.id}>
								<div className={styles.comboboxOption}>
									<LineDisplay lineData={item} />
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
