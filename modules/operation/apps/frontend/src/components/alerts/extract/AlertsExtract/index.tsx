'use client';

import { IconFileDownload } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type OperationAlertsV1ExtractionCreate, type OperationAlertsV1ExtractionProperties, OperationAlertsV1ExtractionPropertiesSchema, OperationAlertsV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { type AlertReferenceType } from '@tmlmobilidade/go-types-operation';
import { filterPermissionResourceValues, hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, fetchApiData, openExtractionsListModal, Pane, Section, Spacer, Text, Toolbar, useExtractionsListData, useHandleAction, useMeData, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAlertsListFilterActivePeriod } from '../../list/filters/AlertsListFilterActivePeriod/use-alerts-list-filter-active-period';
import { useAlertsListFilterAgency } from '../../list/filters/AlertsListFilterAgency/use-alerts-list-filter-agency';
import { useAlertsListFilterCause } from '../../list/filters/AlertsListFilterCause/use-alerts-list-filter-cause';
import { useAlertsListFilterEffect } from '../../list/filters/AlertsListFilterEffect/use-alerts-list-filter-effect';
import { useAlertsListFilterPublishDate } from '../../list/filters/AlertsListFilterPublishDate/use-alerts-list-filter-publish-date';
import { useAlertsListFilterPublishStatus } from '../../list/filters/AlertsListFilterPublishStatus/use-alerts-list-filter-publish-status';
import { useAlertsListFilterReferenceType } from '../../list/filters/AlertsListFilterReferenceType/use-alerts-list-filter-reference-type';
import { useAlertsListFilterSearch } from '../../list/filters/AlertsListFilterSearch/use-alerts-list-filter-search';
import { useAlertsListData } from '../../list/use-alerts-list-data';
import { closeAlertsExtractModal } from '../AlertsExtract.modal';
import { AlertsExtractHeader } from '../AlertsExtractHeader';

/* * */

export function AlertsExtract() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: meData } = useMeData();
	const { mutate } = useExtractionsListData();
	const { data, error, isLoading, isValidating } = useAlertsListData();

	const filterActivePeriod = useAlertsListFilterActivePeriod();
	const filterAgency = useAlertsListFilterAgency();
	const filterCause = useAlertsListFilterCause();
	const filterEffect = useAlertsListFilterEffect();
	const filterPublishDate = useAlertsListFilterPublishDate();
	const filterPublishStatus = useAlertsListFilterPublishStatus();
	const filterReferenceType = useAlertsListFilterReferenceType();
	const filterSearch = useAlertsListFilterSearch();

	//
	// B. Prepare properties from the active list filters

	const extractionProperties = useMemo((): null | OperationAlertsV1ExtractionProperties => {
		try {
			const validatedProperties = OperationAlertsV1ExtractionPropertiesSchema.safeParse({
				active_period_filter_end: filterActivePeriod.value_end ?? undefined,
				active_period_filter_start: filterActivePeriod.value_start ?? undefined,
				agency_ids: filterAgency.value,
				causes: filterCause.value,
				effects: filterEffect.value,
				publish_date_filter_end: filterPublishDate.value_end,
				publish_date_filter_start: filterPublishDate.value_start,
				publish_status: filterPublishStatus.value,
				reference_type: filterReferenceType.value,
				search: filterSearch.value ?? undefined,
			});

			return validatedProperties.success ? validatedProperties.data : null;
		} catch {
			return null;
		}
	}, [filterActivePeriod.value_end, filterActivePeriod.value_start, filterAgency.value, filterCause.value, filterEffect.value, filterPublishDate.value_end, filterPublishDate.value_start, filterPublishStatus.value, filterReferenceType.value, filterSearch.value]);

	//
	// C. Handle actions

	const { action: requestExtraction, isLoading: isExtracting } = useHandleAction({
		fetchFn: async (properties: OperationAlertsV1ExtractionProperties) => await fetchApiData<Extraction[], OperationAlertsV1ExtractionCreate>({
			body: {
				properties,
				send_email_notification: false,
				version: OperationAlertsV1ExtractionVersionValue,
			},
			method: 'POST',
			url: API_ROUTES.core.EXTRACTIONS_CREATE,
		}),
		labels: {
			error_title: t('alerts:extract.AlertsExtract.action.error_title'),
			success_title: t('alerts:extract.AlertsExtract.action.success_title'),
		},
		onSuccess: (response) => {
			mutate(response);
			closeAlertsExtractModal();
			openExtractionsListModal();
		},
	});

	//
	// D. Setup flags

	const hasExtractPermission = useMemo(() => {
		if (!extractionProperties) return false;
		if (!hasPermission(meData?.permissions, {
			action: PermissionCatalog.all.alerts.actions.read,
			scope: PermissionCatalog.all.alerts.scope,
		})) return false;

		const permittedAgencyIds = filterPermissionResourceValues<string>({
			action: PermissionCatalog.all.alerts.actions.read,
			permissions: meData.permissions,
			resourceKey: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			values: extractionProperties.agency_ids,
		});

		const permittedReferenceTypes = filterPermissionResourceValues<AlertReferenceType>({
			action: PermissionCatalog.all.alerts.actions.read,
			permissions: meData.permissions,
			resourceKey: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			values: extractionProperties.reference_type,
		});

		return permittedAgencyIds.length > 0 && permittedReferenceTypes.length > 0;
	}, [extractionProperties, meData?.permissions]);

	const { createEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: hasExtractPermission,
			isCreating: isExtracting,
		},
		form: {
			isDirty: false,
			isValid: !!extractionProperties && !!data?.length && !error,
		},
		loading: {
			isLoading: isLoading || isValidating,
		},
	});

	const handleExtract = () => {
		if (!createEnabled || !extractionProperties) return;
		void requestExtraction(extractionProperties);
	};

	//
	// E. Render components

	return (
		<Pane
			header={[<AlertsExtractHeader key="header" />]}
			footer={[
				<Toolbar key="footer">
					<Spacer />
					<Button
						disabled={!createEnabled}
						icon={<IconFileDownload size={20} />}
						label={t('alerts:extract.AlertsExtract.button.label')}
						loading={isExtracting}
						onClick={handleExtract}
					/>
				</Toolbar>,
			]}
		>
			<Section gap="md">
				<Text>{t('alerts:extract.AlertsExtract.description')}</Text>
				<Text>{t('alerts:extract.AlertsExtract.total', '', { total: data?.length ?? 0 })}</Text>
				{!createEnabled && !isExtracting && <Text>{t('alerts:extract.AlertsExtract.unavailable')}</Text>}
			</Section>
		</Pane>
	);
}
