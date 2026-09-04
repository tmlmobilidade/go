/* * */

import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { type CreateSchoolDto, CreateSchoolSchema } from '@tmlmobilidade/go-types-operation';

/* * */

const AGENCY_ID_BY_AREA = {
	A1: 'LA77N',
	A2: 'BNA17',
	A3: 'YA15B',
	A4: 'A2L1N',
} as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* * */

export interface SourceSchoolRow {
	A1?: string
	A2?: string
	A3?: string
	A4?: string
	address?: string
	artistic?: string
	basic_1?: string
	basic_2?: string
	basic_3?: string
	district_id?: string
	district_name?: string
	email?: string
	grouping?: string
	high_school?: string
	id?: string
	is_active?: string
	lat?: string
	locality?: string
	lon?: string
	municipality_id?: string
	municipality_name?: string
	name?: string
	nature?: string
	other?: string
	parish_name?: string
	postal_code?: string
	pre_school?: string
	professional?: string
	region_id?: string
	region_name?: string
	special?: string
	stops?: string
	university?: string
	url?: string
	validation_date?: string
}

export type StopLookup = Pick<Stop, '_id' | 'flags'>;

export interface SchoolRowMapping {
	data: CreateSchoolDto
	unresolvedStopIds: string[]
}

/* * */

function clean(value: unknown): string {
	return String(value ?? '').trim();
}

function getAgencyId(row: SourceSchoolRow): string {
	const agencyIds = Object.entries(AGENCY_ID_BY_AREA)
		.filter(([area]) => clean(row[area as keyof typeof AGENCY_ID_BY_AREA]) === '1')
		.map(([, agencyId]) => agencyId);

	if (agencyIds.length > 1) {
		throw new Error(`Multiple school areas found: ${agencyIds.join(', ')}`);
	}

	return agencyIds[0] ?? '';
}

function normalizeEmail(value: unknown): string {
	const email = clean(value).split(/[;|]/).map(clean).find(Boolean) ?? '';
	if (email && !EMAIL_REGEX.test(email)) throw new Error(`Invalid email: ${email}`);
	return email;
}

function normalizeNature(value: unknown): string {
	const nature = clean(value);
	if (nature === 'Privado') return 'private';
	if (nature === 'Publico') return 'public';
	return nature;
}

function normalizePostalCode(value: unknown): string {
	return clean(value).replace(/\s*-\s*/g, '-');
}

function normalizeUrl(value: unknown): string {
	const url = clean(value);
	return url.startsWith('www.') ? `https://${url}` : url;
}

function parseBoolean(value: unknown): boolean {
	return clean(value) === '1';
}

function parseCoordinate(value: unknown, name: string): number {
	const coordinate = Number(clean(value));
	if (!Number.isFinite(coordinate)) throw new Error(`Invalid ${name}: ${value}`);
	if (name === 'latitude' && (coordinate < -90 || coordinate > 90)) throw new Error(`Invalid ${name}: ${value}`);
	if (name === 'longitude' && (coordinate < -180 || coordinate > 180)) throw new Error(`Invalid ${name}: ${value}`);
	return coordinate;
}

function parseValidationDate(value: unknown): null | number {
	const date = clean(value);
	if (!date || date === '0') return null;

	const normalizedDate = date.replaceAll('_', '-');
	if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
		throw new Error(`Invalid validation date: ${date}`);
	}

	const timestamp = Date.parse(`${normalizedDate}T00:00:00.000Z`);
	if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== normalizedDate) {
		throw new Error(`Invalid validation date: ${date}`);
	}

	return timestamp;
}

export function parseSourceStopIds(value: unknown): string[] {
	return Array.from(new Set(clean(value).split('|').map(clean).filter(Boolean)));
}

/* * */

export function buildStopIdByFlagId(stops: StopLookup[], sourceStopIds: ReadonlySet<string>): Map<string, string> {
	const stopIdByFlagId = new Map<string, string>();

	for (const stop of stops) {
		const stopId = String(stop._id);

		for (const flag of stop.flags ?? []) {
			const flagId = clean(flag.stop_id);
			if (!flagId || !sourceStopIds.has(flagId)) continue;

			const mappedStopId = stopIdByFlagId.get(flagId);
			if (mappedStopId && mappedStopId !== stopId) {
				throw new Error(`Stop flag ID ${flagId} maps to both ${mappedStopId} and ${stopId}`);
			}
			stopIdByFlagId.set(flagId, stopId);
		}
	}

	return stopIdByFlagId;
}

export function mapSchoolRow(row: SourceSchoolRow, stopIdByFlagId: ReadonlyMap<string, string>, rowNumber: number): SchoolRowMapping {
	try {
		if (!clean(row.id)) throw new Error('Missing school ID');
		if (!clean(row.name)) throw new Error('Missing school name');

		const sourceStopIds = parseSourceStopIds(row.stops);
		const unresolvedStopIds = sourceStopIds.filter(stopId => !stopIdByFlagId.has(stopId));
		const stops = Array.from(new Set(sourceStopIds.flatMap(stopId => stopIdByFlagId.get(stopId) ?? [])));

		const data = CreateSchoolSchema.parse({
			address: clean(row.address),
			agency_id: getAgencyId(row),
			artistic: parseBoolean(row.artistic),
			basic_1: parseBoolean(row.basic_1),
			basic_2: parseBoolean(row.basic_2),
			basic_3: parseBoolean(row.basic_3),
			code: clean(row.id),
			coordinates: [
				parseCoordinate(row.lat, 'latitude'),
				parseCoordinate(row.lon, 'longitude'),
			],
			district_id: clean(row.district_id),
			district_name: clean(row.district_name),
			email: normalizeEmail(row.email),
			grouping: clean(row.grouping),
			high_school: parseBoolean(row.high_school),
			is_active: parseBoolean(row.is_active),
			is_deleted: false,
			is_locked: false,
			locality: clean(row.locality),
			municipality_id: clean(row.municipality_id),
			municipality_name: clean(row.municipality_name),
			name: clean(row.name),
			nature: normalizeNature(row.nature),
			other: parseBoolean(row.other),
			parish_name: clean(row.parish_name),
			period_organization: 'semester',
			postal_code: normalizePostalCode(row.postal_code),
			pre_school: parseBoolean(row.pre_school),
			professional: parseBoolean(row.professional),
			publish_status: 'draft',
			region_id: clean(row.region_id),
			region_name: clean(row.region_name),
			special: parseBoolean(row.special),
			stops,
			university: parseBoolean(row.university),
			url: normalizeUrl(row.url),
			validation_date: parseValidationDate(row.validation_date),
		});

		return { data, unresolvedStopIds };
	} catch (error) {
		throw new Error(`Invalid school at CSV row ${rowNumber} (${clean(row.id) || 'missing ID'}): ${(error as Error).message}`, { cause: error });
	}
}
