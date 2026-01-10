/* * */

import { type OperationalDate } from '@tmlmobilidade/types';

/* * */

export const exportTypeLabels = {
	'hashed-shapes-geojson': '4.0. HashedShapes para GeoJSON',
	'rides-raw': '2.0. Rides em bruto (SLAs)',
	'sams-raw': '5.0. SAMs em bruto (Sequencialidade)',
	'validations-by-line': '1.5. Validações por Line ID',
	'validations-by-pattern': '1.4. Validações por Pattern ID',
	'validations-by-stop': '1.3. Validações por Stop ID',
	'validations-by-stop-by-pattern': '1.2. Validações por Stop ID, por Pattern ID',
	'validations-by-stop-by-trip': '1.1. Validações por Stop ID, por Trip ID',
	'validations-raw': '1.0. Validações em bruto',
	'vehicle-events-raw': '3.0. Vehicle Events em bruto',
} as const;

export type ExportType = keyof typeof exportTypeLabels;

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
