/* * */

import { type DescribeAlertProps } from '@/types/describe-alert-props.js';
import { Dates } from '@tmlmobilidade/dates';
import { type AlertReferenceType, type RideNormalized } from '@tmlmobilidade/types';

/* * */

export const templatePlaceholderReplacements = {

	agency: {
		'{agency_title}': (data: Extract<DescribeAlertProps, { reference_type: 'agency' }>['data']) => {
			return `agência ${data.name}`;
		},
	},

	lines: {
		/**
		 * Returns a descriptive string for lines in Portuguese, with details about stops when available.
		 * Groups lines and includes stop information.
		 */
		'{lines_description_pt}': (data: Extract<DescribeAlertProps, { reference_type: 'lines' }>['data']) => {
		//

			//
			// Group lines and build prose string in the format:
			// "linha 1234 nas paragens X, Y e Z" or "linhas 1234, 5678"

			const parts: string[] = [];

			for (const hashedTripData of data) {
				const lineShortName = hashedTripData.line_short_name;
				const stops = hashedTripData.hashed_trips[0].path ?? [];

				if (stops.length > 0) {
					const stopNames = stops.map(stop => stop.stop_name).filter(Boolean);
					const stopsPart = stopNames.length > 1
						? `nas paragens ${stopNames.slice(0, -1).join(', ')} e ${stopNames.slice(-1)}`
						: `na paragem ${stopNames[0]}`;

					parts.push(`linha ${lineShortName} ${stopsPart}`);
				} else {
					parts.push(`linha ${lineShortName}`);
				}
			}

			return parts.length > 1
				? parts.slice(0, -1).join('; ') + ' e ' + parts.slice(-1)
				: parts[0];

		//
		},

		/**
		 * Returns a string indicating the line or lines affected in Portuguese.
		 */
		'{lines_title}': (data: Extract<DescribeAlertProps, { reference_type: 'lines' }>['data']) => {
			const lineShortNames = Array.from(new Set(data.map(ht => ht.line_short_name).filter(Boolean)));
			return lineShortNames.length > 1
				? `linhas ${lineShortNames.join(', ')}`
				: `linha ${lineShortNames[0]}`;
		},
	},

	rides: {

		/**
		 * Returns a descriptive string for rides in Portuguese, with details about start times and lines.
		 * Can handle multiple rides and groups them by pattern ID.
		 */
		'{rides_description_pt}': (data: Extract<DescribeAlertProps, { reference_type: 'rides' }>['data']) => {
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
					.map(ride => Dates.fromUnixTimestamp(ride.start_time_scheduled).setZone('Europe/Lisbon', 'offset_only').toFormat('HH:mm'));

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
		'{rides_title}': (data: Extract<DescribeAlertProps, { reference_type: 'rides' }>['data']) => {
			const lineShortNames = Array.from(new Set(data.map(ht => ht.line_id) ?? [])).sort();
			return lineShortNames.join(', ');
		},
	},

	stops: {
		/**
		 * Returns a descriptive string for stops in Portuguese, with details about lines when available.
		 * Groups stops and includes line information.
		 */
		'{stops_description_pt}': (data: Extract<DescribeAlertProps, { reference_type: 'stops' }>['data']) => {
		//

			//
			// Group stops and build prose string in the format:
			// "paragem X das linhas 1234, 5678" or "paragens X, Y e Z"

			const parts: string[] = [];

			for (const hashedTripData of data) {
				for (const waypoint of hashedTripData.hashed_trips[0].path ?? []) {
					const stopName = waypoint.stop_name;
					const lines = hashedTripData.hashed_trips[0].line_short_name ?? [];

					if (lines.length > 0) {
						const lineShortNames = hashedTripData.hashed_trips[0].line_short_name;
						const linesPart = `da linha ${lineShortNames[0]}`;
						parts.push(`paragem ${stopName} ${linesPart}`);
					} else {
						parts.push(`paragem ${stopName}`);
					}
				}
			}

			return parts.length > 1
				? parts.slice(0, -1).join('; ') + ' e ' + parts.slice(-1)
				: parts[0];

		//
		},
		'{stops_title}': (data: Extract<DescribeAlertProps, { reference_type: 'stops' }>['data']) => {
			const stopNames = Array.from(new Set(data.flatMap(ht => ht.hashed_trips[0].path.map(p => p.stop_name)).filter(Boolean)));
			return stopNames.length > 1
				? `paragens ${stopNames.join(', ')}`
				: `paragem ${stopNames[0]}`;
		},
	},

} as const satisfies Record<AlertReferenceType, Record<string, (data: DescribeAlertProps['data']) => string>>;

/* * */

export type TemplatePlaceholder = keyof typeof templatePlaceholderReplacements;
