/* * */

import { type AlertsDescribeRequest, AlertsDescribeRequestSchema, type AlertsDescribeResponse } from '@tmlmobilidade/go-alerts-pckg-types';
import { OCIGenerativeAIProvider } from '@tmlmobilidade/go-providers-ai';
import { I18nCodeValues } from '@tmlmobilidade/go-types-shared';

import { appendToPromptContext, getFinalPrompt, initPromptContext } from './context/index.js';
import { fetchAgencyReferenceContext } from './data/agencies/fetch-agency-reference-context.js';
import { fetchLinesReferenceContext } from './data/lines/fetch-lines-reference-context.js';
import { fetchRidesReferenceContext } from './data/rides/fetch-rides-reference-context.js';
import { fetchStopsReferenceContext } from './data/stops/fetch-stops-reference-context.js';
import { causePrompt } from './prompts/causes/cause.js';
import { effectPrompt } from './prompts/effects/effect.js';
import { initDescriptionPrompt } from './prompts/general/init.js';
import { titleFormatTemplatePrompt } from './prompts/general/title-prompt.js';
import { userInstructionPromptEnd, userInstructionPromptStart } from './prompts/general/user-instructions.js';
import { referenceTypePrompt } from './prompts/reference-types/reference-type.js';
import { parseAiResult } from './utils/parse-ai-result.js';

/**
 * Generates a description and title for an alert based on its properties.
 * @param props The properties of the alert to be described.
 * @returns An object containing the description and title of the alert
 * in multiple languages, or undefined if required properties are missing.
 */
export async function generateAlertTitleAndDescription(request: AlertsDescribeRequest): Promise<AlertsDescribeResponse> {
	//

	const result = {
		pt: { description: '', title: '' },
	} satisfies AlertsDescribeResponse;

	//
	// Iterate on the available language codes to generate
	// a title and description for each language

	for (const i18nCode of I18nCodeValues.filter(code => code === 'pt')) {
		//

		//
		// Validate the request parameters

		const validatedRequestData = AlertsDescribeRequestSchema.parse(request);

		//
		// Initialize the prompt context
		// with the shared values for the current language

		const promptContext = initPromptContext();

		appendToPromptContext(promptContext, i18nCode, 'header', initDescriptionPrompt[i18nCode]);
		appendToPromptContext(promptContext, i18nCode, 'header', titleFormatTemplatePrompt[i18nCode]);

		//
		// Add the cause and effect prompts

		appendToPromptContext(promptContext, i18nCode, 'body', causePrompt[validatedRequestData.cause][i18nCode]);
		appendToPromptContext(promptContext, i18nCode, 'body', effectPrompt[validatedRequestData.effect][i18nCode]);

		//
		// Fetch additional data depending on the reference type

		if (validatedRequestData.reference_type === 'agency') {
			appendToPromptContext(promptContext, i18nCode, 'body', referenceTypePrompt['agency'][i18nCode]);
			const agencyReferenceContext = await fetchAgencyReferenceContext(validatedRequestData);
			appendToPromptContext(promptContext, i18nCode, 'data', agencyReferenceContext);
		}

		if (validatedRequestData.reference_type === 'lines') {
			appendToPromptContext(promptContext, i18nCode, 'body', referenceTypePrompt['lines'][i18nCode]);
			const linesReferenceContext = await fetchLinesReferenceContext(validatedRequestData);
			appendToPromptContext(promptContext, i18nCode, 'data', linesReferenceContext);
		}

		if (validatedRequestData.reference_type === 'stops') {
			appendToPromptContext(promptContext, i18nCode, 'body', referenceTypePrompt['stops'][i18nCode]);
			const stopsReferenceContext = await fetchStopsReferenceContext(validatedRequestData);
			appendToPromptContext(promptContext, i18nCode, 'data', stopsReferenceContext);
		}

		if (validatedRequestData.reference_type === 'rides') {
			appendToPromptContext(promptContext, i18nCode, 'body', referenceTypePrompt['rides'][i18nCode]);
			const ridesReferenceContext = await fetchRidesReferenceContext(validatedRequestData);
			appendToPromptContext(promptContext, i18nCode, 'data', ridesReferenceContext);
		}

		//
		// Add the user instructions

		if (validatedRequestData.user_instructions) {
			appendToPromptContext(promptContext, i18nCode, 'footer', userInstructionPromptStart[i18nCode]);
			appendToPromptContext(promptContext, i18nCode, 'footer', validatedRequestData.user_instructions);
			appendToPromptContext(promptContext, i18nCode, 'footer', userInstructionPromptEnd[i18nCode]);
		}

		//
		// Setup the OCI generative AI provider
		// and run the prompt for each language

		const ociGenerativeAIProvider = new OCIGenerativeAIProvider();

		const finalPrompt = getFinalPrompt(promptContext, i18nCode);

		console.log('finalPrompt', finalPrompt);

		const aiResult = await ociGenerativeAIProvider.run(finalPrompt, { temperature: 0.3 });

		console.log('aiResult', aiResult);

		result[i18nCode] = parseAiResult(aiResult);
	}

	console.log('result', result);

	return result;
}
