'use client';

import { useZoneDetailContext } from '@/components/zones/detail/ZoneDetail.context';
import { ZoneDetailHeader } from '@/components/zones/detail/ZoneDetailHeader';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { PermissionCatalog, ZoneSchema } from '@tmlmobilidade/types';
import { Divider, ErrorDisplay, GeoJsonInput, Grid, LoadingOverlay, MapOverlayPolygon, MapOverlayPolygonDataProps, MapView, MultiSelect, Pane, Section, TextInput, useCssVariable, useDataAgenciesNew } from '@tmlmobilidade/ui';
import { Feature, type FeatureCollection, MultiPolygon, type Polygon } from 'geojson';
import { useEffect, useState } from 'react';
/* * */

type ZoneGeometry = MultiPolygon | Polygon;
type ZoneFeature = Feature<ZoneGeometry>;

export function ZoneDetail() {
	//

	//
	// A. Setup variables

	const zoneDetailContext = useZoneDetailContext();
	const [previewGeoJson, setPreviewGeoJson] = useState<FeatureCollection<Polygon, MapOverlayPolygonDataProps> | null>(null);

	const primaryColorHexValue = useCssVariable('--color-primary', '#000000');

	const { options: agencyOptions } = useDataAgenciesNew(API_ROUTES.offer.AGENCIES_LIST, {
		actions: [zoneDetailContext.flags.isReadOnly ? PermissionCatalog.all.zones.actions.nav : PermissionCatalog.all.zones.actions.update],
		scope: PermissionCatalog.all.zones.scope,
	});

	//
	// B. Handle actions

	const updateGeoJson = (feature: null | ZoneFeature) => {
		if (!feature?.geometry) {
			setPreviewGeoJson(null);
			return;
		}

		// Base feature collection
		const baseGeoJson = getBaseGeoJsonFeatureCollection<Polygon, MapOverlayPolygonDataProps>();

		// Convert MultiPolygon to multiple Polygon features
		if (feature.geometry.type === 'MultiPolygon') {
			baseGeoJson.features = feature.geometry.coordinates.map((polygonCoords, index) => ({
				geometry: {
					coordinates: polygonCoords,
					type: 'Polygon' as const,
				},
				properties: {
					id: `selected-polygon-${index}`,
				},
				type: 'Feature' as const,
			}));
		} else {
			baseGeoJson.features = [
				{
					geometry: feature.geometry,
					properties: {
						id: 'selected-polygon',
					},
					type: 'Feature',
				},
			];
		}

		setPreviewGeoJson(baseGeoJson);
	};

	useEffect(() => {
		if (!zoneDetailContext.data?.zone?.geojson) {
			return;
		}
		const geojson = zoneDetailContext.data.zone.geojson;
		if (geojson.type === 'Feature') {
			updateGeoJson(geojson as ZoneFeature);
		}
	}, [zoneDetailContext.data?.zone?.geojson]);

	const handleUpdateMap = () => {
		if (!zoneDetailContext.data.form.values?.geojson) {
			return;
		}
		const geojson = zoneDetailContext.data.form.values.geojson;
		if (geojson.type === 'Feature') {
			updateGeoJson(geojson as ZoneFeature);
		}
	};

	const handleRemoveGeoJson = () => {
		updateGeoJson(null);
	};

	const handleError = (error: null | string) => {
		zoneDetailContext.data.form.setFieldError('geojson', error);
	};

	//
	// C. Render components

	if (zoneDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (zoneDetailContext.flags.error) {
		return <ErrorDisplay message={zoneDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<ZoneDetailHeader key="header" />]}>

			<MapView height={450} id="zone-geojson-preview">
				{previewGeoJson && (
					<MapOverlayPolygon
						color={primaryColorHexValue}
						data={previewGeoJson}
						id="preview-geojson"
					/>
				)}
			</MapView>

			<Divider />

			<Section>
				<Grid columns="a" gap="lg">

					<TextInput
						key={zoneDetailContext.data.form.key('name')}
						disabled={zoneDetailContext.flags.isReadOnly}
						label="Nome"
						placeholder="Ex: navegante® a bordo T1"
						required={!ZoneSchema.shape.name.isOptional()}
						w="100%"
						{...zoneDetailContext.data.form.getInputProps('name')}
					/>

					<TextInput
						key={zoneDetailContext.data.form.key('code')}
						disabled={zoneDetailContext.flags.isReadOnly}
						label="Código"
						placeholder="Ex: T1-BORDO"
						required={!ZoneSchema.shape.code.isOptional()}
						w="100%"
						{...zoneDetailContext.data.form.getInputProps('code')}
					/>

					<MultiSelect
						key={zoneDetailContext.data.form.key('agency_ids')}
						data={agencyOptions}
						disabled={zoneDetailContext.flags.isReadOnly}
						label="Operadores"
						{...zoneDetailContext.data.form.getInputProps('agency_ids')}
					/>

					<GeoJsonInput
						key={zoneDetailContext.data.form.key('geojson')}
						disabled={zoneDetailContext.flags.isReadOnly}
						onError={handleError}
						onRemove={handleRemoveGeoJson}
						onUpdateMap={handleUpdateMap}
						{...zoneDetailContext.data.form.getInputProps('geojson')}
					/>

				</Grid>
			</Section>
		</Pane>
	);

	//
}
