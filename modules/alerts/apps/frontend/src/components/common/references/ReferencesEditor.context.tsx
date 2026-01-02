'use client';

/* * */

import { useLinesContext } from '@/contexts/Lines.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type Alert, type RideNormalized, type UnixTimestamp } from '@tmlmobilidade/types';
import { Label, openConfirmModal, useDataRides, useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

/* * */

export interface ReferencesEditorContextProps {
	activePeriodEndDate: undefined | UnixTimestamp
	activePeriodStartDate: undefined | UnixTimestamp
	onChangeReferences: (references: Alert['references']) => void
	onChangeReferenceType: (type: Alert['reference_type']) => void
	selectedAgencyId?: Alert['agency_id']
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
		filtered_rides: RideNormalized[]
		selected_reference_type: Alert['reference_type']
		selected_references: Alert['references']
		selected_rides_data?: RideNormalized[]
	}
	filters: {
		lines: UseFilterStateListReturnType
		search: UseFilterStateStringReturnType
		stops: UseFilterStateListReturnType
		view_mode?: UseFilterStateStringReturnType
	}
	flags: {
		isRidesLoading: boolean
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

export const ReferencesEditorContextProvider = ({ activePeriodEndDate, activePeriodStartDate, children, onChangeReferences, onChangeReferenceType, selectedAgencyId, selectedReferences, selectedReferenceType }: PropsWithChildren<ReferencesEditorContextProps>) => {
	//

	//
	// A. Setup variables

	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();

	const filterLines = useFilterStateList('lines', [], linesContext.data.options);
	const filterStops = useFilterStateList('stops', [], stopsContext.data.options);
	const filterSearch = useFilterStateString('search');
	const filterViewMode = useFilterStateString('view_mode', 'selected');

	const [startDate, setStartDate] = useState<UnixTimestamp>();
	const [endDate, setEndDate] = useState<UnixTimestamp>();

	const [selectedRidesData, setSelectedRidesData] = useState<RideNormalized[]>([]);

	//
	// B. Fetch data

	const { isLoading: ridesLoading, raw: ridesData } = useDataRides(API_ROUTES.alerts.RIDES_LIST, {
		filters: {
			agency_ids: [selectedAgencyId],
			date_end: endDate,
			date_start: startDate,
			line_ids: filterLines.value,
			operational_statuses: ['running', 'missed', 'scheduled'],
			search: filterSearch.value,
			stop_ids: filterStops.value,
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
		}
		else {
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
		}
		else {
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
		setStartDate(Dates.fromUnixTimestamp(activePeriodStartDate).minus({ minutes: 30 }).unix_timestamp);
	}, [activePeriodStartDate]);

	useEffect(() => {
		// Add a margin to the end date
		if (!activePeriodEndDate) {
			if (!activePeriodStartDate) return;
			setEndDate(Dates.fromUnixTimestamp(activePeriodStartDate).plus({ hours: 4 }).unix_timestamp);
		}
		setEndDate(Dates.fromUnixTimestamp(activePeriodEndDate).plus({ hours: 4 }).unix_timestamp);
	}, [activePeriodEndDate]);

	//
	// D. Define State

	const contextValue: ReferencesEditorContextState = useMemo(() => ({
		actions: {
			addReference,
			changeReferenceType,
			removeAllRides,
			removeReference,
			toggleRideSelection,
			updateReference,
		},
		data: {
			filtered_rides: ridesData,
			selected_reference_type: selectedReferenceType,
			selected_references: selectedReferences ?? [],
			selected_rides_data: selectedRidesData,
		},
		filters: {
			lines: filterLines,
			search: filterSearch,
			stops: filterStops,
			view_mode: filterViewMode,
		},
		flags: {
			canCreate: true,
			error: undefined,
			isLoading: false,
			isRidesLoading: ridesLoading,
		},
	}), [
		selectedReferenceType,
		selectedReferences,
		selectedRidesData,
		filterStops,
		ridesData,
		filterLines,
		filterSearch,
		filterViewMode,
		ridesLoading,
	]);

	//
	// E. Return state

	return (
		<ReferencesEditorContext.Provider value={contextValue}>
			{children}
		</ReferencesEditorContext.Provider>
	);

	//
};
