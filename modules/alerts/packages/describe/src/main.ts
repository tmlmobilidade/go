'use client';

/* * */

import { templateArticlesReplacements } from '@/templates/articles.js';
import { alertI18nTemplates } from '@/templates/descriptions.js';
import { templatePlaceholderReplacements } from '@/templates/placeholders.js';
import { type I18nCodes } from '@/types/types.js';
import { OCIGenerativeAIProvider } from '@tmlmobilidade/interfaces';
import { Agency, AlertCause, AlertEffect, AlertReferences, AlertReferenceType, OperationalLine, OperationalStop, RideNormalized, type UnixTimestamp } from '@tmlmobilidade/types';

/* * */

export interface DescribeAlertProps {
	active_period_end_date: UnixTimestamp
	active_period_start_date: UnixTimestamp
	cause: AlertCause
	effect: AlertEffect
	reference_type: AlertReferenceType
	references: AlertReferences
}

export interface DescribeAlertReturnType {
	description: Record<I18nCodes, string>
	title: Record<I18nCodes, string>
}

// const aiProvider = new OCIGenerativeAIProvider();
// const response = await aiProvider.run('Hello world!');

/**
 * Generates a description and title for an alert based on its properties.
 * @param props The properties of the alert to be described.
 * @returns An object containing the description and title of the alert
 * in multiple languages, or undefined if required properties are missing.
 */
export async function describeAlertWithAI(props: DescribeAlertProps): Promise<DescribeAlertReturnType | undefined> {
	//

	//
	// Validate required input properties

	if (!props.cause) throw new Error('Missing required property: cause');
	if (!props.effect) throw new Error('Missing required property: effect');
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

	let fetchedData: Agency | OperationalLine[] | OperationalStop[] | RideNormalized[];

	switch (props.reference_type) {
		case 'agency':
			// Fetch the agency data based on the references
			fetchedData = await fetchAgencyData(props.references);
			break;
		case 'lines':
			// Fetch the lines data based on the references
			fetchedData = await fetchLinesData(props.references);
			break;
		case 'rides':
			// Fetch the rides data based on the references
			fetchedData = await fetchRidesData(props.references);
			break;
		case 'stops':
			// Fetch the stops data based on the references
			fetchedData = await fetchStopsData(props.references);
			break;
		default:
			throw new Error('Unsupported reference_type');
	}

	//
	// Setup result object

	const result: DescribeAlertReturnType = {
		description: { en: '', pt: '' },
		title: { en: '', pt: '' },
	};

	//
	// Detect if the alert is singular or plural based on the reference type

	const pluralKey = props.references.length > 1 ? 'plural' : 'singular';

	//
	// Build the key to access the templates

	const templateKey = `${props.cause}:${props.effect}:${props.reference_type}`;

	//
	// Iterate over all strings in the result object and
	// add the corresponding strings from the templates,
	// and replace the placeholders with actual values.

	for (const resultStringKey of Object.keys(result) as (keyof DescribeAlertReturnType)[]) {
		//

		// Each result string key has several i18n codes to populate
		for (const i18nCode of Object.keys(result[resultStringKey]) as I18nCodes[]) {
			//

			// Determine which template string we are populating, and if it is singular or plural.
			// Even though we might need a plural string, if it does not exist we fallback to the singular one.
			const templateStringType = alertI18nTemplates[templateKey]?.[resultStringKey];
			const templateStringCountableVariation = templateStringType?.[pluralKey] ? templateStringType[pluralKey] : templateStringType?.singular;

			// Skip if the template string variation is not defined
			if (!templateStringCountableVariation) continue;

			// Set the base string from the templates in the result object
			result[resultStringKey][i18nCode] = templateStringCountableVariation[i18nCode];

			// Each translated string has several placeholders that need to be replaced with actual values.
			for (const placeholderKey of Object.keys(templatePlaceholderReplacements[props.reference_type])) {
				//

				// Use the templates param builders to get the actual value for each placeholder
				const replacementValue = templatePlaceholderReplacements[props.reference_type][placeholderKey](props.data);

				// Replace all occurrences of the placeholder in the string with the actual value
				result[resultStringKey][i18nCode] = result[resultStringKey][i18nCode].replaceAll(placeholderKey, replacementValue);
			}

			// Each translated string has several articles that need to be replaced with actual values.
			for (const articleKey of Object.keys(templateArticlesReplacements)) {
				// Use the templates param builders to get the actual value for each article
				const replacementValue = templateArticlesReplacements[articleKey][i18nCode];
				// Replace all occurrences of the article in the string with the actual value
				result[resultStringKey][i18nCode] = result[resultStringKey][i18nCode].replaceAll(articleKey, replacementValue);
			}
		}
	}

	//
	// Return the result

	return result;

	//
}
