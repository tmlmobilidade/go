'use client';

import { toOrganizationPolygonPreview } from '@/lib/organization-geojson';
import { OrganizationSchema } from '@tmlmobilidade/go-types-core';
import { Collapsible, GeoJsonInput, MapOverlayPolygon, MapView, Section, StandardFormController, useCssVariable, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useOrganizationsDetailFormContext } from '../OrganizationsDetailForm.context';

/* * */

export function OrganizationsDetailGeoJson() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useOrganizationsDetailFormContext();
	const primaryColor = useCssVariable('--color-primary');
	const geojson = useStandardFormWatch({ control: form.control, name: 'geojson' });

	const mapData = useMemo(() => toOrganizationPolygonPreview(geojson ?? null, 'organization'), [geojson]);

	//
	// B. Handle actions

	const handleGeoJsonChange = (value: unknown) => {
		if (!capabilities.editEnabled) return;
		const normalizedGeoJson = value && typeof value === 'object' && 'type' in value && value.type === 'Feature'
			? { features: [value], type: 'FeatureCollection' }
			: value;
		const result = OrganizationSchema.shape.geojson.safeParse(normalizedGeoJson);
		if (!result.success) {
			form.setError('geojson', { message: t('organizations:detail.OrganizationsDetailGeoJson.invalid_file'), type: 'validate' });
			return;
		}
		form.clearErrors('geojson');
		form.setValue('geojson', result.data, { shouldDirty: true, shouldValidate: true });
	};

	const handleGeoJsonError = (error: string | undefined) => {
		if (!capabilities.editEnabled || !error) return;
		form.setError('geojson', { message: t('organizations:detail.OrganizationsDetailGeoJson.invalid_file'), type: 'validate' });
	};

	//
	// C. Render components

	return (
		<Collapsible title={t('organizations:detail.OrganizationsDetailGeoJson.title')}>
			<Section gap="lg">
				<StandardFormController
					control={form.control}
					name="geojson"
					render={({ fieldState }) => (
						<GeoJsonInput
							disabled={!capabilities.editEnabled}
							error={fieldState.error?.message}
							label={t('organizations:detail.OrganizationsDetailGeoJson.title')}
							onChange={handleGeoJsonChange}
							onError={handleGeoJsonError}
							placeholder={t('organizations:detail.OrganizationsDetailGeoJson.upload')}
							removeLabel={t('organizations:detail.OrganizationsDetailGeoJson.remove')}
						/>
					)}
				/>
				{!!mapData.features.length && (
					<MapView height={300} id="organization-geojson" toolbar={false}>
						<MapOverlayPolygon color={primaryColor} data={mapData} id="organization-geojson" />
					</MapView>
				)}
			</Section>
		</Collapsible>
	);
}
