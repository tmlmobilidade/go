'use client';

/* * */

import { alertI18nTemplates } from '@/templates/descriptions.js';
import { templatesParamBuilder } from '@/templates/references.js';
import { AlertConfigKey, DescribeAlertProps, type I18nCodes } from '@/types.js';

/* * */

export interface DescribeAlertReturnType {
	description: Record<I18nCodes, string>
	title: Record<I18nCodes, string>
}

/* * */

export async function describeAlert(props: DescribeAlertProps): Promise<DescribeAlertReturnType | undefined> {
	//

	if (!props.cause || !props.effect || !props.reference_type || !props.references) return;

	//
	// Setup initial variables

	const result: DescribeAlertReturnType = {
		description: { en: '', pt: '' },
		title: { en: '', pt: '' },
	};

	//
	// Detect if the alert is singular or plural based on the reference type

	const isPlural = props.references.length > 1;

	//
	// Build the key to access the templates

	const templateKey: AlertConfigKey = `${props.cause}:${props.effect}:${props.reference_type}`;

	//
	// Extract 'cause' template strings

	result.title.en = alertI18nTemplates[templateKey].title[isPlural ? 'plural' : 'singular'].en.text;
	result.title.pt = alertI18nTemplates[templateKey].title[isPlural ? 'plural' : 'singular'].pt.text;

	result.description.en = alertI18nTemplates[templateKey].description[isPlural ? 'plural' : 'singular'].en.text;
	result.description.pt = alertI18nTemplates[templateKey].description[isPlural ? 'plural' : 'singular'].pt.text;

	//
	// Make the necessary placeholder replacements in the strings
	// Ex: `{line_short_name}` => "1234"

	for (const stringPlace of Object.keys(result)) {
		for (const i18nCode of Object.keys(result[stringPlace as keyof DescribeAlertReturnType]) as I18nCodes[]) {
			for (const param of alertI18nTemplates[templateKey].description[isPlural ? 'plural' : 'singular'][i18nCode].params) {
				const replacement = await templatesParamBuilder[param](props.data);
				const regex = new RegExp(param.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
				result[stringPlace][i18nCode] = result[stringPlace][i18nCode].replace(regex, replacement);
			}
			const populatedText = result[stringPlace][i18nCode];
			result[stringPlace][i18nCode] = populatedText;
		}
	}

	//
	// Return the result

	return result;

	//
}
