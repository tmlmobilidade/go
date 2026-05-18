/* * */

import { type TransportOption } from '@/contexts/GlobalSettings.context';

/* * */

export const TRANSPORT_AGENCY_IDS: Record<TransportOption, string[]> = {
	boat: ['15'],
	bus: ['4', '8', '21', '41', '42', '43', '44'],
	metro: ['2', '16'],
	train: ['1', '3'],
};

export const ALL_TRANSPORT_OPTIONS = Object.keys(TRANSPORT_AGENCY_IDS) as TransportOption[];

/* * */

export const AGENCY_ID_TO_TRANSPORT: Record<string, TransportOption> = Object.entries(TRANSPORT_AGENCY_IDS).reduce<Record<string, TransportOption>>((acc, [transport, ids]) => {
	ids.forEach((id) => {
		acc[id] = transport as TransportOption;
	});
	return acc;
}, {});

/* * */

export function transportsSelectionIsAll(transports: TransportOption[]): boolean {
	if (transports.length === 0) return true;
	if (transports.length !== ALL_TRANSPORT_OPTIONS.length) return false;
	return ALL_TRANSPORT_OPTIONS.every(mode => transports.includes(mode));
}

export function normalizeTransportsSelection(values: TransportOption[]): TransportOption[] {
	const unique = [...new Set(values)];
	if (transportsSelectionIsAll(unique)) return [];
	return [...unique].sort((a, b) => ALL_TRANSPORT_OPTIONS.indexOf(a) - ALL_TRANSPORT_OPTIONS.indexOf(b));
}

export function nextTransportsAfterToggle(prevList: TransportOption[], key: 'all' | TransportOption): TransportOption[] {
	if (key === 'all') return [];
	const current = normalizeTransportsSelection(prevList);
	if (transportsSelectionIsAll(current)) return [key];
	const next = new Set(current);
	if (next.has(key)) next.delete(key);
	else next.add(key);
	return normalizeTransportsSelection([...next]);
}

export function agencyMatchesTransports(agencyId: string | undefined, transports: TransportOption[]): boolean {
	if (transportsSelectionIsAll(transports)) return true;
	if (!agencyId) return false;
	const transport = AGENCY_ID_TO_TRANSPORT[agencyId];
	return transport ? transports.includes(transport) : false;
}

/* * */

export function agencyMatchesSelection(agencyId: string | undefined, selectedAgencyIds: string[]): boolean {
	if (selectedAgencyIds.length === 0) return true;
	if (!agencyId) return false;
	return selectedAgencyIds.some(selectedId => selectedId === agencyId);
}
