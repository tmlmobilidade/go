'use client';

/* * */

import { type DescribeAlertProps } from '@/types/describe-alert-props.js';
import { type TemplatePlaceholder } from '@/types/placeholders.js';
import { Dates } from '@tmlmobilidade/dates';
import { type RideNormalized } from '@tmlmobilidade/types';

/* * */

export const templatePlaceholderReplacements: Record<TemplatePlaceholder, (data: DescribeAlertProps['data']) => Promise<string>> = {

	'{headsign_title}': async () => '',

	'{holiday_name}': async () => '',

	'{line_short_name[]}': async () => '',

	'{line_short_name}': async () => '',

	'{lines_prose}': async () => '',

	'{lines_title}': async (data: Extract<DescribeAlertProps, { type: 'lines' }>['data']) => {
		const lineShortNames = Array.from(new Set(data.map(ht => ht.id) ?? []));
		return lineShortNames.join(', ');
	},

	'{ride_description}': async () => '',

	'{ride_short_name[]}': async () => '',

	'{ride_short_name}': async () => '',

	'{rides_description}': async (data: Extract<DescribeAlertProps, { type: 'rides' }>['data']) => {
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
		// Now that we have the gropus, build the prose string
		// in the format: "Viagem das 08h00, 09h00 e 10h00 da linha 1234 com destino a Lisboa"

		const parts: string[] = [];

		for (const [, group] of Object.entries(patternGroups)) {
			const rideStartTimes = group
				.sort((a, b) => a.start_time_scheduled - b.start_time_scheduled)
				.map(ride => Dates.fromUnixTimestamp(ride.start_time_scheduled).setZone('Europe/Lisbon', 'rebase_utc').toFormat('HH:mm'));

			const lineShortNames = Array.from(new Set(group.map(ht => ht.line_id)));
			const linePart = lineShortNames.length > 1
				? `das linhas ${lineShortNames.join(', ')}`
				: `da linha ${lineShortNames[0]} com destino a ${group[0].headsign}`;

			const ridesPart = rideStartTimes.length > 1
				? `nas viagens das ${rideStartTimes.slice(0, -1).join(', ')} e ${rideStartTimes.slice(-1)}`
				: `na viagem das ${rideStartTimes[0]}`;

			parts.push(`${ridesPart} ${linePart}`);
		}

		return parts.length > 1
			? parts.slice(0, -1).join('; ') + ' e ' + parts.slice(-1)
			: parts[0];

		//
	},

	'{rides_title}': async (data: Extract<DescribeAlertProps, { type: 'rides' }>['data']) => {
		const lineShortNames = Array.from(new Set(data.map(ht => ht.line_id) ?? []));
		return lineShortNames.join(', ');
	},

	'{start_time[]}': async () => '',

	'{start_time}': async () => '',

	'{stop_name[]}': async () => '',

	'{stop_name}': async () => '',

	'{stops_prose}': async () => '',

	'{stops_title}': async () => '',

	'*LINES*': async (data: Extract<DescribeAlertProps, { type: 'lines' }>['data']) => {
		const lineShortNames = Array.from(new Set(data.map(ht => ht.id) ?? []));
		return lineShortNames.join(', ');
	},

};
