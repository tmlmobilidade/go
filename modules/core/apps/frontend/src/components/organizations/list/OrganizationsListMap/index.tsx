'use client';

import { organizationColors } from '@/lib/organization-colors';
import { toOrganizationPolygonPreview } from '@/lib/organization-geojson';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type OrganizationsListItem } from '@tmlmobilidade/go-core-pckg-types';
import { keepUrlParams, MapOverlayPolygon, MapOverlayTooltip, MapView } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { type ComponentProps, useMemo, useState } from 'react';

import { useOrganizationsDetailOrganizationId } from '../../detail/use-organizations-detail-organization-id';

/* * */

export function OrganizationsListMap({ organizations }: { organizations: OrganizationsListItem[] }) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { organizationId } = useOrganizationsDetailOrganizationId();
	const [hoveredFeature, setHoveredFeature] = useState<null | { id: string, latitude: number, longitude: number }>(null);

	//
	// B. Transform data

	const overlays = useMemo(() => organizations.flatMap((organization) => {
		const data = toOrganizationPolygonPreview(organization.geojson, organization._id);
		return data.features.length ? [{
			color: organizationColors[organization.organization_type],
			data,
			id: `organization-${organization._id}`,
			organizationId: organization._id,
		}] : [];
	}), [organizations]);

	const interactiveLayerIds = useMemo(() => overlays.map(overlay => `${overlay.id}:polygon:layer:fill`), [overlays]);
	const hoveredOrganization = organizations.find(organization => organization._id === hoveredFeature?.id && organization.geojson);

	//
	// C. Handle actions

	const handleClick: NonNullable<ComponentProps<typeof MapView>['onClick']> = (event) => {
		const id = event.features?.[0]?.properties?.id;
		if (typeof id === 'string') router.push(keepUrlParams(PAGE_ROUTES.core.ORGANIZATIONS_DETAIL(id)));
	};

	const handleMouseMove: NonNullable<ComponentProps<typeof MapView>['onMouseMove']> = (event) => {
		const id = event.features?.[0]?.properties?.id;
		setHoveredFeature(typeof id === 'string' ? { id, latitude: event.lngLat.lat, longitude: event.lngLat.lng } : null);
	};

	//
	// D. Render components

	return (
		<MapView id="organizations-list" interactiveLayerIds={interactiveLayerIds} onClick={handleClick} onMouseLeave={() => setHoveredFeature(null)} onMouseMove={handleMouseMove}>
			{overlays.map((overlay) => {
				const isHovered = overlay.organizationId === hoveredOrganization?._id;
				const isDimmed = !!hoveredOrganization && !isHovered;
				const isSelected = overlay.organizationId === organizationId;
				return (
					<MapOverlayPolygon
						key={overlay.id}
						color={overlay.color}
						data={overlay.data}
						fillOpacity={isDimmed ? 0.06 : isSelected ? 0.5 : isHovered ? 0.45 : 0.2}
						id={overlay.id}
						lineOpacity={isDimmed ? 0.25 : 1}
						lineWidth={isSelected ? 4 : isHovered ? 3 : 2}
					/>
				);
			})}
			{hoveredFeature && hoveredOrganization && <MapOverlayTooltip label={hoveredOrganization.long_name} latitude={hoveredFeature.latitude} longitude={hoveredFeature.longitude} />}
		</MapView>
	);
}
