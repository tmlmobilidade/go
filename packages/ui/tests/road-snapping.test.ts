import { type Feature, type LineString } from 'geojson';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { z } from 'zod';

import { MAP_STYLES } from '../src/components/map/configs/styles';
import { getBusCandidateRoadLayerIds, isBusCandidateRoadFeature } from '../src/components/map/overlays/MapOverlayPatternShape/road-snapping';

/* * */

describe('pattern anchor road snapping', () => {
	it('discovers roads independently of style layer names', () => {
		const layers = [
			{ 'id': 'road_minor', 'source-layer': 'transportation', 'type': 'line' },
			{ 'id': 'road-major', 'source-layer': 'transportation', 'type': 'line' },
			{ 'id': 'renamed-bridge', 'source-layer': 'transportation', 'type': 'line' },
			{ 'id': 'road-label', 'source-layer': 'transportation_name', 'type': 'symbol' },
			{ 'id': 'road-area', 'source-layer': 'transportation', 'type': 'fill' },
			{ id: 'pattern-line', type: 'line' },
		];
		assert.deepEqual(getBusCandidateRoadLayerIds(layers), ['road_minor', 'road-major', 'renamed-bridge']);
		assert.deepEqual(getBusCandidateRoadLayerIds([]), []);
	});

	it('excludes railways, ferries and pedestrian paths from transportation features', () => {
		const feature: Feature<LineString> = {
			geometry: { coordinates: [[-9.1, 38.7], [-9.2, 38.8]], type: 'LineString' },
			properties: {},
			type: 'Feature',
		};
		for (const roadClass of ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service', 'track']) {
			assert.equal(isBusCandidateRoadFeature({ ...feature, properties: { class: roadClass } }), true, roadClass);
		}
		for (const roadClass of ['rail', 'transit', 'ferry', 'path', 'pedestrian', 'aerialway', undefined]) {
			assert.equal(isBusCandidateRoadFeature({ ...feature, properties: { class: roadClass } }), false, roadClass);
		}
		assert.equal(isBusCandidateRoadFeature({ ...feature, geometry: { coordinates: [-9.1, 38.7], type: 'Point' }, properties: { class: 'minor' } }), false);
		assert.equal(isBusCandidateRoadFeature({ ...feature, geometry: { coordinates: [feature.geometry.coordinates], type: 'MultiLineString' }, properties: { class: 'minor' } }), true);
	});
});

/* * */

// Opt in to check the external Maps contract, rather than relying on a local
// fixture that cannot detect a breaking change to the published styles.
describe('published Maps road contract', { skip: !process.env.GO_MAPS_CONTRACT_TEST }, () => {
	const styleSchema = z.object({
		layers: z.array(z.object({
			'id': z.string(),
			'source': z.string().optional(),
			'source-layer': z.string().optional(),
			'type': z.string(),
		})),
		sources: z.record(z.object({ type: z.string() })),
	});

	for (const [name, config] of Object.entries(MAP_STYLES)) {
		if (!('dark' in config.value)) continue;
		for (const [mode, url] of Object.entries(config.value)) {
			it(`${name}/${mode} exposes vector road layers for anchor snapping`, async () => {
				const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
				assert.equal(response.ok, true, `Could not fetch Maps style: ${url}`);
				const style = styleSchema.parse(await response.json());
				const layers = style.layers.map((layer) => {
					assert.ok(layer.id, 'Maps layer must have a nonempty ID');
					assert.ok(layer.type, `Maps layer ${layer.id} must have a type`);
					return { ...layer, id: layer.id, type: layer.type };
				});
				const roadLayerIds = getBusCandidateRoadLayerIds(layers);
				assert.ok(roadLayerIds.length > 0, `Maps style has no transportation line layers: ${url}`);
				for (const layer of style.layers.filter(layer => roadLayerIds.includes(layer.id))) {
					assert.ok(layer.source && style.sources[layer.source]?.type === 'vector', `Road layer ${layer.id} must use a vector source`);
				}
			});
		}
	}
});
