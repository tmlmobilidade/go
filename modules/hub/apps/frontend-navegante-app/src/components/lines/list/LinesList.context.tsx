'use client';

import { useLinesContext } from '@/components/lines/Lines.context';
import { type HubLine } from '@tmlmobilidade/go-types-public-info';
import { type ListContextStateTemplate, useFilterStateString, type UseFilterStateStringReturnType, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

/* * */

const DEFAULT_QTY_PER_AGENCY = 5;

const DESIRED_AGENCY_ORDER = ['4', '2', '16', '15', '3', 'CM', '1', '21', '8'];

/* * */

interface LinesListGroupData {
	agency_id: string
	lines: HubLine[]
	qty: number
}

interface LinesListContextState extends Omit<ListContextStateTemplate, 'flags'> {
	actions: {
		increaseQtyPerAgency: (agencyId: string) => void
	}
	data: {
		filtered: LinesListGroupData[]
		qtyPerAgency: Record<string, number>
	}
	flags: {
		is_loading: boolean
	}
}

/* * */

const LinesListContext = createContext<LinesListContextState | undefined>(undefined);

export function useLinesListContext() {
	const context = useContext(LinesListContext);
	if (!context) {
		throw new Error('useLinesListContext must be used within a LinesListContextProvider');
	}
	return context;
}

/* * */

export const LinesListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const linesContext = useLinesContext();

	const filterSearch = useFilterStateString('search');

	const [qtyPerAgency, setQtyPerAgency] = useState<Record<string, number>>({});

	//
	// B. Transform data

	const searchResultsData = useSearch<HubLine>({
		accessors: ['long_name', 'short_name', 'tts_name'],
		data: linesContext.data.lines,
		query: filterSearch.value,
	});

	const filteredData: LinesListGroupData[] = useMemo(() => {
		// Group data by agency ID
		const groupedDataByAgencyId = searchResultsData?.reduce((acc: Record<string, HubLine[]>, line) => {
			// Normalize agency ID for CM agencies
			const agencyIdKey = ['41', '42', '43', '44'].includes(line.agency_id) ? 'CM' : line.agency_id;
			acc[agencyIdKey] = [...(acc[agencyIdKey] || []), line];
			return acc;
		}, {} as Record<string, HubLine[]>);
		// Sort data by agency ID
		return DESIRED_AGENCY_ORDER
			.filter(agencyId => agencyId in groupedDataByAgencyId)
			.map(agencyId => ({
				agency_id: agencyId,
				lines: groupedDataByAgencyId[agencyId].sort((a, b) => {
					const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
					return collator.compare(a.short_name || '', b.short_name || '');
				}).slice(0, !filterSearch.value.length ? (qtyPerAgency[agencyId] || DEFAULT_QTY_PER_AGENCY) : groupedDataByAgencyId[agencyId].length) || [],
				qty: groupedDataByAgencyId[agencyId].length,
			}));
	}, [filterSearch.value.length, qtyPerAgency, searchResultsData]);

	//
	// C. Handle actions

	const increaseQtyPerAgency = useCallback((agencyId: string) => {
		setQtyPerAgency(prev => ({
			...prev,
			[agencyId]: (prev[agencyId] || DEFAULT_QTY_PER_AGENCY) + 30,
		}));
	}, []);

	const filterSearchState = useMemo<UseFilterStateStringReturnType>(() => ({
		isActive: filterSearch.isActive,
		set: filterSearch.set,
		value: filterSearch.value,
	}), [filterSearch.isActive, filterSearch.set, filterSearch.value]);

	//
	// D. Define context value

	const contextValue = useMemo<LinesListContextState>(() => ({
		actions: {
			increaseQtyPerAgency,
		},
		data: {
			filtered: filteredData,
			qtyPerAgency,
		},
		filters: {
			search: filterSearchState,
		},
		flags: {
			is_loading: linesContext.flags.is_loading,
		},
	}), [filterSearchState, filteredData, increaseQtyPerAgency, linesContext.flags.is_loading, qtyPerAgency]);

	//
	// E. Render components

	return (
		<LinesListContext.Provider value={contextValue}>
			{children}
		</LinesListContext.Provider>
	);
};
