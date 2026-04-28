/* * */

import { causePrompts, effectPrompts, initPrompts, referenceTypePrompts, userPrompts } from '@/prompts.js';
import { PromptBuilder } from '@/utils.js';
import { getOperationalLinesBatch, getOperationalStopsBatch } from '@tmlmobilidade/controllers';
import { Dates } from '@tmlmobilidade/dates';
import { agencies, OCIGenerativeAIProvider, rides } from '@tmlmobilidade/interfaces';
import { type Agency, type Alert, type I18nCode, I18nCodeValues, type UnixTimestamp } from '@tmlmobilidade/types';

/* * */

export interface DescribeAlertProps {
	active_period_end_date: UnixTimestamp
	active_period_start_date: UnixTimestamp
	agency_id: Agency['_id']
	cause: Alert['cause']
	effect: Alert['effect']
	reference_type: Alert['reference_type']
	references: Alert['references']
	user_instructions?: string
}

export type DescribeAlertReturnType = Record<I18nCode, {
	description: string
	title: string
}>;

/**
 * Generates a description and title for an alert based on its properties.
 * @param props The properties of the alert to be described.
 * @returns An object containing the description and title of the alert
 * in multiple languages, or undefined if required properties are missing.
 */
export async function describeAlert(props: DescribeAlertProps): Promise<DescribeAlertReturnType | undefined> {
	//

	//
	// Validate required input properties

	if (!props.cause) throw new Error('Missing required property: cause');
	if (!props.effect) throw new Error('Missing required property: effect');
	if (!props.agency_id) throw new Error('Missing required property: agency_id');
	if (!props.reference_type) throw new Error('Missing required property: reference_type');
	if (!props.references) throw new Error('Missing required property: references');
	if (!props.active_period_start_date) throw new Error('Missing required property: active_period_start_date');
	if (!props.active_period_end_date) throw new Error('Missing required property: active_period_end_date');

	if (props.references.length === 0) throw new Error('References array cannot be empty');

	if (props.active_period_end_date <= props.active_period_start_date) throw new Error('active_period_end_date must be after active_period_start_date');

	if (!['agency', 'lines', 'rides', 'stops'].includes(props.reference_type)) throw new Error('Invalid reference_type value');

	//
	// Build the prompt part for the given reference type,
	// by fetching the corresponding data based on the alert context.

	const promptValue = new PromptBuilder();

	if (props.reference_type === 'agency') {
		// For 'agency' alert types, we expect only one reference,
		// and we fetch the agency data from the alert context.
		const foundAgency = await agencies.findById(props.agency_id);
		if (!foundAgency) throw new Error('Agency not found for the given reference');
		// Add the agency data to the prompt
		promptValue.add('body', `Agency Name: ${foundAgency.name}`);
		promptValue.add('body', `Agency Website: ${foundAgency.website_url}`);
	}

	if (props.reference_type === 'lines') {
		// For 'lines' alert types, we fetch the operational lines data
		// based on the agency_id from the alert context.
		const foundLines = await getOperationalLinesBatch({
			agency_ids: [props.agency_id],
			// TODO: Filter by line IDs to avoid fetching unnecessary data
			// line_ids: props.references.map(ref => ref.parent_id),
			date_end: props.active_period_end_date,
			date_start: props.active_period_start_date,
		});
		if (!foundLines?.length) throw new Error('No Operational Lines found for the given references');
		for (const selectedReference of props.references) {
			// Find the corresponding line for the current reference
			const matchingLine = foundLines.find(line => String(line.line_id) === String(selectedReference.parent_id));
			if (!matchingLine) throw new Error(`Operational Line not found for reference with parent_id ${selectedReference.parent_id}`);
			// Add the line data to the prompt
			promptValue.add('body', `Line: (${matchingLine.line_short_name}) ${matchingLine.line_long_name}`);
			// Check if this reference has any child IDs that should
			// also be included in the prompt. In this case, 1 line -> only a few stops
			if (selectedReference.child_ids?.length) {
				const matchingWaypoints = matchingLine.hashed_trips
					.flatMap(ht => ht.path)
					.filter(waypoint => selectedReference.child_ids?.includes(String(waypoint.stop_id)));
				if (matchingWaypoints?.length) {
					promptValue.add('body', '↳ Only on the following stops:');
					for (const waypoint of matchingWaypoints) {
						promptValue.add('body', `#${waypoint.stop_sequence} stop in path:`);
						promptValue.append('body', `[${waypoint.stop_id}] ${waypoint.stop_name}`);
					}
				}
			}
		}
	}

	if (props.reference_type === 'rides') {
		// We can fetch rides by ID directly
		const foundRides = await rides.findMany({ _id: { $in: props.references.map(ref => ref.parent_id) } });
		if (!foundRides?.length) throw new Error('Rides not found for the given references');
		// Iterate over each ride reference
		for (const rideData of foundRides) {
			// Transform start time into a human-readable format
			const startTimeFormated = Dates.fromUnixTimestamp(rideData.start_time_scheduled).toFormat('HH:mm');
			// Add the ride data to the prompt
			promptValue.add('body', `Ride: ${rideData.line_id} to ${rideData.headsign} departing at ${startTimeFormated}`);
		}
	}

	if (props.reference_type === 'stops') {
		// For 'stops' alert types, we fetch the operational stops data
		// based on the agency_id from the alert context.
		const foundStops = await getOperationalStopsBatch({
			agency_ids: [props.agency_id],
			date_end: props.active_period_end_date,
			date_start: props.active_period_start_date,
		});
		if (!foundStops?.length) throw new Error('No Operational Stops found for the given references');
		for (const selectedReference of props.references) {
			// Find the corresponding stop for the current reference
			const matchingStop = foundStops.find(stop => String(stop.stop_id) === String(selectedReference.parent_id));
			if (!matchingStop) throw new Error(`Operational Stop not found for reference with parent_id ${selectedReference.parent_id}`);
			// Add the stop data to the prompt
			promptValue.add('body', `Stop: [${matchingStop.stop_id}] ${matchingStop.stop_name}`);
			// Check if this reference has any child IDs that should
			// also be included in the prompt. In this case, 1 stop -> only a few waypoints
			if (selectedReference.child_ids?.length) {
				const matchingLines = matchingStop.hashed_trips
					.filter(line => selectedReference.child_ids?.includes(String(line.line_id)));
				if (matchingLines?.length) {
					promptValue.add('body', '↳ Only for the following lines:');
					for (const line of matchingLines) {
						promptValue.add('body', `(${line.line_short_name}) ${line.line_long_name}`);
					}
				}
			}
		}
	}

	//
	// Setup result object

	const finalPrompts: Record<I18nCode, string> = {
		en: '',
		pt: '',
	};

	//
	// Iterate over all languages and build the prompt for each one, using the
	// corresponding templates and the fetched data to replace the placeholders.

	for (const i18nCode of I18nCodeValues) {
		//

		//
		// Skip non-supported languages for now

		if (i18nCode !== 'pt') continue;

		//
		// Get prompt parts for the current language

		promptValue.add('intro', initPrompts[i18nCode]);
		promptValue.add('intro', referenceTypePrompts[props.reference_type][i18nCode]);
		promptValue.add('intro', causePrompts[props.cause][i18nCode]);
		promptValue.add('intro', effectPrompts[props.effect][i18nCode]);

		//
		// Add the user prompt if the user supplied any extra instructions

		if (props.user_instructions) {
			const userInstructionsPrompt = userPrompts[i18nCode].replaceAll('{{USER_INSTRUCTIONS}}', props.user_instructions);
			promptValue.add('body', userInstructionsPrompt);
		}

		//
		// Save the final prompt for the current language
		// and reset the intro part for the next language iteration.

		finalPrompts[i18nCode] = promptValue.get();

		promptValue.reset('intro');

		//
	}

	//
	// Setup result object

	const result: DescribeAlertReturnType = {
		en: { description: '', title: '' },
		pt: { description: '', title: '' },
	};

	//
	// Build the OCI requests and run them in parallel, one for each language,
	// to generate the descriptions and titles based on the built prompts.

	const aiProvider = new OCIGenerativeAIProvider();

	await Promise.all(
		I18nCodeValues.map(async (code) => {
			result[code].description = await aiProvider.run(finalPrompts[code]);
		}),
	);

	//
	// Return the result

	return result;

	//
}
