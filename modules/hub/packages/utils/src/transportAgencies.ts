/* * */

import { type TransportOption } from '@tmlmobilidade/go-hub-pckg-types';

/* * */

export const TRANSPORT_AGENCY_IDS: Record<TransportOption, string[]> = {
	boat: ['15'],
	bus: ['4', '8', '21', '41', '42', '43', '44'],
	metro: ['2', '16'],
	train: ['1', '3'],
};

/* * */

export const AGENCY_ID_TO_TRANSPORT: Record<string, TransportOption> = Object.entries(TRANSPORT_AGENCY_IDS).reduce<Record<string, TransportOption>>((acc, [transport, ids]) => {
	ids.forEach((id) => {
		const key = normalizeAgencyId(id);
		if (key) acc[key] = transport as TransportOption;
	});
	return acc;
}, {});

/* * */

function normalizeAgencyId(agencyId: string | undefined): string | undefined {
	if (!agencyId) return;
	const trimmed = agencyId.trim();
	if (!trimmed) return;
	const asNumber = Number(trimmed);
	if (!Number.isNaN(asNumber)) return asNumber.toString();
	return trimmed;
}

/* * */

export function agencyMatchesTransports(agencyId: string | undefined, transports: TransportOption[]): boolean {
	if (transports.length === 0) return true;
	const normalizedAgencyId = normalizeAgencyId(agencyId);
	if (!normalizedAgencyId) return false;
	const transport = AGENCY_ID_TO_TRANSPORT[normalizedAgencyId];
	return transport ? transports.includes(transport) : false;
}

/* * */

export function agencyMatchesSelection(agencyId: string | undefined, selectedAgencyIds: string[]): boolean {
	if (selectedAgencyIds.length === 0) return true;
	const normalizedAgencyId = normalizeAgencyId(agencyId);
	if (!normalizedAgencyId) return false;
	return selectedAgencyIds.some(selectedId => normalizeAgencyId(selectedId) === normalizedAgencyId);
}
