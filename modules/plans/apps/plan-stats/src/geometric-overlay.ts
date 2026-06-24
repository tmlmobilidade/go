import { type MultiPolygon, type Polygon } from 'geojson';
import { createRequire } from 'node:module';
import proj4 from 'proj4';

interface JstsCoordinate {
	x: number
	y: number
}

interface JstsGeometry {
	getCoordinates(): JstsCoordinate[]
	getGeometryN(index: number): JstsGeometry
	getGeometryType(): string
	getNumGeometries(): number
	isEmpty(): boolean
	within(other: JstsGeometry): boolean
}

interface JstsPrecisionReducer {
	reduce(geometry: JstsGeometry): JstsGeometry
	reducePointwise(geometry: JstsGeometry): JstsGeometry
	setPointwise(value: boolean): void
}

const jsts = createRequire(import.meta.url)('jsts/dist/jsts.min.js') as {
	geom: { PrecisionModel: new (scale: number) => unknown }
	io: { GeoJSONReader: new () => { read(input: unknown): { geometry: JstsGeometry } } }
	operation: { buffer: { BufferOp: { bufferOp: (geometry: JstsGeometry, distance: number) => JstsGeometry } } }
	precision: {
		EnhancedPrecisionOp: {
			difference: (a: JstsGeometry, b: JstsGeometry) => JstsGeometry
			intersection: (a: JstsGeometry, b: JstsGeometry) => JstsGeometry
		}
		GeometryPrecisionReducer: new (precisionModel: unknown) => JstsPrecisionReducer
	}
};

const WGS84 = 'EPSG:4326';
const WEB_MERCATOR = 'EPSG:3857';
const PT_TM06 = 'EPSG:3763';

proj4.defs(
	PT_TM06,
	'+proj=tmerc +lat_0=39.66825833333333 +lon_0=-8.133108333333333 +k=1 +x_0=0 +y_0=0 +ellps=GRS80 +units=m +no_defs',
);
proj4.defs(
	WEB_MERCATOR,
	'+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs',
);

type Position2D = [number, number];

const geoJsonReader = new jsts.io.GeoJSONReader();
const OVERLAY_COORD_SCALE = 1000;

export function reprojectPosition(position: Position2D, fromCrs: string, toCrs: string): null | Position2D {
	const [x, y] = position;

	if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

	const [rx, ry] = proj4(fromCrs, toCrs, [x, y]) as [number, number];

	return [rx, ry];
}

function reprojectLine(line: Position2D[], fromCrs: string, toCrs: string): Position2D[] {
	const out: Position2D[] = [];

	for (const position of line) {
		const reprojected = reprojectPosition(position, fromCrs, toCrs);

		if (reprojected) out.push(reprojected);
	}

	return out;
}

function lineBbox(line: Position2D[]): [number, number, number, number] {
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	for (const [x, y] of line) {
		minX = Math.min(minX, x);
		minY = Math.min(minY, y);
		maxX = Math.max(maxX, x);
		maxY = Math.max(maxY, y);
	}

	return [minX, minY, maxX, maxY];
}

function bboxesIntersect(a: [number, number, number, number], b: [number, number, number, number]): boolean {
	const [aMinX, aMinY, aMaxX, aMaxY] = a;
	const [bMinX, bMinY, bMaxX, bMaxY] = b;

	return aMinX <= bMaxX && aMaxX >= bMinX && aMinY <= bMaxY && aMaxY >= bMinY;
}

function snapCoordinate(value: number): number {
	return Math.round(value * OVERLAY_COORD_SCALE) / OVERLAY_COORD_SCALE;
}

function snapPosition(position: Position2D): Position2D {
	return [snapCoordinate(position[0]), snapCoordinate(position[1])];
}

function appendSnappedVertex(vertices: Position2D[], position: Position2D): void {
	const snapped = snapPosition(position);
	const previous = vertices[vertices.length - 1];

	if (previous?.[0] === snapped[0] && previous?.[1] === snapped[1]) return;

	vertices.push(snapped);
}

function snapLine(line: Position2D[]): Position2D[] {
	const snapped: Position2D[] = [];

	for (const position of line) {
		appendSnappedVertex(snapped, position);
	}

	return snapped.length >= 2 ? snapped : line;
}

function snapRing(ring: Position2D[]): Position2D[] {
	const snapped: Position2D[] = [];

	for (const position of ring) {
		appendSnappedVertex(snapped, position);
	}

	if (snapped.length >= 2) {
		const first = snapped[0];
		const last = snapped[snapped.length - 1];

		if (first[0] !== last[0] || first[1] !== last[1]) snapped.push([first[0], first[1]]);
	}

	return snapped;
}

function snapPolygonGeometry(geometry: MultiPolygon | Polygon): MultiPolygon | Polygon {
	if (geometry.type === 'Polygon') {
		return {
			coordinates: geometry.coordinates.map(ring => snapRing(ring.map(position => [position[0], position[1]] as Position2D))),
			type: 'Polygon',
		};
	}

	return {
		coordinates: geometry.coordinates.map(polygon =>
			polygon.map(ring => snapRing(ring.map(position => [position[0], position[1]] as Position2D))),
		),
		type: 'MultiPolygon',
	};
}

function toJstsLineString(line: Position2D[]): JstsGeometry {
	return geoJsonReader.read({
		geometry: { coordinates: snapLine(line), type: 'LineString' },
		properties: {},
		type: 'Feature',
	}).geometry;
}

function toJstsPolygon(geometry: MultiPolygon | Polygon): JstsGeometry {
	return geoJsonReader.read({
		geometry: snapPolygonGeometry(geometry),
		properties: {},
		type: 'Feature',
	}).geometry;
}

function prepareLineForOverlay(geometry: JstsGeometry): JstsGeometry {
	const reducer = new jsts.precision.GeometryPrecisionReducer(new jsts.geom.PrecisionModel(OVERLAY_COORD_SCALE));

	reducer.setPointwise(true);

	return reducer.reducePointwise(geometry);
}

function preparePolygonForOverlay(geometry: JstsGeometry): JstsGeometry {
	const reducer = new jsts.precision.GeometryPrecisionReducer(new jsts.geom.PrecisionModel(OVERLAY_COORD_SCALE));

	reducer.setPointwise(true);

	const reduced = reducer.reduce(geometry);

	return jsts.operation.buffer.BufferOp.bufferOp(reduced, 0);
}

function isTopologyException(error: unknown): boolean {
	return error instanceof Error && error.name === 'TopologyException';
}

function overlayDifferenceGeometry(line: JstsGeometry, polygon: JstsGeometry): JstsGeometry {
	return jsts.precision.EnhancedPrecisionOp.difference(
		prepareLineForOverlay(line),
		preparePolygonForOverlay(polygon),
	);
}

function overlayIntersectionGeometry(line: JstsGeometry, polygon: JstsGeometry): JstsGeometry {
	return jsts.precision.EnhancedPrecisionOp.intersection(
		prepareLineForOverlay(line),
		preparePolygonForOverlay(polygon),
	);
}

function extractLineCoordinates(geometry: JstsGeometry): Position2D[][] {
	if (geometry.isEmpty()) return [];

	const type = geometry.getGeometryType();

	if (type === 'LineString') {
		return [geometry.getCoordinates().map(coordinate => [coordinate.x, coordinate.y] as Position2D)];
	}

	if (type === 'MultiLineString') {
		const lines: Position2D[][] = [];

		for (let i = 0; i < geometry.getNumGeometries(); i++) {
			lines.push(
				geometry.getGeometryN(i).getCoordinates().map(coordinate => [coordinate.x, coordinate.y] as Position2D),
			);
		}

		return lines;
	}

	return [];
}

export function lineLengthKm3857(line: Position2D[], lineCrs: string): number {
	return lineLengthKm3857FromProjected(reprojectLine(line, lineCrs, WEB_MERCATOR));
}

function lineLengthKm3857FromProjected(line3857: Position2D[]): number {
	let meters = 0;

	for (let i = 1; i < line3857.length; i++) {
		const a = line3857[i - 1];
		const b = line3857[i];

		meters += Math.hypot(b[0] - a[0], b[1] - a[1]);
	}

	return meters / 1000;
}

function overlayDifference(line: Position2D[], geometries: (MultiPolygon | Polygon)[]): Position2D[][] {
	let current = toJstsLineString(line);

	for (const geometry of geometries) {
		try {
			current = overlayDifferenceGeometry(current, toJstsPolygon(geometry));
		} catch (error) {
			if (!isTopologyException(error)) throw error;
		}
	}

	const parts = extractLineCoordinates(current);

	return parts.length > 0 ? parts : [line];
}

function overlayIntersection(line: Position2D[], geometry: MultiPolygon | Polygon): Position2D[][] {
	try {
		return extractLineCoordinates(overlayIntersectionGeometry(toJstsLineString(line), toJstsPolygon(geometry)));
	} catch (error) {
		if (!isTopologyException(error)) throw error;

		return [];
	}
}

export interface ProjectedConcelho {
	bbox: [number, number, number, number]
	geometry: MultiPolygon | Polygon
	name: string
}

export interface ProjectedBridge {
	bbox: [number, number, number, number]
	geometry: MultiPolygon | Polygon
}

export function computeKmRawByLine(
	lineWgs84: Position2D[],
	concelhos: ProjectedConcelho[],
	bridges: ProjectedBridge[],
): Map<string, number> {
	const kmByConcelho = new Map<string, number>();

	if (lineWgs84.length < 2) return kmByConcelho;

	const line3857 = reprojectLine(lineWgs84, WGS84, WEB_MERCATOR);

	if (line3857.length < 2) return kmByConcelho;

	const bridgeGeometries = bridges.map(bridge => bridge.geometry);
	const lineParts3857 = bridgeGeometries.length > 0
		? overlayDifference(line3857, bridgeGeometries)
		: [line3857];

	for (const part3857 of lineParts3857) {
		const part3763 = reprojectLine(part3857, WEB_MERCATOR, PT_TM06);

		if (part3763.length < 2) continue;

		const partBbox3763 = lineBbox(part3763);

		for (const concelho of concelhos) {
			if (!bboxesIntersect(partBbox3763, concelho.bbox)) continue;

			const intersections = overlayIntersection(part3763, concelho.geometry);

			for (const segment of intersections) {
				const km = lineLengthKm3857(segment, PT_TM06);

				if (km <= 0) continue;

				kmByConcelho.set(concelho.name, (kmByConcelho.get(concelho.name) ?? 0) + km);
			}
		}
	}

	return kmByConcelho;
}

function pointInGeometry(point: Position2D, geometry: MultiPolygon | Polygon): boolean {
	const pointGeometry = geoJsonReader.read({
		geometry: { coordinates: point, type: 'Point' },
		properties: {},
		type: 'Feature',
	}).geometry;

	return pointGeometry.within(toJstsPolygon(geometry));
}

export function pointInConcelho(stopLon: number, stopLat: number, concelho: ProjectedConcelho): boolean {
	const projected = reprojectPosition([stopLon, stopLat], WGS84, PT_TM06);

	if (!projected) return false;

	return pointInGeometry(projected, concelho.geometry);
}
