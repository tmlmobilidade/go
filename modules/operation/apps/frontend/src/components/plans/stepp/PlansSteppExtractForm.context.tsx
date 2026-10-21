'use client';

import { usePlansAgenciesData } from '@/components/plans/shared/use-plans-agencies-data';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type OperationGtfsSteppV1ExtractionCreate, type OperationGtfsSteppV1ExtractionProperties, OperationGtfsSteppV1ExtractionPropertiesSchema, OperationGtfsSteppV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type OperationalDate } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, openExtractionsListModal, type StandardFormContextValue, useExtractionsListData, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';

import { closePlansSteppExtractModal } from './PlansSteppExtract.modal';
import { usePlansSteppExtractPlansData } from './use-plans-stepp-extract-plans-data';

/* * */

const PlansSteppExtractFormContext = createContext<StandardFormContextValue<OperationGtfsSteppV1ExtractionProperties> | undefined>(undefined);

export function usePlansSteppExtractFormContext() {
	const context = useContext(PlansSteppExtractFormContext);
	if (!context) throw new Error('usePlansSteppExtractFormContext must be used within a PlansSteppExtractFormContextProvider');
	return context;
}

/* * */

export function PlansSteppExtractFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { data: meData } = useMeData();
	const { ids: permittedAgencyIds, isLoading: isLoadingAgencies } = usePlansAgenciesData();
	const { mutate } = useExtractionsListData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<OperationGtfsSteppV1ExtractionProperties, typeof OperationGtfsSteppV1ExtractionPropertiesSchema>({
		defaultValues: { agency_id: '', end_date: '' as OperationalDate, plan_ids: [], start_date: '' as OperationalDate },
		schema: OperationGtfsSteppV1ExtractionPropertiesSchema,
	});

	const agencyId = useStandardFormWatch({ control: form.control, name: 'agency_id' });
	const startDate = useStandardFormWatch({ control: form.control, name: 'start_date' });
	const endDate = useStandardFormWatch({ control: form.control, name: 'end_date' });
	const planIds = useStandardFormWatch({ control: form.control, name: 'plan_ids' });
	const { error, ids: eligiblePlanIds, isLoading: isLoadingPlans } = usePlansSteppExtractPlansData(agencyId, startDate, endDate);

	useEffect(() => {
		const selectedIds = form.getValues('plan_ids');
		const retainedIds = selectedIds.filter(id => eligiblePlanIds.includes(id));
		if (selectedIds.length === retainedIds.length) return;
		form.setValue('plan_ids', retainedIds, { shouldDirty: true, shouldValidate: true });
	}, [eligiblePlanIds, form]);

	//
	// C. Handle actions

	const { action: handleExtract, isLoading: isExtracting } = useHandleAction({
		fetchFn: async () => await fetchApiData<Extraction[], OperationGtfsSteppV1ExtractionCreate>({
			body: {
				properties: OperationGtfsSteppV1ExtractionPropertiesSchema.parse(form.getValues()),
				send_email_notification: false,
				version: OperationGtfsSteppV1ExtractionVersionValue,
			},
			method: 'POST',
			url: API_ROUTES.core.EXTRACTIONS_CREATE,
		}),
		onSuccess: (response) => {
			mutate(response);
			unblock();
			closePlansSteppExtractModal();
			openExtractionsListModal();
		},
	});

	//
	// D. Setup flags

	const hasExtractPermission = hasPermission(meData?.permissions, {
		action: PermissionCatalog.all.plans.actions.read,
		scope: PermissionCatalog.all.plans.scope,
	}) && permittedAgencyIds.includes(agencyId);

	const hasValidSelection = !error && planIds.length > 0 && planIds.every(id => eligiblePlanIds.includes(id));
	const hasValidProperties = OperationGtfsSteppV1ExtractionPropertiesSchema.safeParse({ agency_id: agencyId, end_date: endDate, plan_ids: planIds, start_date: startDate }).success;

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: { hasPermission: hasExtractPermission, isCreating: isExtracting },
		form: { isDirty, isValid: isValid && hasValidProperties && hasValidSelection },
		loading: { isLoading: isLoadingAgencies || isLoadingPlans },
	});

	//
	// E. Return context value

	const stateValue: StandardFormContextValue<OperationGtfsSteppV1ExtractionProperties> = useMemo(() => ({
		actions: {
			create: async () => {
				if (!createEnabled) return;
				await form.handleSubmit((properties) => {
					if (!permittedAgencyIds.includes(properties.agency_id) || !properties.plan_ids.every(id => eligiblePlanIds.includes(id))) return;
					return handleExtract();
				})();
			},
		},
		capabilities: { createEnabled, editEnabled },
		form,
		isDirty,
		isValid,
		status: { isCreating: isExtracting },
		unblock,
	}), [createEnabled, editEnabled, eligiblePlanIds, form, handleExtract, isDirty, isExtracting, isValid, permittedAgencyIds, unblock]);

	//
	// F. Render context

	return (
		<PlansSteppExtractFormContext.Provider value={stateValue}>
			{children}
		</PlansSteppExtractFormContext.Provider>
	);
}
