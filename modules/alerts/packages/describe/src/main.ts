/* * */

import { type AlertsDescribeRequest, AlertsDescribeRequestSchema, type AlertsDescribeResponse } from '@tmlmobilidade/go-alerts-pckg-types';
import { OCIGenerativeAIProvider } from '@tmlmobilidade/go-providers-ai';

import { appendToPromptContext, getFinalPrompt, initPromptContext } from './context/index.js';
import { fetchAgencyReferenceContext } from './data/agencies/fetch-agency-reference-context.js';
import { fetchLinesReferenceContext } from './data/lines/fetch-lines-reference-context.js';
import { fetchRidesReferenceContext } from './data/rides/fetch-rides-reference-context.js';
import { fetchStopsReferenceContext } from './data/stops/fetch-stops-reference-context.js';
import { initDescriptionPrompt } from './prompts/general/init.js';
import { DescribeAlertReturnType } from './types/main.js';
import { parseAiResult } from './utils/parse-ai-result.js';

/**
 * Generates a description and title for an alert based on its properties.
 * @param props The properties of the alert to be described.
 * @returns An object containing the description and title of the alert
 * in multiple languages, or undefined if required properties are missing.
 */
export async function generateAlertTitleAndDescription(request: AlertsDescribeRequest): Promise<AlertsDescribeResponse> {
	//

	//
	// Validate the request parameters

	const validatedRequestData = AlertsDescribeRequestSchema.parse(request);

	//
	// Initialize the prompt context
	// with the shared values for the current language

	const promptContext = initPromptContext();

	appendToPromptContext(promptContext, 'pt', 'header', initDescriptionPrompt['pt']);

	//
	// Fetch additional data depending on the reference type

	if (validatedRequestData.reference_type === 'agency') {
		const agencyPublicName = await fetchAgencyReferenceContext(validatedRequestData);
		appendToPromptContext(promptContext, 'pt', 'data', `Agency: ${agencyPublicName}`);
	}

	if (validatedRequestData.reference_type === 'lines') {
		const linesPublicNames = await fetchLinesReferenceContext(validatedRequestData);
		appendToPromptContext(promptContext, 'pt', 'data', linesPublicNames);
	}

	if (validatedRequestData.reference_type === 'stops') {
		const stopsPublicNames = await fetchStopsReferenceContext(validatedRequestData);
		appendToPromptContext(promptContext, 'pt', 'data', stopsPublicNames);
	}

	if (validatedRequestData.reference_type === 'rides') {
		const ridesPublicNames = await fetchRidesReferenceContext(validatedRequestData);
		appendToPromptContext(promptContext, 'pt', 'data', ridesPublicNames);
	}

	//
	// Setup the OCI generative AI provider
	// and run the prompt for each language

	const ociGenerativeAIProvider = new OCIGenerativeAIProvider();

	const finalPrompt = getFinalPrompt(promptContext, 'pt');

	const aiResult = await ociGenerativeAIProvider.run(finalPrompt, { temperature: 0.3 });

	const parsedAiResult = parseAiResult(aiResult);

	//
	// Add this result to the language result

	const result: DescribeAlertReturnType = {
		en: { description: '', title: '' },
		pt: { description: '', title: '' },
	};

	result['pt'].title = parsedAiResult.title;
	result['pt'].description = parsedAiResult.description;

	return result;
}
