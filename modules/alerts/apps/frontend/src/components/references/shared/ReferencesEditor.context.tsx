'use client';

import { type AlertReference, type AlertReferenceType } from '@tmlmobilidade/go-types-operation';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { Label, openConfirmModal } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

/* * */

export interface ReferencesEditorContextProps {
	activePeriodEndDate: undefined | UnixMilliseconds
	activePeriodStartDate: undefined | UnixMilliseconds
	enabledReferenceTypes: AlertReferenceType[]
	onChangeReferences: (references: AlertReference[]) => void
	onChangeReferenceType: (type: AlertReferenceType) => void
	readonly?: boolean
	selectedAgencyId: string
	selectedReferences: AlertReference[]
	selectedReferenceType: AlertReferenceType
};

interface ReferencesEditorContextState {
	actions: {
		addReference: () => void
		changeReferenceType: (value: AlertReferenceType) => void
		clearAllReferences: () => void
		removeReference: (index: number) => void
		toggleReferenceSelection: (parentId: string) => void
		updateReference: (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => void
	}
	data: {
		active_period_end_date: UnixMilliseconds
		active_period_start_date: UnixMilliseconds
		enabled_reference_types: AlertReferenceType[]
		selected_agency_id: string
		selected_reference_type: AlertReferenceType
		selected_references: AlertReference[]
	}
	flags: {
		isReadonly: boolean
	}
};

/* * */

const ReferencesEditorContext = createContext<ReferencesEditorContextState | undefined>(undefined);

export function useReferencesEditorContext() {
	const context = useContext(ReferencesEditorContext);
	if (!context) throw new Error('useReferencesEditorContext must be used within a ReferencesEditorContextProvider');
	return context;
}

/* * */

export function ReferencesEditorContextProvider({ activePeriodEndDate, activePeriodStartDate, children, enabledReferenceTypes, onChangeReferences, onChangeReferenceType, readonly, selectedAgencyId, selectedReferences, selectedReferenceType }: PropsWithChildren<ReferencesEditorContextProps>) {
	//

	//
	// A. Handle actions

	const changeReferenceType = useCallback((value: AlertReferenceType) => {
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
		// Skip if readonly
		if (readonly) return;
		// Add a new reference block to the list
		onChangeReferences([...(selectedReferences || []), { child_ids: [], parent_id: '' }]);
	}, [onChangeReferences, readonly, selectedReferences]);

	const removeReference = useCallback((index: number) => {
		// Skip if readonly
		if (readonly) return;
		// Remove the reference at the given index
		onChangeReferences((selectedReferences || []).filter((_, i) => i !== index));
	}, [onChangeReferences, readonly, selectedReferences]);

	const updateReference = useCallback((index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => {
		// Skip if readonly
		if (readonly) return;
		// Update the reference at the given index
		const updatedReferences = (selectedReferences || []).map((ref, idx) => {
			if (idx !== index) return ref;
			if (field === 'parent_id') return { ...ref, child_ids: [], parent_id: value as string };
			return { ...ref, child_ids: value as string[] };
		});
		onChangeReferences(updatedReferences);
	}, [onChangeReferences, readonly, selectedReferences]);

	const toggleReferenceSelection = useCallback((parentId: string) => {
		// Skip if readonly
		if (readonly) return;
		// Toggle selection
		const existingReferences = selectedReferences ?? [];
		const foundMatchingReference = existingReferences.some(reference => reference.parent_id === parentId);
		if (foundMatchingReference) {
			const updatedReferences = existingReferences.filter(reference => reference.parent_id !== parentId);
			onChangeReferences(updatedReferences);
			return;
		} else {
			// Create a new reference block for the given parent ID
			// if no matching reference block is found.
			const newReference: AlertReference = { child_ids: [], parent_id: parentId };
			onChangeReferences([...existingReferences, newReference]);
		}
	}, [onChangeReferences, readonly, selectedReferences]);

	const clearAllReferences = useCallback(() => {
		onChangeReferences([]);
	}, [onChangeReferences]);

	//
	// B. Setup context

	const contextValue: ReferencesEditorContextState = useMemo(() => ({
		actions: {
			addReference,
			changeReferenceType,
			clearAllReferences,
			removeReference,
			toggleReferenceSelection,
			updateReference,
		},
		data: {
			active_period_end_date: activePeriodEndDate,
			active_period_start_date: activePeriodStartDate,
			enabled_reference_types: enabledReferenceTypes || [],
			selected_agency_id: selectedAgencyId,
			selected_reference_type: selectedReferenceType,
			selected_references: selectedReferences ?? [],
		},
		flags: {
			isReadonly: readonly || false,
		},
	}), [activePeriodEndDate, activePeriodStartDate, addReference, changeReferenceType, clearAllReferences, enabledReferenceTypes, readonly, removeReference, selectedAgencyId, selectedReferenceType, selectedReferences, toggleReferenceSelection, updateReference]);

	//
	// C. Return context

	return (
		<ReferencesEditorContext.Provider value={contextValue}>
			{children}
		</ReferencesEditorContext.Provider>
	);
};
