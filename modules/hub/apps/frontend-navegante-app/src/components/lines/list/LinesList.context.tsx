'use client';

import { useLinesContext } from '@/components/lines/Lines.context';
import { useTransitModes } from '@/hooks/use-transit-modes';
import { type HubLine } from '@tmlmobilidade/types';
import { type ListContextStateTemplate, useFilterStateString, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

const DESIRED_AGENCY_ORDER = ['4', '2', '16', '15', 'CM', '1', '8'];

/* * */

interface LinesListContextState extends ListContextStateTemplate {
	data: {
		filtered: { agency_id: string, lines: HubLine[] }[]
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

	const { activeAgencyIds } = useTransitModes();

	const filterSearch = useFilterStateString('search');

	//
	// B. Transform data

	const searchResultsData = useSearch<HubLine>({
		accessors: ['long_name', 'short_name', 'tts_name'],
		data: linesContext.data.lines,
		query: filterSearch.value,
	});

	const filteredData: { agency_id: string, lines: HubLine[] }[] = useMemo(() => {
		// Filter data by active agency IDs
		const filteredDataByActiveAgencyIds = searchResultsData?.filter((line) => {
			return activeAgencyIds.includes(line.agency_id);
		});
		// Group data by agency ID
		const groupedDataByAgencyId = filteredDataByActiveAgencyIds?.reduce((acc: Record<string, HubLine[]>, line) => {
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
				}) || [],
			}));
	}, [searchResultsData, activeAgencyIds]);

	//
	// C. Define context value

	const contextValue: LinesListContextState = {
		data: {
			filtered: filteredData,
		},
		filters: {
			search: filterSearch,
		},
		flags: {
			error: undefined,
			isLoading: linesContext.flags.isLoading,
		},
	};

	//
	// D. Render components

	return (
		<LinesListContext.Provider value={contextValue}>
			{children}
		</LinesListContext.Provider>
	);

	//
};
