'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type InfrastructureNodesV1ExtractionCreate, InfrastructureNodesV1ExtractionCreateSchema, type InfrastructureStopsV1ExtractionCreate, InfrastructureStopsV1ExtractionCreateSchema, InfrastructureStopsV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, openExtractionsListModal, type StandardFormContextValue, useExtractionsListData, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { closeStopsExtractModal } from './StopsExtract.modal';

/* * */

type StopsExtractionCreate = InfrastructureNodesV1ExtractionCreate | InfrastructureStopsV1ExtractionCreate;

const StopsExtractionCreateSchema = InfrastructureStopsV1ExtractionCreateSchema.or(InfrastructureNodesV1ExtractionCreateSchema);
const StopsExtractFormContext = createContext<StandardFormContextValue<StopsExtractionCreate> | undefined>(undefined);

export function useStopsExtractFormContext() {
	const context = useContext(StopsExtractFormContext);
	if (!context) throw new Error('useStopsExtractFormContext must be used within a StopsExtractFormContextProvider');
	return context;
}

/* * */

export function StopsExtractFormContextProvider({ children }: PropsWithChildren) {
	const { data: meData } = useMeData();
	const { mutate } = useExtractionsListData();

	const { form, isDirty, isValid, unblock } = useStandardForm<StopsExtractionCreate, typeof StopsExtractionCreateSchema>({
		defaultValues: {
			properties: {},
			send_email_notification: false,
			version: InfrastructureStopsV1ExtractionVersionValue,
		},
		schema: StopsExtractionCreateSchema,
	});

	const { action: handleExtract, isLoading: isExtracting } = useHandleAction({
		fetchFn: async (body: StopsExtractionCreate) => await fetchApiData<Extraction[], StopsExtractionCreate>({
			body,
			method: 'POST',
			url: API_ROUTES.core.EXTRACTIONS_CREATE,
		}),
		onSuccess: (response) => {
			mutate(response);
			unblock();
			closeStopsExtractModal();
			openExtractionsListModal();
		},
	});

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: hasPermission(meData?.permissions, {
				action: PermissionCatalog.all.stops.actions.export,
				scope: PermissionCatalog.all.stops.scope,
			}),
			isCreating: isExtracting,
		},
		form: { isDirty, isValid },
	});

	const stateValue: StandardFormContextValue<StopsExtractionCreate> = useMemo(() => ({
		actions: { create: form.handleSubmit(handleExtract) },
		capabilities: { createEnabled, editEnabled },
		form,
		isDirty,
		isValid,
		status: { isCreating: isExtracting },
		unblock,
	}), [createEnabled, editEnabled, form, handleExtract, isDirty, isExtracting, isValid, unblock]);

	return <StopsExtractFormContext.Provider value={stateValue}>{children}</StopsExtractFormContext.Provider>;
}
