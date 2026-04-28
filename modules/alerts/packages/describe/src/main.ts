/* * */

import { type I18nCodes } from '@/types.js';
import { getOperationalLinesBatch, getOperationalStopsBatch } from '@tmlmobilidade/controllers';
import { agencies, OCIGenerativeAIProvider, rides } from '@tmlmobilidade/interfaces';
import { type Agency, type Alert, type OperationalLine, type OperationalStop, type Ride, type UnixTimestamp } from '@tmlmobilidade/types';

/* * */

export interface DescribeAlertProps {
	active_period_end_date: UnixTimestamp
	active_period_start_date: UnixTimestamp
	agency_id: Agency['_id']
	cause: Alert['cause']
	effect: Alert['effect']
	reference_type: Alert['reference_type']
	references: Alert['references']
}

export interface DescribeAlertReturnType {
	description: Record<I18nCodes, string>
	title: Record<I18nCodes, string>
}

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
	// For the given alert properties, fetch the necessary data
	// to populate the template placeholders.

	let fetchedData: Agency | null | OperationalLine[] | OperationalStop[] | Ride[] = null;

	if (props.reference_type === 'agency') {
		// For 'agency' alert types, we expect only one reference,
		// and we fetch the agency data from the alert context.
		const foundAgency = await agencies.findById(props.agency_id);
		if (!foundAgency) throw new Error('Agency not found for the given reference');
		fetchedData = foundAgency;
	}

	if (props.reference_type === 'lines') {
		// For 'lines' alert types, we fetch the operational lines data
		// based on the agency_id from the alert context.
		fetchedData = await getOperationalLinesBatch({
			agency_ids: [props.agency_id],
			date_end: props.active_period_end_date,
			date_start: props.active_period_start_date,
		});
	}

	if (props.reference_type === 'rides') {
		// We can fetch rides by ID directly
		const foundRides = await rides.findMany({ _id: { $in: props.references.map(ref => ref.parent_id) } });
		if (!foundRides?.length) throw new Error('Rides not found for the given references');
		fetchedData = foundRides;
	}

	if (props.reference_type === 'stops') {
		// For 'stops' alert types, we fetch the operational stops data
		// based on the agency_id from the alert context.
		fetchedData = await getOperationalStopsBatch({
			agency_ids: [props.agency_id],
			date_end: props.active_period_end_date,
			date_start: props.active_period_start_date,
		});
	}

	if (!fetchedData) {
		throw new Error('Alert data unavailable');
	}

	//
	// Setup result object

	const result: DescribeAlertReturnType = {
		description: { en: '', pt: '' },
		title: { en: '', pt: '' },
	};

	//
	// Build the prompts for the AI model based on the alert properties and the fetched data.

	const templateKey = `${props.cause}:${props.effect}:${props.reference_type}`;

	//
	// Build the prompt string

	const prompt = '';

	// const aiProvider = new OCIGenerativeAIProvider();
	// const response = await aiProvider.run('Hello world!');

	//
	// Iterate over all strings in the result object and
	// add the corresponding strings from the templates,
	// and replace the placeholders with actual values.

	//
	// Return the result

	return result;

	//
}
