'use client';

import { ZoneSchema } from '@tmlmobilidade/go-types-offer';
import { Collapsible, GeoJsonInput, MapOverlayPolygon, MapView, Section, StandardFormController, useCssVariable, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { toZonePolygonPreview } from '../../shared/zone-geometry';
import { useZonesDetailFormContext } from '../ZonesDetailForm.context';

/* * */

export function ZoneDetailGeometry() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useZonesDetailFormContext();
	const geojson = useStandardFormWatch({ control: form.control, name: 'geojson' });
	const primaryColor = useCssVariable('--color-primary', '#000000');
	const preview = useMemo(() => toZonePolygonPreview(geojson ?? null), [geojson]);

	//
	// B. Handle actions

	const handleGeoJsonChange = (value: unknown) => {
		if (!capabilities.editEnabled) return;
		const result = ZoneSchema.shape.geojson.safeParse(value);
		if (!result.success) {
			form.setError('geojson', { message: t('default:zones.fields.geojson.invalid'), type: 'validate' });
			return;
		}
		form.clearErrors('geojson');
		form.setValue('geojson', result.data, { shouldDirty: true, shouldValidate: true });
	};

	const handleGeoJsonError = (error: string | undefined) => {
		if (!capabilities.editEnabled || !error) return;
		form.setError('geojson', { message: t('default:zones.fields.geojson.invalid'), type: 'validate' });
	};

	//
	// C. Render components

	return (
		<Collapsible title={t('default:zones.sections.geometry')} defaultOpen>
			<MapView height={450} id="zone-geojson-preview">
				{!!preview.features.length && <MapOverlayPolygon color={primaryColor} data={preview} id="preview-geojson" />}
			</MapView>
			<Section>
				<StandardFormController
					control={form.control}
					name="geojson"
					render={({ fieldState }) => (
						<GeoJsonInput
							disabled={!capabilities.editEnabled}
							error={fieldState.error?.message}
							label={t('default:zones.fields.geojson.label')}
							onChange={handleGeoJsonChange}
							onError={handleGeoJsonError}
						/>
					)}
				/>
			</Section>
		</Collapsible>
	);
}
