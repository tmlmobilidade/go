/* * */

import { createGtfsMapper } from '@/gtfs-new/mapper.js';
import { GtfsRouteType } from '@/gtfs-new/route-type.js';
import { z } from 'zod';

/* * */

export const TransportTypeValues = [
	'aerial_lift',
	'bus',
	'cable_tram',
	'ferry',
	'funicular',
	'monorail',
	'rail',
	'subway',
	'tram',
	'trolleybus',
] as const;

export const TransportTypeSchema = z.enum(TransportTypeValues);

export type TransportType = z.infer<typeof TransportTypeSchema>;

export const transportTypeMapper = createGtfsMapper<TransportType, GtfsRouteType>({
	aerial_lift: '6',
	bus: '3',
	cable_tram: '5',
	ferry: '4',
	funicular: '7',
	monorail: '12',
	rail: '2',
	subway: '1',
	tram: '0',
	trolleybus: '11',
});

export const transportTypeOptions: { label: string, value: TransportType }[] = [
	{ label: 'Teleférico', value: 'aerial_lift' },
	{ label: 'Autocarro', value: 'bus' },
	{ label: 'Elétrico', value: 'cable_tram' },
	{ label: 'Ferry', value: 'ferry' },
	{ label: 'Funicular', value: 'funicular' },
	{ label: 'Monocarril', value: 'monorail' },
	{ label: 'Comboio', value: 'rail' },
	{ label: 'Metro', value: 'subway' },
	{ label: 'Elétrico', value: 'tram' },
	{ label: 'Trolleybus', value: 'trolleybus' },
]; // Move this to translations
