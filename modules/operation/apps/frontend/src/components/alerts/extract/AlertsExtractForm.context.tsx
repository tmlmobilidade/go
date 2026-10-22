'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type OperationAlertsV1ExtractionCreate, OperationAlertsV1ExtractionCreateSchema, OperationAlertsV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { type AlertReferenceType } from '@tmlmobilidade/go-types-operation';
import { filterPermissionResourceValues, hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, openExtractionsListModal, type StandardFormContextValue, useExtractionsListData, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAlertsListFilterActivePeriod } from '../list/filters/AlertsListFilterActivePeriod/use-alerts-list-filter-active-period';
import { useAlertsListFilterAgency } from '../list/filters/AlertsListFilterAgency/use-alerts-list-filter-agency';
import { useAlertsListFilterCause } from '../list/filters/AlertsListFilterCause/use-alerts-list-filter-cause';
import { useAlertsListFilterEffect } from '../list/filters/AlertsListFilterEffect/use-alerts-list-filter-effect';
import { useAlertsListFilterPublishDate } from '../list/filters/AlertsListFilterPublishDate/use-alerts-list-filter-publish-date';
import { useAlertsListFilterPublishStatus } from '../list/filters/AlertsListFilterPublishStatus/use-alerts-list-filter-publish-status';
import { useAlertsListFilterReferenceType } from '../list/filters/AlertsListFilterReferenceType/use-alerts-list-filter-reference-type';
import { useAlertsListFilterSearch } from '../list/filters/AlertsListFilterSearch/use-alerts-list-filter-search';
import { closeAlertsExtractModal } from './AlertsExtract.modal';

/* * */

const AlertsExtractFormContext = createContext<StandardFormContextValue<OperationAlertsV1ExtractionCreate> | undefined>(undefined);

export function useAlertsExtractFormContext() {
	const context = useContext(AlertsExtractFormContext);
	if (!context) throw new Error('useAlertsExtractFormContext must be used within an AlertsExtractFormContextProvider');
	return context;
}

/* * */

export function AlertsExtractFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: meData } = useMeData();
	const { mutate } = useExtractionsListData();

	const filterActivePeriod = useAlertsListFilterActivePeriod();
	const filterAgency = useAlertsListFilterAgency();
	const filterCause = useAlertsListFilterCause();
	const filterEffect = useAlertsListFilterEffect();
	const filterPublishDate = useAlertsListFilterPublishDate();
	const filterPublishStatus = useAlertsListFilterPublishStatus();
	const filterReferenceType = useAlertsListFilterReferenceType();
	const filterSearch = useAlertsListFilterSearch();

	//
	// B. Setup form with the active list filters

	const { form, isDirty, unblock } = useStandardForm<OperationAlertsV1ExtractionCreate, typeof OperationAlertsV1ExtractionCreateSchema>({
		defaultValues: {
			properties: {
				active_period_filter_end: filterActivePeriod.value_end ?? undefined,
				active_period_filter_start: filterActivePeriod.value_start ?? undefined,
				agency_ids: filterPermissionResourceValues<string>({
					action: PermissionCatalog.all.alerts.actions.read,
					permissions: meData?.permissions,
					resourceKey: 'agency_ids',
					scope: PermissionCatalog.all.alerts.scope,
					values: filterAgency.value,
				}),
				causes: filterCause.value,
				effects: filterEffect.value,
				publish_date_filter_end: filterPublishDate.value_end ?? undefined,
				publish_date_filter_start: filterPublishDate.value_start ?? undefined,
				publish_status: filterPublishStatus.value,
				reference_type: filterPermissionResourceValues<AlertReferenceType>({
					action: PermissionCatalog.all.alerts.actions.read,
					permissions: meData?.permissions,
					resourceKey: 'reference_types',
					scope: PermissionCatalog.all.alerts.scope,
					values: filterReferenceType.value,
				}),
				search: filterSearch.value ?? undefined,
			},
			send_email_notification: false,
			version: OperationAlertsV1ExtractionVersionValue,
		},
		schema: OperationAlertsV1ExtractionCreateSchema,
	});

	const propertiesValue = useStandardFormWatch({ control: form.control, name: 'properties' });
	const isValid = form.formState.isValid;

	// Validate the properties together so changing a start date also updates the end date error.
	useEffect(() => {
		void form.trigger();
	}, [form, propertiesValue]);

	//
	// C. Handle actions

	const { action: handleExtract, isLoading: isExtracting } = useHandleAction({
		fetchFn: async (body: OperationAlertsV1ExtractionCreate) => await fetchApiData<Extraction[], OperationAlertsV1ExtractionCreate>({
			body,
			method: 'POST',
			url: API_ROUTES.core.EXTRACTIONS_CREATE,
		}),
		labels: {
			error_title: t('alerts:extract.AlertsExtract.action.error_title'),
			success_title: t('alerts:extract.AlertsExtract.action.success_title'),
		},
		onSuccess: (response) => {
			mutate(response);
			unblock();
			closeAlertsExtractModal();
			openExtractionsListModal();
		},
	});

	//
	// D. Setup flags from the current form values

	const hasExtractPermission = useMemo(() => {
		if (!hasPermission(meData?.permissions, { action: PermissionCatalog.all.alerts.actions.read, scope: PermissionCatalog.all.alerts.scope })) return false;
		const permittedAgencyIds = filterPermissionResourceValues<string>({
			action: PermissionCatalog.all.alerts.actions.read,
			permissions: meData.permissions,
			resourceKey: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			values: propertiesValue?.agency_ids,
		});
		const permittedReferenceTypes = filterPermissionResourceValues<AlertReferenceType>({
			action: PermissionCatalog.all.alerts.actions.read,
			permissions: meData.permissions,
			resourceKey: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			values: propertiesValue?.reference_type,
		});
		return permittedAgencyIds.length > 0 && permittedReferenceTypes.length > 0;
	}, [meData?.permissions, propertiesValue?.agency_ids, propertiesValue?.reference_type]);

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: { hasPermission: hasExtractPermission, isCreating: isExtracting },
		form: { isDirty, isValid },
	});

	//
	// E. Return context value

	const stateValue: StandardFormContextValue<OperationAlertsV1ExtractionCreate> = useMemo(() => ({
		actions: {
			create: () => {
				if (!createEnabled) return;
				void form.handleSubmit(handleExtract)();
			},
		},
		capabilities: { createEnabled, editEnabled },
		form,
		isDirty,
		isValid,
		status: { isCreating: isExtracting },
		unblock,
	}), [createEnabled, editEnabled, form, handleExtract, isDirty, isExtracting, isValid, unblock]);

	return <AlertsExtractFormContext.Provider value={stateValue}>{children}</AlertsExtractFormContext.Provider>;
}
