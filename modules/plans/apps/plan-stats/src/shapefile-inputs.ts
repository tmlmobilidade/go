import {
	computeKmRawByLine,
	pointInConcelho,
	type ProjectedBridge,
	type ProjectedConcelho,
} from '@/geometric-overlay.js';
import { type Feature, type LineString, type MultiPolygon, type Polygon } from 'geojson';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { open as openShapefile } from 'shapefile';

const DEFAULT_INPUTS_DIR = fileURLToPath(new URL('../inputs', import.meta.url));
const INPUTS_DIR = resolve(process.env.PLAN_STATS_INPUTS_DIR ?? DEFAULT_INPUTS_DIR);

const CONCELHO_FIELD_NAMES = ['Concelho', 'concelho', 'Municipio', 'Município', 'NAME_2', 'NAME', 'name'] as const;

export interface ShapefileSpatialInputs {
	allConcelhos: ProjectedConcelho[]
	bridges: ProjectedBridge[]
	desiredConcelhos: Set<string>
}

export interface ShapeLineWithPattern {
	line: Feature<LineString>
	pattern_id: string
	shape_id: string
}

function normalizeConcelhoName(raw: string): string {
	return Buffer.from(raw, 'latin1').toString('utf8').trim();
}

function concelhoFieldName(properties: Record<string, unknown>): string {
	for (const field of CONCELHO_FIELD_NAMES) {
		const value = properties[field];

		if (value != null && String(value).trim() !== '') {
			return field;
		}
	}

	throw new Error('Campo do concelho não encontrado no Concelhos.shp.');
}

function polygonBbox(geometry: MultiPolygon | Polygon): [number, number, number, number] {
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	const rings = geometry.type === 'Polygon'
		? geometry.coordinates
		: geometry.coordinates.flat();

	for (const ring of rings) {
		for (const [x, y] of ring) {
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x);
			maxY = Math.max(maxY, y);
		}
	}

	return [minX, minY, maxX, maxY];
}

async function readLocalShapefile(basename: string): Promise<Feature[]> {
	const shpPath = join(INPUTS_DIR, `${basename}.shp`);

	if (!existsSync(shpPath)) {
		throw new Error(`Shapefile not found: ${shpPath}. Set PLAN_STATS_INPUTS_DIR to the folder containing Concelhos.shp and bridges.shp.`);
	}

	const features: Feature[] = [];
	const source = await openShapefile(shpPath);

	let result = await source.read();

	while (!result.done) {
		features.push(result.value as Feature);
		result = await source.read();
	}

	return features;
}

export async function loadShapefileSpatialInputs(
	desiredConcelhos: readonly string[],
): Promise<ShapefileSpatialInputs> {
	const allConcelhos: ProjectedConcelho[] = [];

	for (const feature of await readLocalShapefile('Concelhos')) {
		if (!feature.geometry || (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon')) {
			continue;
		}

		const field = concelhoFieldName(feature.properties ?? {});
		const name = normalizeConcelhoName(String(feature.properties?.[field] ?? ''));

		if (!name) continue;

		allConcelhos.push({
			bbox: polygonBbox(feature.geometry),
			geometry: feature.geometry,
			name,
		});
	}

	const bridges: ProjectedBridge[] = [];

	for (const feature of await readLocalShapefile('bridges')) {
		if (!feature.geometry || (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon')) {
			continue;
		}

		bridges.push({
			bbox: polygonBbox(feature.geometry),
			geometry: feature.geometry,
		});
	}

	return {
		allConcelhos,
		bridges,
		desiredConcelhos: new Set(desiredConcelhos),
	};
}

export function computeMunicipalKmRawByPattern(
	shapeLines: ShapeLineWithPattern[],
	inputs: ShapefileSpatialInputs,
): Map<string, Map<string, number>> {
	const kmRawByPattern = new Map<string, Map<string, number>>();

	for (const { line, pattern_id: patternId } of shapeLines) {
		const patternTotals = kmRawByPattern.get(patternId) ?? new Map<string, number>();
		const coordinates = line.geometry.coordinates.map(
			position => [position[0], position[1]] as [number, number],
		);
		const kmByConcelho = computeKmRawByLine(coordinates, inputs.allConcelhos, inputs.bridges);

		for (const [concelho, km] of kmByConcelho) {
			patternTotals.set(concelho, (patternTotals.get(concelho) ?? 0) + km);
		}

		kmRawByPattern.set(patternId, patternTotals);
	}

	return kmRawByPattern;
}

export function computeStopsByMunicipality(
	stops: { stop_lat: number, stop_lon: number }[],
	inputs: ShapefileSpatialInputs,
): { municipalityCounts: Map<string, number>, totalStops: number } {
	const municipalityCounts = new Map<string, number>();
	let totalStops = 0;

	for (const stop of stops) {
		let municipality: null | string = null;

		for (const concelho of inputs.allConcelhos) {
			if (pointInConcelho(stop.stop_lon, stop.stop_lat, concelho)) {
				municipality = concelho.name;
				break;
			}
		}

		if (!municipality || !inputs.desiredConcelhos.has(municipality)) continue;

		municipalityCounts.set(municipality, (municipalityCounts.get(municipality) ?? 0) + 1);
		totalStops++;
	}

	return { municipalityCounts, totalStops };
}

export { INPUTS_DIR };
