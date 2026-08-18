/* * */

import { parseAlertGeneratedCopy } from '@/utils/utils.js';
import { type AlertsDescribeRequest, AlertsDescribeRequestSchema, type AlertsDescribeResponse } from '@tmlmobilidade/go-alerts-pckg-types';
import { OCIGenerativeAIProvider } from '@tmlmobilidade/go-providers-ai';
import { type I18nCode } from '@tmlmobilidade/go-types-shared';

import { appendToPromptContext, initPromptContext } from './context/index.js';
import { fetchAgencyPublicName } from './data/fetch-agency-public-name.js';
import { initDescriptionPrompt } from './prompts/general/init.js';

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

	appendToPromptContext(promptContext, 'pt', 'init', initDescriptionPrompt['pt']);
	appendToPromptContext(promptContext, 'pt', 'footer', 'This is a test footer');
	appendToPromptContext(promptContext, 'pt', 'body', 'This is a test body');

	//
	// Simplify the request data depending on the reference type

	if (validatedRequestData.reference_type === 'agency') {
		const agencyPublicName = await fetchAgencyPublicName(validatedRequestData);
		appendToPromptContext(promptContext, 'pt', 'body', `Agency: ${agencyPublicName}`);
	}

	if (validatedRequestData.reference_type === 'lines') {
		const lineLabels = await fetchLinesPublicNames(validatedRequestData);
		appendToPromptContext(promptContext, 'pt', 'body', `Line: ${lineLabels.name}`);
	}

	if (validatedRequestData.reference_type === 'stops') {
		const stopLabels = await getStopLabels(validatedRequestData);
		appendToPromptContext(promptContext, 'pt', 'body', `Stop: ${stopLabels.name}`);
	}

	if (validatedRequestData.reference_type === 'rides') {
		const routeLabels = await getRouteLabels(validatedRequestData);
		appendToPromptContext(promptContext, 'pt', 'body', `Route: ${routeLabels.name}`);
	}

	//
	// Setup the OCI generative AI provider
	// and run the prompt for each language

	const ociGenerativeAIProvider = new OCIGenerativeAIProvider();

	const aiResult = await ociGenerativeAIProvider.run(prompt.compressed, { temperature: 0.3 });

	//
	//
	//
	//

	const contextData = await buildDescribeAlertContextData(props);
	const i18nCode: I18nCode = 'pt';

	const result: DescribeAlertReturnType = {
		en: { description: '', title: '' },
		pt: { description: '', title: '' },
	};

	const prompt = buildPromptForLanguage(props, contextData, i18nCode);

	const generated = parseAlertGeneratedCopy(aiResult);
	result['pt'].title = generated.title;
	result['pt'].description = generated.description;

	return result;
}
