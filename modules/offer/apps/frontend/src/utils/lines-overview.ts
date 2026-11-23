import { PatternShapeMapFeatureProperties, PatternShapeMapLineGroup, PatternShapeMapOrganizationGroup } from '@/types/lines-overview';
import { type OrganizationFilter } from '@tmlmobilidade/go-offer-pckg-types';
import { MapLayerMouseEvent, MapMouseEvent } from '@vis.gl/react-maplibre';

export function areStringArraysEqual(left: string[], right: string[]) {
	if (left.length !== right.length) return false;
	return left.every((value, index) => value === right[index]);
}

export function dedupePatternFeatures(features: PatternShapeMapFeatureProperties[]) {
	const seenPatternIds = new Set<string>();
	const dedupedFeatures: PatternShapeMapFeatureProperties[] = [];

	for (const feature of features) {
		if (seenPatternIds.has(feature.pattern_id)) continue;
		seenPatternIds.add(feature.pattern_id);
		dedupedFeatures.push(feature);
	}

	return dedupedFeatures.sort((a, b) => {
		const lineCompare = a.line_code.localeCompare(b.line_code);
		if (lineCompare !== 0) return lineCompare;
		return a.pattern_code.localeCompare(b.pattern_code);
	});
}

export function getPatternFeaturesAtEvent(event: MapLayerMouseEvent | MapMouseEvent, hitboxLayerId: string) {
	const renderedFeatures = event.target.queryRenderedFeatures(event.point);
	const features = renderedFeatures
		.filter(feature => feature.layer.id === hitboxLayerId)
		.map(feature => feature.properties as PatternShapeMapFeatureProperties | undefined)
		.filter((properties): properties is PatternShapeMapFeatureProperties => Boolean(properties?.pattern_id));

	return dedupePatternFeatures(features);
}

export function getPatternLabel(pattern: PatternShapeMapFeatureProperties) {
	if (pattern.headsign) return pattern.headsign;
	return `${pattern.origin} - ${pattern.destination}`;
}

export function groupFeaturesByLine(features: PatternShapeMapFeatureProperties[]) {
	const groups = new Map<string, PatternShapeMapLineGroup>();

	for (const feature of features) {
		const existingGroup = groups.get(feature.line_id);
		if (existingGroup) {
			existingGroup.patterns.push(feature);
			continue;
		}

		groups.set(feature.line_id, {
			color: feature.color,
			line_code: feature.line_code,
			line_id: feature.line_id,
			line_name: feature.line_name,
			line_text_color: feature.line_text_color,
			patterns: [feature],
		});
	}

	return Array.from(groups.values()).map(group => ({
		...group,
		patterns: group.patterns.sort((a, b) => a.pattern_code.localeCompare(b.pattern_code)),
	}));
}

/** Group by the complete membership set so each pattern appears only once. */
export function groupFeaturesByOrganization(features: PatternShapeMapFeatureProperties[], organizations: OrganizationFilter[]): PatternShapeMapOrganizationGroup[] {
	const organizationsByAgency = new Map<string, OrganizationFilter[]>();
	const sortedOrganizations = organizations
		.filter(organization => organization.organization_type !== 'agency' && organization.organization_type !== 'other')
		.toSorted((a, b) => a.long_name.localeCompare(b.long_name, 'pt', { sensitivity: 'base' }) || a._id.localeCompare(b._id));

	for (const organization of sortedOrganizations) {
		for (const agencyId of new Set(organization.agency_ids)) {
			const memberships = organizationsByAgency.get(agencyId) ?? [];
			memberships.push(organization);
			organizationsByAgency.set(agencyId, memberships);
		}
	}

	const groups = new Map<string, { features: PatternShapeMapFeatureProperties[], organizations: OrganizationFilter[] }>();
	for (const feature of dedupePatternFeatures(features)) {
		const memberships = organizationsByAgency.get(feature.agency_id) ?? [];
		const key = JSON.stringify(memberships.map(organization => organization._id));
		const group = groups.get(key) ?? { features: [], organizations: memberships };
		group.features.push(feature);
		groups.set(key, group);
	}

	return Array.from(groups, ([id, group]) => ({
		id,
		lines: groupFeaturesByLine(group.features),
		organizations: group.organizations,
	})).sort((a, b) => {
		if (!a.organizations.length) return b.organizations.length ? 1 : 0;
		if (!b.organizations.length) return -1;
		return a.organizations.map(organization => organization.long_name).join(' · ')
			.localeCompare(b.organizations.map(organization => organization.long_name).join(' · '), 'pt', { sensitivity: 'base' });
	});
}
