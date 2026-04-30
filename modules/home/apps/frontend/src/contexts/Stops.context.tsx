// 'use client';

// /* * */

// import { API_ROUTES } from '@tmlmobilidade/consts';
// import { Stop } from '@tmlmobilidade/types';
// import { SelectDataItem } from '@tmlmobilidade/ui';
// import { createContext, useCallback, useContext } from 'react';
// import useSWR from 'swr';

// /* * */

// interface StopsContextState {
// 	actions: {
// 		getStopById: (stopId: string) => Stop | undefined
// 	}
// 	data: {
// 		options: SelectDataItem[]
// 		raw: Stop[]
// 	}
// 	flags: {
// 		is_loading: boolean
// 	}
// }

// /* * */

// const StopsContext = createContext<StopsContextState | undefined>(undefined);

// // eslint-disable-next-line @typescript-eslint/naming-convention
// export function useStopsContext() {
// 	const context = useContext(StopsContext);
// 	if (!context) {
// 		throw new Error('useStopsContext must be used within a StopsContextProvider');
// 	}
// 	return context;
// }

// /* * */

// export const StopsContextProvider = ({ children }: { children: React.ReactNode }) => {
// 	//

// 	//
// 	// A. Fetch data

// 	// const { data: allStopsData, isLoading: allStopsLoading } = useSWR<Stop[]>(API_ROUTES.alerts.STOPS_LIST);
// 	// const { data: allStopsOptionsData, isLoading: allStopsOptionsLoading } = useSWR<{ label: string, value: string }[]>(API_ROUTES.alerts.STOPS_BATCH);

// 	//
// 	// B. Transform data

// 	// const getStopById = useCallback((stopId: string): Stop | undefined => {
// 	// 	return allStopsData?.find(stop => stop._id === stopId) as Stop | undefined;
// 	// }, [allStopsData]);

// 	//
// 	// C. Define context value

// 	const contextValue: StopsContextState = {
// 		actions: {
// 			getStopById,
// 		},
// 		data: {
// 			options: allStopsOptionsData || [],
// 			raw: allStopsData || [],
// 		},
// 		flags: {
// 			is_loading: allStopsLoading || allStopsOptionsLoading,
// 		},
// 	};

// 	//
// 	// D. Render components

// 	return (
// 		<StopsContext.Provider value={contextValue}>
// 			{children}
// 		</StopsContext.Provider>
// 	);

// 	//
// };

// /* * */

// export function TransformStopDataIntoGeoJsonFeature(stopData: Stop): GeoJSON.Feature<GeoJSON.Point> {
// 	return {
// 		geometry: {
// 			coordinates: [stopData.longitude, stopData.latitude],
// 			type: 'Point',
// 		},
// 		properties: {
// 			current_status: stopData.lifecycle_status === 'active' ? 'active' : 'inactive',
// 			id: stopData._id,
// 			lat: stopData.latitude,
// 			lon: stopData.longitude,
// 			long_name: stopData.name,
// 		},
// 		type: 'Feature',
// 	};
// }
