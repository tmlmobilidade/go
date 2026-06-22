/* * */

import { type OperationalDate } from '@tmlmobilidade/types';

/* * */

export const exportTypeLabels = {
	'executive-summary': '6.0. Sumário Executivo',
	'hashed-shapes-geojson': '4.0. HashedShapes para GeoJSON',
	'rides-raw': '2.0. Rides em bruto (SLAs)',
	'sams-raw': '5.0. SAMs em bruto (Sequencialidade)',
	'validations-aggregated': '1.1. Validações agregadas (escolher campos)',
	'validations-p-municipalities': '7.0. Validações por município',
	'validations-raw': '1.0. Validações em bruto',
	'vehicle-events-raw': '3.0. Vehicle Events em bruto',
} as const;

export type ExportType = keyof typeof exportTypeLabels;

/**
 * Export types that don't require entity filters (agency, line, stop, etc.).
 * These exports may still require dates.
 */
export const exportTypesWithoutEntityFilters: ExportType[] = [
	'validations-p-municipalities',
];

/**
 * Export types that don't require filters or dates.
 * These exports use their own specific input methods (e.g., IDs).
 */
export const exportTypesWithoutFilters: ExportType[] = [
	'hashed-shapes-geojson',
];

/* * */

export interface ExportContext {
	_id: string
	app_version: string
	dates: {
		end: OperationalDate
		start: OperationalDate
	}
	filters: {
		agency_ids: string[]
		line_ids: string[]
		pattern_ids: string[]
		stop_ids: string[]
		vehicle_ids: number[]
	}
	output: string
}

/* * */

export interface TaskProps {
	context: ExportContext
	message: (msg: string) => void
}
