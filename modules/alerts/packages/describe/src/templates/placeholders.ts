'use client';

/* * */

import { type DescribeAlertProps } from '@/types/describe-alert-props.js';
import { Dates } from '@tmlmobilidade/dates';
import { type RideNormalized } from '@tmlmobilidade/types';

/* * */

export const templatePlaceholderReplacements = {

	/**
	 * Returns a comma-separated list of line short names in Portuguese.
	 */
	'{lines_description_pt}': (data: Extract<DescribeAlertProps, { type: 'lines' }>['data']) => {
		const lineShortNames = Array.from(new Set(data.map(ht => ht.short_name) ?? []));
		return lineShortNames.join(', ');
	},

	/**
	 * Returns a string indicating the line or lines affected in Portuguese.
	 */
	'{lines_title}': (data: Extract<DescribeAlertProps, { type: 'lines' }>['data']) => {
		const lineShortNames = Array.from(new Set(data.map(ht => ht.short_name)));
		return lineShortNames.length > 1
			? `linhas ${lineShortNames.join(', ')}`
			: `linha ${lineShortNames[0]}`;
	},

	/**
	 * Returns a descriptive string for rides in Portuguese, with details about start times and lines.
	 * Can handle multiple rides and groups them by pattern ID.
	 */
	'{rides_description_pt}': (data: Extract<DescribeAlertProps, { type: 'rides' }>['data']) => {
		//

		//
		// Fetch ride details based on the provided ride IDs
		// and the corresponding HashedTrip objects

		const patternGroups: Record<RideNormalized['pattern_id'], RideNormalized[]> = {};

		for (const rideData of data) {
			if (!patternGroups[rideData.pattern_id]) {
				patternGroups[rideData.pattern_id] = [];
			}
			patternGroups[rideData.pattern_id].push(rideData);
		}

		//
		// Now that we have the groups, build the prose string in the format:
		// "Viagem das 08h00, 09h00 e 10h00 da linha 1234 com destino a Lisboa"

		const parts: string[] = [];

		for (const [, group] of Object.entries(patternGroups).sort()) {
			const rideStartTimes = group
				.sort((a, b) => a.start_time_scheduled - b.start_time_scheduled)
				.map(ride => Dates.fromUnixTimestamp(ride.start_time_scheduled).setZone('Europe/Lisbon', 'rebase_utc').toFormat('HH:mm'));

			const lineShortNames = Array.from(new Set(group.map(ht => ht.line_id)));
			const linePart = lineShortNames.length > 1
				? `das linhas ${lineShortNames.join(', ')}`
				: `da linha ${lineShortNames[0]} com destino a ${group[0].headsign}`;

			const ridesPart = rideStartTimes.length > 1
				? `viagens das ${rideStartTimes.slice(0, -1).join(', ')} e ${rideStartTimes.slice(-1)}`
				: `viagem das ${rideStartTimes[0]}`;

			parts.push(`${ridesPart} ${linePart}`);
		}

		return parts.length > 1
			? parts.slice(0, -1).join('; ') + ' e ' + parts.slice(-1)
			: parts[0];

		//
	},

	/**
	 * Returns a comma-separated list of line IDs for rides.
	 */
	'{rides_title}': (data: Extract<DescribeAlertProps, { type: 'rides' }>['data']) => {
		const lineShortNames = Array.from(new Set(data.map(ht => ht.line_id) ?? [])).sort();
		return lineShortNames.join(', ');
	},

} as const satisfies Record<string, (data: DescribeAlertProps['data']) => string>;

/* * */

export type TemplatePlaceholder = keyof typeof templatePlaceholderReplacements;
