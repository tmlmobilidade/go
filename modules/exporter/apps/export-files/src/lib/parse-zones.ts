import { type ZoneExportData } from '@tmlmobilidade/types';

/***/

export function parseZones(row: { _id: null | string, code?: null | string, name?: null | string }): ZoneExportData {
	const { _id, code, name } = row;
	return {
		_id: _id ?? null,
		code: code ?? null,
		name: name ?? null,
	};
}
