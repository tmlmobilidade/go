import { type Organization } from '@tmlmobilidade/go-types-core';
import { type MapOverlayPolygon } from '@tmlmobilidade/ui';
import { type ComponentProps } from 'react';

/** Build map polygons from an organization's FeatureCollection. */
export function toOrganizationPolygonPreview(geojson: Organization['geojson'], organizationId: string): ComponentProps<typeof MapOverlayPolygon>['data'] {
	return {
		features: (geojson?.features ?? []).flatMap(feature => feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon'
			? [{ geometry: feature.geometry, properties: { id: organizationId }, type: 'Feature' as const }]
			: []),
		type: 'FeatureCollection',
	};
}
