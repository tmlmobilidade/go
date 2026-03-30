/* * */

import { CreateVehicleDto } from '@tmlmobilidade/types';

import { parseVehicleLine } from './parseVehicleLine';

/* * */

export const parseTxtFile = async (file: File): Promise<CreateVehicleDto[]> => {
	const text = await file.text();

	const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

	if (!lines.length) {
		throw new Error('Empty file');
	}

	const headers = lines[0].split(';').map(h => h.trim());

	return lines.slice(1).map((line, index) => {
		try {
			const values = line.split(';');

			const raw = headers.reduce<Record<string, string>>(
				(acc, header, i) => {
					acc[header] = values[i]?.trim() ?? '';
					return acc;
				},
				{},
			);

			return parseVehicleLine(raw);
		} catch (err) {
			throw new Error(
				`Error parsing line ${index + 2}: ${(err as Error).message}`,
			);
		}
	});
};
