'use client';

/* * */

import { alertI18nTemplates } from '@/templates/descriptions.js';
import { templatePlaceholderReplacements } from '@/templates/placeholders.js';
import { DescribeAlertProps } from '@/types/describe-alert-props.js';
import { type AlertConfigKey, type I18nCodes } from '@/types/types.js';

/* * */

export interface DescribeAlertReturnType {
	description: Record<I18nCodes, string>
	title: Record<I18nCodes, string>
}

/* * */

export async function describeAlert(props: DescribeAlertProps): Promise<DescribeAlertReturnType | undefined> {
	//

	//
	// Validate required input properties

	if (!props.cause || !props.effect || !props.reference_type || !props.references || !props.data) return;

	//
	// Setup result object

	const result: DescribeAlertReturnType = {
		description: { en: '', pt: '' },
		title: { en: '', pt: '' },
	};

	//
	// Detect if the alert is singular or plural based on the reference type

	const isPlural = props.references.length > 1;

	//
	// Build the key to access the templates

	const templateKey = `${props.cause}:${props.effect}:${props.reference_type}` as AlertConfigKey;

	//
	// Iterate over all strings in the result object and
	// add the corresponding strings from the templates,
	// and replace the placeholders with actual values.

	for (const resultStringKey of Object.keys(result) as (keyof DescribeAlertReturnType)[]) {
		// Each result string key has several i18n codes to populate
		for (const i18nCode of Object.keys(result[resultStringKey]) as I18nCodes[]) {
			// Determine which template string we are populating, and if it is singular or plural.
			// Even though we might need a plural string, if it does not exist we fallback to the singular one.
			const templateStringType = alertI18nTemplates[templateKey][resultStringKey];
			const templateStringCountableVariation = templateStringType[isPlural ? 'plural' : 'singular'] ? templateStringType[isPlural ? 'plural' : 'singular'] : templateStringType.singular;
			// Skip if the template string variation is not defined
			if (!templateStringCountableVariation) continue;
			// Set the base string from the templates in the result object
			result[resultStringKey][i18nCode] = templateStringCountableVariation[i18nCode].text;
			// Each translated string has several placeholders that need to be replaced with actual values.
			for (const placeholderKey of templateStringCountableVariation[i18nCode].placeholders) {
				// Use the templates param builders to get the actual value for each placeholder
				const replacementValue = await templatePlaceholderReplacements[placeholderKey](props.data);
				// Replace all occurrences of the placeholder in the string with the actual value
				result[resultStringKey][i18nCode] = result[resultStringKey][i18nCode].replaceAll(placeholderKey, replacementValue);
			}
		}
	}

	//
	// Return the result

	return result;

	//
}
