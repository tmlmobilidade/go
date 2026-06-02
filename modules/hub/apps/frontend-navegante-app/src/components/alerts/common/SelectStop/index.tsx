// 'use client';

// /* * */

// import { StopDisplay } from '@/components/stops/common/StopDisplay';
// import { useStopsContext } from '@/components/stops/Stops.context';
// import { createDocCollection } from '@/hooks/useOtherSearch';
// import { ActionIcon, Combobox, Group, TextInput, useCombobox } from '@mantine/core';
// import { useDebouncedValue } from '@mantine/hooks';
// import { IconBusStop, IconSelector, IconX } from '@tabler/icons-react';
// import { type HubStop } from '@tmlmobilidade/types';
// import { useMemo, useState } from 'react';
// import { useTranslation } from 'react-i18next';

// import styles from './styles.module.css';

// /* * */

// interface SelectStopProps {
// 	data: HubStop[]
// 	label?: string
// 	nothingFound?: string
// 	onSelectStopId: (stopId: null | string) => void
// 	placeholder?: string
// 	selectedStopId: null | string
// 	variant: 'default' | 'white'
// }

// /* * */

// export function SelectStop({ data = [], label, nothingFound, onSelectStopId, placeholder, selectedStopId, variant }: SelectStopProps) {
// 	//

// 	//
// 	// A. Setup variables

// 	const { t } = useTranslation();
// 	const [searchQuery, setSearchQuery] = useState('');
// 	const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 200);

// 	const stopsContext = useStopsContext();

// 	const comboboxStore = useCombobox();

// 	//
// 	// B. Transform data

// 	const { search } = useMemo(() => {
// 		// Prepare data for search function
// 		const preparedSearchCollection = stopsContext.data.stops.map((item) => {
// 			return {
// 				...item,
// 			};
// 		});
// 		return createDocCollection(preparedSearchCollection, {
// 			id: 2,
// 			long_name: 1,
// 			short_name: 1,
// 			tts_name: 1.5,
// 		});
// 	}, [data]);

// 	const selectedStopData = useMemo(() => {
// 		return data.find(item => String(item._id) === selectedStopId);
// 	}, [data, selectedStopId]);

// 	//
// 	// C. Search

// 	const allStopsDataFilteredBySearchQuery = useMemo(() => {
// 		const filteredData = debouncedSearchQuery ? search(debouncedSearchQuery) : data;
// 		return filteredData.slice(0, 100);
// 	}, [debouncedSearchQuery, search, data]);

// 	//
// 	// D. Handle actions

// 	const handleClickSearchField = ({ currentTarget }) => {
// 		if (currentTarget.select) currentTarget.select();
// 		comboboxStore.openDropdown();
// 	};

// 	const handleExitSearchField = () => {
// 		comboboxStore.closeDropdown();
// 	};

// 	const handleClearSearchField = () => {
// 		setSearchQuery('');
// 		onSelectStopId(null);
// 		comboboxStore.openDropdown();
// 	};

// 	const handleSearchQueryChange = ({ currentTarget }) => {
// 		setSearchQuery(currentTarget.value);
// 		comboboxStore.updateSelectedOptionIndex();
// 		comboboxStore.selectFirstOption();
// 	};

// 	const handleSelectStop = (chosenSelectItemValue) => {
// 		onSelectStopId(chosenSelectItemValue);
// 		comboboxStore.closeDropdown();
// 	};

// 	//
// 	// E. Render components

// 	return (
// 		<Combobox onOptionSubmit={handleSelectStop} store={comboboxStore}>
// 			<Combobox.Target>
// 				{selectedStopData && !comboboxStore.dropdownOpened
// 					? (
// 						<Group className={`${styles.comboboxTargetWrapper} ${variant === 'white' && styles.variantWhite}`} onClick={handleClickSearchField}>
// 							<div className={styles.comboboxTargetSection} data-position="left">
// 								<IconBusStop size={20} />
// 							</div>
// 							<div className={styles.comboboxTargetInput}>
// 								<StopDisplay stopData={selectedStopData} />
// 							</div>
// 							<div className={styles.comboboxTargetSection} data-position="right">
// 								<ActionIcon color="gray" onClick={handleClearSearchField} size="md" variant="subtle">
// 									<IconX size={20} />
// 								</ActionIcon>
// 							</div>
// 						</Group>
// 					)
// 					: (
// 						<TextInput
// 							aria-label={label || t('default:alerts.AlertsListToolbar.SelectStop.label')}
// 							autoComplete="off"
// 							leftSection={<IconBusStop size={20} />}
// 							onBlur={handleExitSearchField}
// 							onChange={handleSearchQueryChange}
// 							onClick={handleClickSearchField}
// 							onFocus={handleClickSearchField}
// 							placeholder={placeholder || t('default:alerts.AlertsListToolbar.SelectStop.placeholder')}
// 							type="search"
// 							value={searchQuery}
// 							variant={variant}
// 							rightSection={
// 								searchQuery
// 									? (
// 										<ActionIcon color="gray" onClick={handleClearSearchField} size="md" variant="subtle">
// 											<IconX size={20} />
// 										</ActionIcon>
// 									)
// 									: (
// 										<IconSelector size={18} />
// 									)
// 							}
// 						/>
// 					)}
// 			</Combobox.Target>

// 			<Combobox.Dropdown>
// 				<Combobox.Options mah={200} style={{ overflowY: 'auto' }}>
// 					{allStopsDataFilteredBySearchQuery.length === 0
// 						? <Combobox.Empty>{nothingFound || t('default:alerts.AlertsListToolbar.SelectStop.nothing_found')}</Combobox.Empty>
// 						: allStopsDataFilteredBySearchQuery.map(item => (
// 							<Combobox.Option key={item.id} className={item.id === selectedStopData?._id ? styles.selected : ''} value={item.id}>
// 								<div className={styles.comboboxOption}>
// 									<StopDisplay stopData={item} />
// 								</div>
// 							</Combobox.Option>
// 						),
// 						)}
// 				</Combobox.Options>
// 			</Combobox.Dropdown>
// 		</Combobox>
// 	);

// 	//
// }
