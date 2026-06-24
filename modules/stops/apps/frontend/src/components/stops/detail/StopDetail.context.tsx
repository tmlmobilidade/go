'use client';

import { regenerateStopTts } from '@/lib/regenerate-stop-tts';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { getStopShortName, getStopTtsName } from '@tmlmobilidade/go-stops-pckg-organize';
import { PermissionCatalog, type Stop, UpdateStopDto, UpdateStopSchema } from '@tmlmobilidade/types';
import { useFlagCanDelete, useFlagCanLock, useFlagCanSave, useFlagReadOnly, UseFormReturnType, useHandleUpdate, useMeContext, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

/* * */

interface StopDetailContextState {
	actions: {
		closeCoordinatesEditor: () => void
		closeNamesEditor: () => void
		delete: () => void
		lock: () => void
		openCoordinatesEditor: () => void
		openNamesEditor: () => void
		save: () => void
		saveNames: () => void
	}
	data: {
		form: UseFormReturnType<UpdateStopDto>
		stop: Stop | undefined
	}
	flags: {
		canDelete: boolean
		canLock: boolean
		canPreviewTts: boolean
		canSave: boolean
		error: Error | undefined
		isCoordinatesEditorOpen: boolean
		isDeleting: boolean
		isLoading: boolean
		isLocking: boolean
		isNamesEditorOpen: boolean
		isReadOnly: boolean
		isSaving: boolean
	}
}

const StopDetailContext = createContext<StopDetailContextState | undefined>(undefined);

export function useStopDetailContext() {
	const context = useContext(StopDetailContext);
	if (!context) {
		throw new Error('useStopDetailContext must be used within a StopDetailContextProvider');
	}
	return context;
}

export const StopDetailContextProvider = ({ children, stopId }: PropsWithChildren<{ stopId: string }>) => {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	const [isCoordinatesEditorOpen, setCoordinatesEditorOpen] = useState(false);
	const openCoordinatesEditor = useCallback(() => setCoordinatesEditorOpen(true), []);
	const closeCoordinatesEditor = useCallback(() => setCoordinatesEditorOpen(false), []);

	const [isNamesEditorOpen, setNamesEditorOpen] = useState(false);
	const [canPreviewTts, setCanPreviewTts] = useState(false);
	const [ttsAudioVersion, setTtsAudioVersion] = useState(() => Date.now());
	const namesEditorBaselineRef = useRef<null | {
		name: string
		short_name: string
		tts_name: string
	}>(null);
	const namesEditorSavedPayloadRef = useRef<null | {
		name: string
		short_name: string
		tts_name: string
	}>(null);

	//
	// B. Fetch data

	const { mutate: allStopsMutate } = useSWR<Stop[]>(API_ROUTES.stops.STOPS_LIST);
	const { data: stopData, error: stopError, isLoading: stopLoading, mutate: stopMutate } = useSWR<Stop>(API_ROUTES.stops.STOPS_DETAIL(stopId));

	const openNamesEditor = useCallback(() => {
		if (!stopData) return;

		namesEditorBaselineRef.current = {
			name: stopData.name,
			short_name: stopData.short_name,
			tts_name: stopData.tts_name,
		};
		setCanPreviewTts(false);
		setNamesEditorOpen(true);
	}, [stopData]);

	const closeNamesEditor = useCallback(() => {
		namesEditorBaselineRef.current = null;
		setNamesEditorOpen(false);
		setCanPreviewTts(false);
	}, []);

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdateStopDto>(UpdateStopSchema, stopData);

	//
	// D. Transform data

	form.watch('name', ({ value }) => {
		// Skip if no name is set
		if (typeof value !== 'string') return;
		// Build the abbreviated and TTS names
		const shortName = getStopShortName(value);
		const ttsName = getStopTtsName(value);
		// Set the form values
		form.setFieldValue('short_name', shortName);
		form.setFieldValue('tts_name', ttsName);
	});

	//
	// E. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL(stopId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			stopMutate(updatedItem);
			allStopsMutate();
		},
	});

	const { action: handleSaveNames, isLoading: isSavingNames } = useHandleUpdate({
		fetchFn: async () => {
			const payload = form.getValues();
			namesEditorSavedPayloadRef.current = {
				name: payload.name ?? '',
				short_name: payload.short_name ?? '',
				tts_name: payload.tts_name ?? '',
			};
			return await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL(stopId), 'PUT', payload);
		},
		onSuccess: (updatedItem) => {
			const baseline = namesEditorBaselineRef.current;
			const saved = namesEditorSavedPayloadRef.current;
			const namesChanged = baseline !== null && saved !== null && (
				saved.name !== baseline.name
				|| saved.short_name !== baseline.short_name
				|| saved.tts_name !== baseline.tts_name
			);

			if (namesChanged && saved?.tts_name) {
				void regenerateStopTts(String(updatedItem._id), saved.tts_name)
					.then(() => {
						setTtsAudioVersion(Date.now());
						setCanPreviewTts(true);
					})
					.catch((error: Error) => {
						useToast.error({ message: error.message, title: 'Erro ao gerar TTS' });
					});
			}

			form.resetDirty();
			stopMutate(updatedItem);
			allStopsMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL(stopId), 'DELETE'),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			stopMutate(updatedItem);
			allStopsMutate();
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL_LOCK(stopId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			stopMutate(updatedItem);
			allStopsMutate();
		},
	});

	//
	// F. Setup flags

	const isSavingForm = isSaving || isSavingNames;

	const { isReadOnly } = useFlagReadOnly({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.stops.scope, PermissionCatalog.all.stops.actions.update),
		isDeleted: stopData?.is_deleted,
		isDeleting: isDeleting,
		isLoading: stopLoading,
		isLocked: stopData?.is_locked,
		isLocking: isLocking,
		isSaving: isSavingForm,
	});

	const { canSave } = useFlagCanSave({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.stops.scope, PermissionCatalog.all.stops.actions.update),
		isDeleted: stopData?.is_deleted,
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: stopLoading,
		isLocked: stopData?.is_locked,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { canLock } = useFlagCanLock({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.stops.scope, PermissionCatalog.all.stops.actions.update),
		isDeleted: stopData?.is_deleted,
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: stopLoading,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { canDelete } = useFlagCanDelete({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.stops.scope, PermissionCatalog.all.stops.actions.update),
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: stopLoading,
		isLocked: stopData?.is_locked,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	//
	// G. Define context value

	const formValuesSignature = JSON.stringify(form.values);

	// `form` ref is stable; include serialized values so consumers re-render when fields change (e.g. coords modal).
	/* eslint-disable react-hooks/exhaustive-deps -- form.values identity alone is not a reliable dependency */
	const contextValue: StopDetailContextState = useMemo(() => ({
		actions: {
			closeCoordinatesEditor,
			closeNamesEditor,
			delete: handleDelete,
			lock: handleLock,
			openCoordinatesEditor,
			openNamesEditor,
			save: handleSave,
			saveNames: handleSaveNames,
		},
		data: {
			form,
			stop: stopData,
		},
		flags: {
			canDelete,
			canLock,
			canPreviewTts,
			canSave,
			ttsAudioVersion,
			error: stopError,
			isCoordinatesEditorOpen,
			isDeleting,
			isLoading: stopLoading,
			isLocking,
			isNamesEditorOpen,
			isReadOnly,
			isSaving: isSavingForm,
		},
	}), [
		closeCoordinatesEditor,
		closeNamesEditor,
		openCoordinatesEditor,
		openNamesEditor,
		isCoordinatesEditorOpen,
		canDelete,
		canLock,
		canSave,
		stopError,
		isDeleting,
		stopLoading,
		isLocking,
		isReadOnly,
		isSavingForm,
		canPreviewTts,
		ttsAudioVersion,
		form,
		stopData,
		formValuesSignature,
		handleDelete,
		handleLock,
		handleSave,
		handleSaveNames,
	]);
	//
	// H. Render components

	return (
		<StopDetailContext.Provider value={contextValue}>
			{children}
		</StopDetailContext.Provider>
	);

	//
};
