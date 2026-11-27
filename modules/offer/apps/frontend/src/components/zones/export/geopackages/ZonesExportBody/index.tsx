'use client';

import { useZonesListData } from '@/components/zones/list/use-zones-list-data';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type OfferZonesGeopackageV1ExtractionCreate, type OfferZonesGeopackageV1ExtractionProperties, OfferZonesGeopackageV1ExtractionPropertiesSchema, OfferZonesGeopackageV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { Button, ErrorDisplay, fetchApiData, MultiSelect, openExtractionsListModal, Section, StandardFormController, useExtractionsListData, useHandleAction, useStandardForm } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { closeZonesExportGeopackageModal } from '../ZonesListExport.modal';

/* * */

export function ZonesExportBody() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: zones, error, isLoading: isLoadingZones } = useZonesListData();
	const options = useMemo(() => zones.map(zone => ({ label: zone.name, value: zone._id })), [zones]);
	const { mutate } = useExtractionsListData();
	const { form, unblock } = useStandardForm<OfferZonesGeopackageV1ExtractionProperties, typeof OfferZonesGeopackageV1ExtractionPropertiesSchema>({
		defaultValues: { zone_ids: [] },
		schema: OfferZonesGeopackageV1ExtractionPropertiesSchema,
	});

	//
	// B. Handle actions

	const { action, isLoading } = useHandleAction({
		fetchFn: (properties: OfferZonesGeopackageV1ExtractionProperties) => fetchApiData<Extraction[], OfferZonesGeopackageV1ExtractionCreate>({
			body: { properties, send_email_notification: false, version: OfferZonesGeopackageV1ExtractionVersionValue },
			method: 'POST',
			url: API_ROUTES.core.EXTRACTIONS_CREATE,
		}),
		onSuccess: (response) => {
			mutate(response);
			unblock();
			closeZonesExportGeopackageModal();
			openExtractionsListModal();
		},
	});

	//
	// C. Render components

	if (error) return <ErrorDisplay message={error} />;

	return (
		<form onSubmit={form.handleSubmit(action)}>
			<Section gap="md">
				<StandardFormController
					control={form.control}
					name="zone_ids"
					render={({ field, fieldState }) => (
						<MultiSelect
							data={options}
							disabled={isLoadingZones || isLoading}
							error={fieldState.error?.message}
							label={t('zones:list.ZonesListExport.zones')}
							nothingFoundMessage={t('zones:list.ZonesListExport.no_matches')}
							onChange={field.onChange}
							placeholder={t('zones:list.ZonesListExport.placeholder')}
							value={field.value}
							w="100%"
						/>
					)}
				/>
				<Section alignItems="center" flexDirection="row" flexWrap="wrap" gap="sm" justifyContent="space-between" padding="none">
					<Button
						disabled={isLoadingZones || isLoading || !options.length}
						label={t('zones:list.ZonesListExport.select_all')}
						onClick={() => form.setValue('zone_ids', options.map(option => option.value), { shouldDirty: true, shouldValidate: true })}
						variant="transparent"
					/>
					<Button
						disabled={isLoadingZones || !form.formState.isValid}
						label={t('zones:list.ZonesListExport.submit')}
						loading={isLoading}
						type="submit"
					/>
				</Section>
			</Section>
		</form>
	);
}
