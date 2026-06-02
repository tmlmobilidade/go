'use client';

/* * */

import type { Line } from '@carrismetropolitana/api-types/network';

import { LineDisplay } from '@/components/lines/common/LineDisplay';
import { createDocCollection } from '@/hooks/useOtherSearch';
import { ActionIcon, Combobox, Group, TextInput, useCombobox } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconArrowLoopRight, IconSelector, IconX } from '@tabler/icons-react';
import { HubLine } from '@tmlmobilidade/types';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface SelectLineProps {
	data: HubLine[]
	label?: string
	nothingFound?: string
	onSelectLineId: (lineId: null | string) => void
	placeholder?: string
	selectedLineId: null | string
	variant: 'default' | 'white'
}

/* * */

export function SelectLine({ data = [], nothingFound, onSelectLineId, placeholder, selectedLineId, variant }: SelectLineProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const comboboxStore = useCombobox();
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 200);

	//
	// B. Transform data

	const { search } = useMemo(() => {
		return createDocCollection(data, {
			id: 2,
			locality_ids: 1,
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

	const handleClickSearchField = ({ currentTarget }) => {
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

	const handleSearchQueryChange = ({ currentTarget }) => {
		setSearchQuery(currentTarget.value);
		comboboxStore.updateSelectedOptionIndex();
		comboboxStore.selectFirstOption();
	};

	const handleSelectLine = (chosenSelectItemValue) => {
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
						<Group className={`${styles.comboboxTargetWrapper} ${variant === 'white' && styles.variantWhite}`} onClick={handleClickSearchField}>
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
							autoComplete="off"
							leftSection={<IconArrowLoopRight size={20} />}
							onBlur={handleExitSearchField}
							onChange={handleSearchQueryChange}
							onClick={handleClickSearchField}
							onFocus={handleClickSearchField}
							placeholder={placeholder || t('default:alerts.AlertsListToolbar.SelectLine.placeholder')}
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
						? <Combobox.Empty>{nothingFound || t('default:alerts.AlertsListToolbar.SelectLine.nothing_found')}</Combobox.Empty>
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
