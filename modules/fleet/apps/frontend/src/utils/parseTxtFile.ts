/* * */

import { CreateVehicleDto } from '@tmlmobilidade/types';
import Papa from 'papaparse';

import { parseVehicleLine } from './parseVehicleLine';

/* * */

export const parseTxtFile = async (file: File): Promise<CreateVehicleDto[]> => {
	const text = (await file.text()).replace(/^\uFEFF/, '');

	if (!text.trim()) {
		throw new Error('Empty file');
	}

	const parsed = Papa.parse<Record<string, string>>(text, {
		header: true,
		skipEmptyLines: true,
		transform: value => value.trim(),
		transformHeader: header => header.replace(/^\uFEFF/, '').trim(),
	});

	if (parsed.errors.length > 0) {
		throw new Error(`Failed to parse file: ${parsed.errors.map(error => error.message).join(', ')}`);
	}

	return parsed.data.map((raw, index) => {
		try {
			return parseVehicleLine(raw);
		} catch (err) {
			throw new Error(
				`Error parsing line ${index + 2}: ${(err as Error).message}`,
			);
		}
	});
};
