'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, type RideNormalized, type UnixTimestamp } from '@tmlmobilidade/types';
import { Label, openConfirmModal, type SelectDataItem } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/* * */

export interface ReferencesEditorContextProps {
	activePeriodEndDate: undefined | UnixTimestamp
	activePeriodStartDate: undefined | UnixTimestamp
	availableAgenciesOptions: SelectDataItem[]
	enabledReferenceTypes: Alert['reference_type'][]
	onChangeReferences: (references: Alert['references']) => void
	onChangeReferenceType: (type: Alert['reference_type']) => void
	readonly?: boolean
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
		active_period_end_date: UnixTimestamp
		active_period_start_date: UnixTimestamp
		available_agencies_options: SelectDataItem[]
		enabled_reference_types: Alert['reference_type'][]
		selected_agency_id: Alert['agency_id']
		selected_reference_type: Alert['reference_type']
		selected_references: Alert['references']
		selected_rides_data: RideNormalized[]
	}
	flags: {
		isReadonly: boolean
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

export function ReferencesEditorContextProvider({ activePeriodEndDate, activePeriodStartDate, availableAgenciesOptions, children, enabledReferenceTypes, onChangeReferences, onChangeReferenceType, readonly, selectedAgencyId, selectedReferences, selectedReferenceType }: PropsWithChildren<ReferencesEditorContextProps>) {
	//

	//
	// A. Setup variables

	const [selectedRidesData, setSelectedRidesData] = useState<RideNormalized[]>([]);

	//
	// B. Handle actions

	const changeReferenceType = useCallback((value: Alert['reference_type']) => {
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
	}, [selectedReferences, onChangeReferenceType, onChangeReferences]);

	const addReference = useCallback(() => {
		onChangeReferences([...(selectedReferences || []), { child_ids: [], parent_id: '' }]);
	}, [selectedReferences, onChangeReferences]);

	const removeReference = useCallback((index: number) => {
		// Skip if readonly
		if (readonly) return;
		// Remove reference at index
		onChangeReferences((selectedReferences || []).filter((_, i) => i !== index));
	}, [readonly, selectedReferences, onChangeReferences]);

	const updateReference = useCallback((index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => {
		// Skip if readonly
		if (readonly) return;
		// Update reference at index
		const updatedReferences = (selectedReferences || []).map((ref, i) => {
			if (i !== index) return ref;
			if (field === 'parent_id') return { ...ref, child_ids: [], parent_id: value as string };
			return { ...ref, child_ids: value as string[] };
		});
		onChangeReferences(updatedReferences);
	}, [readonly, selectedReferences, onChangeReferences]);

	const toggleRideSelection = useCallback((rideId: string) => {
		// Skip if readonly
		if (readonly) return;
		// Toggle selection
		const existingReferences = selectedReferences ?? [];
		if (existingReferences.some(reference => reference.parent_id === rideId)) {
			onChangeReferences(existingReferences.filter(reference => reference.parent_id !== rideId));
			return;
		}
		onChangeReferences([...existingReferences, { child_ids: [], parent_id: rideId }]);
	}, [readonly, selectedReferences, onChangeReferences]);

	const removeAllRides = useCallback(() => {
		onChangeReferences([]);
	}, [onChangeReferences]);

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

	//
	// C. Define State

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
			active_period_end_date: activePeriodEndDate,
			active_period_start_date: activePeriodStartDate,
			available_agencies_options: availableAgenciesOptions,
			enabled_reference_types: enabledReferenceTypes || [],
			selected_agency_id: selectedAgencyId,
			selected_reference_type: selectedReferenceType,
			selected_references: selectedReferences ?? [],
			selected_rides_data: selectedRidesData,
		},
		flags: {
			isReadonly: readonly || false,
		},
	}), [activePeriodEndDate, activePeriodStartDate, addReference, availableAgenciesOptions, changeReferenceType, enabledReferenceTypes, readonly, removeAllRides, removeReference, selectedAgencyId, selectedReferenceType, selectedReferences, selectedRidesData, toggleRideSelection, updateReference]);

	//
	// D. Return state

	return (
		<ReferencesEditorContext.Provider value={contextValue}>
			{children}
		</ReferencesEditorContext.Provider>
	);

	//
};
