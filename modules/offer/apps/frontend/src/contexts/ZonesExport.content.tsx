// 'use client';

// /***/

// import { CreateFileDto } from '@tmlmobilidade/types';
// import { useAgenciesContext, useExportsContext } from '@tmlmobilidade/ui';
// import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

// /***/

// export const ZONE_LIST_EXPORT_MODAL_ID = 'zone-list-export-modal';

// export interface ZoneListExportSummaryFilter {
// 	label: string
// 	value: string
// }

// export interface ZoneListExportContextState {
// 	actions: {
// 		exportZones: () => void
// 	}
// 	filters: ZoneListExportSummaryFilter[]
// 	flags: {
// 		cansave: boolean
// 		error: Error | undefined
// 		loading: boolean
// 	}
// }

// const ZoneListExportContext = createContext<undefined | ZoneListExportContextState>(undefined);

// export function useZoneListExportContext() {
//     const context = useContext(ZoneListExportContext);
//     if(!context) {
//         throw new Error('useZoneListExportContext must be used withinbg a ZoneListExportContextProvder');
//     }
//     return context;
// }
// export const ZoneListExportContextProvider = ({children, zoneListContext }: PropsWithChildren<{
//     zoneListContext: ZoneListExportContextState }>) => {
// //

// //
// // A. Setup variables
// const agenciesContext = useAgenciesContext();

// const exports = useExportsContext();
// const [loading, setLoading] = useState(false);

// //
// // B. Transform data

// const activeFilters = useMemo(() => {
// 		const filters: ZoneListExportSummaryFilter[] = [];
// 		const searchValue = zoneListContext.filters.search.value.trim();

// 		if (searchValue.length > 0) {
// 			filters.push({ label: 'Pesquisa', value: searchValue });
// 		}

// 		if (zoneListContext.filters.agencies.isActive && zoneListContext.filters.agencies.value.length > 0) {
// 			filters.push({ label: 'Operadores', value: agenciesContext.data.as_options.filter(option => zoneListContext.filters.agencies.value.includes(option.value)).map(option => option.label).join(', ') });
// 		}
    
//     return filters;
// 	}, [
// 		agenciesContext.data.as_options,
// 		zoneListContext.filters.search.value,
// 	]);