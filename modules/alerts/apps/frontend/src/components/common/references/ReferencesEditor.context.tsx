'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type Alert, type HashedTrip, type RideNormalized, type UnixTimestamp } from '@tmlmobilidade/types';
import { Label, openConfirmModal, type SelectDataItem, useDataHashedTrips, useDataRides } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

/* * */

export interface ReferencesEditorContextProps {
	activePeriodEndDate: undefined | UnixTimestamp
	activePeriodStartDate: undefined | UnixTimestamp
	availableAgenciesOptions: SelectDataItem[]
	enabledReferenceTypes: Alert['reference_type'][]
	onChangeReferences: (references: Alert['references']) => void
	onChangeReferenceType: (type: Alert['reference_type']) => void
	selectedAgencyId: Alert['agency_id']
	selectedMunicipalityIds?: Alert['municipality_ids']
	selectedReferences: Alert['references']
	selectedReferenceType: Alert['reference_type']
};

interface ReferencesEditorContextState {
	actions: {
		addReference: () => void
		changeReferenceType: (value: Alert['reference_type']) => void
		removeAllRides: () => void
		removeReference: (index: number) => void
		toggleRideSelection: (rideId: string) => void
		updateReference: (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => void
	}
	data: {
		available_agencies_options: SelectDataItem[]
		enabled_reference_types: Alert['reference_type'][]
		hashed_trips: HashedTrip[]
		lookup_end_date: UnixTimestamp
		lookup_start_date: UnixTimestamp
		rides: RideNormalized[]
		selected_agency_id: Alert['agency_id']
		selected_reference_type: Alert['reference_type']
		selected_references: Alert['references']
		selected_rides_data: RideNormalized[]
	}
	flags: {
		isLoading: boolean
	}
};

/* * */

const ReferencesEditorContext = createContext<ReferencesEditorContextState | undefined>(undefined);

export function useReferencesEditorContext() {
	const context = useContext(ReferencesEditorContext);
	if (!context) {
		throw new Error('useReferencesEditorContext must be used within a ReferencesEditorContextProvider');
	}
	return context;
}

/* * */

export function ReferencesEditorContextProvider({ activePeriodEndDate, activePeriodStartDate, availableAgenciesOptions, children, enabledReferenceTypes, onChangeReferences, onChangeReferenceType, selectedAgencyId, selectedReferences, selectedReferenceType }: PropsWithChildren<ReferencesEditorContextProps>) {
	//

	//
	// A. Setup variables

	const [lookupStartDate, setLookupStartDate] = useState<UnixTimestamp>();
	const [lookupEndDate, setLookupEndDate] = useState<UnixTimestamp>();

	const [selectedRidesData, setSelectedRidesData] = useState<RideNormalized[]>([]);

	//
	// B. Fetch data

	const { isLoading: hashedTripsLoading, raw: hashedTripsData } = useDataHashedTrips(API_ROUTES.alerts.HASHED_TRIPS_LIST, {
		filters: {
			agency_ids: [selectedAgencyId],
			date_end: lookupEndDate,
			date_start: lookupStartDate,
		},
	});

	const { isLoading: ridesLoading, raw: ridesData } = useDataRides(API_ROUTES.alerts.RIDES_LIST, {
		filters: {
			agency_ids: [selectedAgencyId],
			date_end: lookupEndDate,
			date_start: lookupStartDate,
			operational_statuses: ['running', 'missed', 'scheduled'],
		},
	});

	//
	// C. Handle actions

	const changeReferenceType = (value: Alert['reference_type']) => {
		if (selectedReferences?.length > 0) {
			openConfirmModal({
				cancelProps: { variant: 'danger' },
				centered: true,
				children: <Label>Ao alterar o tipo, irá perder as referências que já foram adicionadas.</Label>,
				closeOnClickOutside: true,
				labels: { cancel: 'Cancelar', confirm: 'Continuar' },
				onConfirm: () => {
					onChangeReferenceType(value);
					onChangeReferences([]);
				},
				title: 'Tem a certeza que pretende mudar de tipo de referência?',
			});
		} else {
			onChangeReferenceType(value);
			onChangeReferences([]);
		}
	};

	const addReference = () => {
		const updatedReferences = Array.from(selectedReferences || []);
		updatedReferences.push({ child_ids: [], parent_id: '' });
		onChangeReferences(updatedReferences);
	};

	const removeReference = (index: number) => {
		const currentReferences = selectedReferences || [];
		onChangeReferences(currentReferences.filter((_, i) => i !== index));
	};

	const updateReference = (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => {
		if (field === 'parent_id') {
			const updatedReferences = Array.from(selectedReferences);
			updatedReferences[index].parent_id = value as string;
			updatedReferences[index].child_ids = [];
			onChangeReferences(updatedReferences);
		} else {
			const updatedReferences = Array.from(selectedReferences);
			updatedReferences[index].child_ids = value as string[];
			onChangeReferences(updatedReferences);
		}
	};

	const toggleRideSelection = (rideId: string) => {
		// Get existing references
		const existingReferences = selectedReferences ?? [];
		// If ride is already selected, remove it and return
		if (existingReferences?.some(reference => reference.parent_id === rideId)) {
			onChangeReferences(existingReferences.filter(reference => reference.parent_id !== rideId));
			return;
		}
		// Otherwise, add it to the references array
		onChangeReferences([...existingReferences, { child_ids: [], parent_id: rideId }]);
	};

	const removeAllRides = () => {
		onChangeReferences([]);
	};

	useEffect(() => {
		(async () => {
			// Reset state if no selected references
			if (!selectedReferences?.length) return setSelectedRidesData([]);
			if (selectedReferenceType !== 'rides') return setSelectedRidesData([]);
			// Fetch data for each selected ride
			const result: RideNormalized[] = [];
			for (const rideId of selectedReferences.map(reference => reference.parent_id)) {
				const response = await fetchData<RideNormalized>(API_ROUTES.alerts.RIDES_DETAIL_RIDE(rideId));
				if (!response.data) continue;
				result.push(response.data);
			}
			setSelectedRidesData(result);
		})();
	}, [selectedReferences, selectedReferenceType]);

	useEffect(() => {
		// Add a margin to the start date
		if (!activePeriodStartDate) return;
		setLookupStartDate(Dates.fromUnixTimestamp(activePeriodStartDate).minus({ minutes: 30 }).unix_timestamp);
	}, [activePeriodStartDate]);

	useEffect(() => {
		// Add a margin to the end date
		if (!activePeriodEndDate) {
			// eslint-disable-next-line no-console
			console.warn(activePeriodEndDate, 'ReferencesEditorContextProvider: activePeriodEndDate is undefined');
			if (!activePeriodStartDate) return;
			setLookupEndDate(Dates.fromUnixTimestamp(activePeriodStartDate).plus({ hours: 4 }).unix_timestamp);
		}
		setLookupEndDate(activePeriodEndDate);
	}, [activePeriodStartDate, activePeriodEndDate]);

	//
	// D. Define State

	const contextValue: ReferencesEditorContextState = {
		actions: {
			addReference,
			changeReferenceType,
			removeAllRides,
			removeReference,
			toggleRideSelection,
			updateReference,
		},
		data: {
			available_agencies_options: availableAgenciesOptions,
			enabled_reference_types: enabledReferenceTypes || [],
			hashed_trips: hashedTripsData,
			lookup_end_date: lookupEndDate,
			lookup_start_date: lookupStartDate,
			rides: ridesData,
			selected_agency_id: selectedAgencyId,
			selected_reference_type: selectedReferenceType,
			selected_references: selectedReferences ?? [],
			selected_rides_data: selectedRidesData,
		},
		flags: {
			isLoading: hashedTripsLoading || ridesLoading,
		},
	};

	//
	// E. Return state

	return (
		<ReferencesEditorContext.Provider value={contextValue}>
			{children}
		</ReferencesEditorContext.Provider>
	);

	//
};
