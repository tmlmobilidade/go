/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type AlertsComposeRequest, AlertsComposeRequestSchema, type AlertsComposeResponse } from '@tmlmobilidade/go-alerts-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { OCIGenerativeAIProvider } from '@tmlmobilidade/go-providers-ai';
import { I18nCodeValues } from '@tmlmobilidade/go-types-shared';

import { appendToPromptContext, getFinalPrompt, initPromptContext } from './context/index.js';
import { fetchAgencyReferenceContext } from './data/agencies/fetch-agency-reference-context.js';
import { fetchLinesReferenceContext } from './data/lines/fetch-lines-reference-context.js';
import { fetchRidesReferenceContext } from './data/rides/fetch-rides-reference-context.js';
import { fetchStopsReferenceContext } from './data/stops/fetch-stops-reference-context.js';
import { initDescriptionPrompt } from './prompts/general/init.js';
import { userInstructionPromptEnd, userInstructionPromptStart } from './prompts/general/user-instructions.js';
import { activePeriodPrompt } from './prompts/references/active-period.js';
import { causePrompt } from './prompts/references/cause.js';
import { effectPrompt } from './prompts/references/effect.js';
import { referenceTypePrompt } from './prompts/references/reference-type.js';
import { parseAiResult } from './utils/parse-ai-result.js';

/**
 * Composes a description and title for an alert based on its properties.
 * @param props The properties of the alert to be described.
 * @returns An object containing the description and title of the alert
 * in multiple languages, or undefined if required properties are missing.
 */
export async function composeAlertTitleAndDescription(request: AlertsComposeRequest): Promise<AlertsComposeResponse> {
	//

	const result = {
		pt: { description: '', title: '' },
	} satisfies AlertsComposeResponse;

	//
	// Validate the request parameters

	const validatedRequestData = AlertsComposeRequestSchema.parse(request);

	//
	// Fetch the agency data

	const foundAgency = await goDb.core.agencies.findById(request.agency_id);

	if (!foundAgency) throw new Error(`Agency ${request.agency_id} not found in database.`);

	//
	// Fetch reference context data only once for all languages,
	// dependning on the requested reference type

	const agencyReferenceContext = validatedRequestData.reference_type === 'agency'
		? foundAgency.public_name ? `Agency Name: ${foundAgency.public_name}` : `Agency Name: ${foundAgency.name}`
		: null;

	const linesReferenceContext = validatedRequestData.reference_type === 'lines'
		? await fetchLinesReferenceContext(validatedRequestData)
		: null;

	const stopsReferenceContext = validatedRequestData.reference_type === 'stops'
		? await fetchStopsReferenceContext(validatedRequestData)
		: null;

	const ridesReferenceContext = validatedRequestData.reference_type === 'rides'
		? await fetchRidesReferenceContext(validatedRequestData)
		: null;

	//
	// Iterate on the available language codes to generate
	// a title and description for each language

	for (const i18nCode of I18nCodeValues.filter(code => code === 'pt')) {
		//

		//
		// Initialize the prompt context
		// with the shared values for the current language

		const promptContext = initPromptContext();

		appendToPromptContext(promptContext, 'intro', initDescriptionPrompt[i18nCode]);

		//
		// Add the cause and effect prompts

		appendToPromptContext(promptContext, 'intro', causePrompt[validatedRequestData.cause][i18nCode]);
		appendToPromptContext(promptContext, 'intro', effectPrompt[validatedRequestData.effect][i18nCode]);

		//
		// Add the active period prompt

		const activePeriodStart = Dates
			.fromUnixTimestamp(validatedRequestData.active_period_start_date)
			.setZone(foundAgency.timezone, 'offset_only')
			.toFormat('yyyy-MM-dd HH:mm');

		const activePeriodEnd = Dates
			.fromUnixTimestamp(validatedRequestData.active_period_end_date)
			.toFormat('yyyy-MM-dd HH:mm');

		appendToPromptContext(promptContext, 'intro', activePeriodPrompt[i18nCode](activePeriodStart, activePeriodEnd));

		//
		// Fetch additional data depending on the reference type

		if (validatedRequestData.reference_type === 'agency' && agencyReferenceContext) {
			appendToPromptContext(promptContext, 'intro', referenceTypePrompt['agency'][i18nCode]);
			appendToPromptContext(promptContext, 'intro', agencyReferenceContext);
		}

		if (validatedRequestData.reference_type === 'lines' && linesReferenceContext) {
			appendToPromptContext(promptContext, 'intro', referenceTypePrompt['lines'][i18nCode]);
			appendToPromptContext(promptContext, 'intro', linesReferenceContext);
		}

		if (validatedRequestData.reference_type === 'stops' && stopsReferenceContext) {
			appendToPromptContext(promptContext, 'intro', referenceTypePrompt['stops'][i18nCode]);
			appendToPromptContext(promptContext, 'intro', stopsReferenceContext);
		}

		if (validatedRequestData.reference_type === 'rides' && ridesReferenceContext) {
			appendToPromptContext(promptContext, 'intro', referenceTypePrompt['rides'][i18nCode]);
			appendToPromptContext(promptContext, 'intro', ridesReferenceContext);
		}

		//
		// Add the user instructions

		if (validatedRequestData.user_instructions) {
			appendToPromptContext(promptContext, 'intro', userInstructionPromptStart[i18nCode]);
			appendToPromptContext(promptContext, 'intro', validatedRequestData.user_instructions);
			appendToPromptContext(promptContext, 'intro', userInstructionPromptEnd[i18nCode]);
		}

		//
		// Setup the OCI generative AI provider
		// and run the prompt for each language

		const ociGenerativeAIProvider = new OCIGenerativeAIProvider();

		const finalPrompt = getFinalPrompt(promptContext);

		console.log('finalPrompt', finalPrompt);

		const aiResult = await ociGenerativeAIProvider.run(finalPrompt, { temperature: 0.3 });

		console.log('aiResult', aiResult);

		result[i18nCode] = parseAiResult(aiResult);
	}

	console.log('result', result);

	return result;
}
