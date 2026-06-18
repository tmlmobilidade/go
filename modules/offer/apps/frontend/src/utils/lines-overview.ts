import { PatternShapeMapFeatureProperties, PatternShapeMapLineGroup } from '@/types/lines-overview';
import { MapLayerMouseEvent, MapMouseEvent } from '@vis.gl/react-maplibre';

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
