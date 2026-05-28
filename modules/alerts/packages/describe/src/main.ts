/* * */

import { getAgencyAreaLabel, getAgencyPassengerFacingName, getAgencyTitleLabel } from '@/agency-display-name.js';
import { brandingPrompt } from '@/prompts/branding.js';
import { causePrompt } from '@/prompts/cause.js';
import { effectPrompt } from '@/prompts/effect.js';
import { initDescriptionPrompt, titleFormatTemplatePrompt } from '@/prompts/init.js';
import { referenceTypePrompt } from '@/prompts/reference-type.js';
import { userInstructionDelimitersPrompt, userInstructionPrompt } from '@/prompts/user-instructions.js';
import { parseAlertGeneratedCopy, PromptBuilder } from '@/utils.js';
import { OCIGenerativeAIProvider } from '@tmlmobilidade/ai';
import { getOperationalLinesBatch, getOperationalStopsBatch } from '@tmlmobilidade/controllers';
import { Dates } from '@tmlmobilidade/dates';
import { agencies, rides } from '@tmlmobilidade/interfaces';
import { type Agency, type Alert, type I18nCode, type UnixTimestamp } from '@tmlmobilidade/types';

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

export interface DescribeAlertResolvedReference {
	parent_id: string
	reference_type: Alert['reference_type']
	resolved_child_labels: string[]
	resolved_parent_label: string
	title_labels: string[]
}

export interface DescribeAlertDebugPrompt {
	compressed: string
	expanded: string
	intro_entries: string[]
}

export interface DescribeAlertDebugData {
	body_entries: string[]
	prompt_by_language: Partial<Record<I18nCode, DescribeAlertDebugPrompt>>
	resolved_references: DescribeAlertResolvedReference[]
}

interface DescribeAlertAgencyLabels {
	areaLabel?: string
	passengerFacingName: string
	titleOperatorLabel: string
}

interface DescribeAlertContextData {
	body_entries: string[]
	body_steps: DescribeAlertPromptBodyStep[]
	resolved_references: DescribeAlertResolvedReference[]
}

interface DescribeAlertPromptBodyStep {
	text: string
	type: 'add' | 'append'
}

interface DescribeAlertPromptBodyCollector {
	addBody: (text: string) => void
	appendBody: (text: string) => void
	body_entries: string[]
	body_steps: DescribeAlertPromptBodyStep[]
}

function validateDescribeAlertProps(props: DescribeAlertProps) {
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
}

function createPromptBodyCollector(): DescribeAlertPromptBodyCollector {
	const bodyEntries: string[] = [];
	const bodySteps: DescribeAlertPromptBodyStep[] = [];

	return {
		addBody(text: string) {
			bodyEntries.push(text);
			bodySteps.push({ text, type: 'add' });
		},
		appendBody(text: string) {
			bodyEntries.push(`(append) ${text}`);
			bodySteps.push({ text, type: 'append' });
		},
		body_entries: bodyEntries,
		body_steps: bodySteps,
	};
}

async function getAgencyLabels(props: DescribeAlertProps): Promise<DescribeAlertAgencyLabels> {
	const foundAgency = await agencies.findById(props.agency_id);
	if (!foundAgency) throw new Error('Agency not found for the given reference');

	return {
		areaLabel: getAgencyAreaLabel(props.agency_id),
		passengerFacingName: getAgencyPassengerFacingName(props.agency_id, foundAgency.name),
		titleOperatorLabel: getAgencyTitleLabel(props.agency_id, foundAgency.name),
	};
}

function addDemonstrationTimingContext(props: DescribeAlertProps, collector: DescribeAlertPromptBodyCollector) {
	if (props.cause !== 'DEMONSTRATION') return;

	const activePeriodStart = Dates.fromUnixTimestamp(props.active_period_start_date);
	const activePeriodEnd = Dates.fromUnixTimestamp(props.active_period_end_date);
	const activePeriodSameDay = activePeriodStart.toFormat('yyyy-MM-dd') === activePeriodEnd.toFormat('yyyy-MM-dd');

	collector.addBody(`Alert active period start: ${activePeriodStart.toFormat('dd/MM/yyyy HH:mm')}`);
	collector.addBody(`Alert active period end: ${activePeriodEnd.toFormat('dd/MM/yyyy HH:mm')}`);
	collector.addBody(
		`Alert active period for event/manifestation alerts: ${activePeriodSameDay
			? `${activePeriodStart.toFormat('dd/MM/yyyy')} between ${activePeriodStart.toFormat('HH:mm')} and ${activePeriodEnd.toFormat('HH:mm')}`
			: `from ${activePeriodStart.toFormat('dd/MM/yyyy HH:mm')} to ${activePeriodEnd.toFormat('dd/MM/yyyy HH:mm')}`}`,
	);
}

function addAgencyReferenceContext(
	props: DescribeAlertProps,
	collector: DescribeAlertPromptBodyCollector,
	resolvedReferences: DescribeAlertResolvedReference[],
	agencyLabels: DescribeAlertAgencyLabels,
) {
	if (props.reference_type !== 'agency') return;

	collector.addBody(`Passenger-facing operator label: ${agencyLabels.passengerFacingName}`);
	collector.addBody(`Title operator label: ${agencyLabels.titleOperatorLabel}`);
	if (agencyLabels.areaLabel) collector.addBody(`Area label for titles: ${agencyLabels.areaLabel}`);

	resolvedReferences.push({
		parent_id: props.references[0]?.parent_id ?? props.agency_id,
		reference_type: 'agency',
		resolved_child_labels: [],
		resolved_parent_label: agencyLabels.passengerFacingName,
		title_labels: [agencyLabels.titleOperatorLabel],
	});
}

async function addLinesReferenceContext(
	props: DescribeAlertProps,
	collector: DescribeAlertPromptBodyCollector,
	resolvedReferences: DescribeAlertResolvedReference[],
) {
	if (props.reference_type !== 'lines') return;

	const foundLines = await getOperationalLinesBatch({
		agency_ids: [props.agency_id],
		date_end: props.active_period_end_date,
		date_start: props.active_period_start_date,
	});
	if (!foundLines?.length) throw new Error('No Operational Lines found for the given references');

	for (const selectedReference of props.references) {
		const matchingLine = foundLines.find(line => String(line.line_id) === String(selectedReference.parent_id));
		if (!matchingLine) throw new Error(`Operational Line not found for reference with parent_id ${selectedReference.parent_id}`);
		collector.addBody(`Line (title): ${matchingLine.line_short_name}`);
		collector.addBody(`Line: (${matchingLine.line_short_name}) ${matchingLine.line_long_name}`);

		const resolvedChildLabels: string[] = [];
		if (selectedReference.child_ids?.length) {
			const matchingWaypoints = matchingLine.hashed_patterns
				.flatMap(hp => hp.path)
				.filter(waypoint => selectedReference.child_ids?.includes(String(waypoint.stop_id)));
			if (matchingWaypoints?.length) {
				collector.addBody('↳ Only on the following stops:');
				for (const waypoint of matchingWaypoints) {
					collector.addBody(`#${waypoint.stop_sequence} stop in path:`);
					collector.appendBody(`[${waypoint.stop_id}] ${waypoint.stop_name}`);
					resolvedChildLabels.push(`[${waypoint.stop_id}] ${waypoint.stop_name}`);
				}
			}
		}

		resolvedReferences.push({
			parent_id: selectedReference.parent_id,
			reference_type: 'lines',
			resolved_child_labels: resolvedChildLabels,
			resolved_parent_label: `(${matchingLine.line_short_name}) ${matchingLine.line_long_name}`,
			title_labels: [matchingLine.line_short_name],
		});
	}
}

async function addRidesReferenceContext(
	props: DescribeAlertProps,
	collector: DescribeAlertPromptBodyCollector,
	resolvedReferences: DescribeAlertResolvedReference[],
) {
	if (props.reference_type !== 'rides') return;

	const foundRides = await rides.findMany({ _id: { $in: props.references.map(ref => ref.parent_id) } });
	if (!foundRides?.length) throw new Error('Rides not found for the given references');

	for (const rideData of foundRides) {
		const startTimeFormated = Dates.fromUnixTimestamp(rideData.start_time_scheduled).toFormat('HH:mm');
		collector.addBody(`Line (title): ${rideData.line_id}`);
		collector.addBody(`Circulation (title): line ${rideData.line_id} at ${startTimeFormated} to ${rideData.headsign}`);
		collector.addBody(`Ride: ${rideData.line_id} to ${rideData.headsign} departing at ${startTimeFormated}`);
		resolvedReferences.push({
			parent_id: rideData._id,
			reference_type: 'rides',
			resolved_child_labels: [],
			resolved_parent_label: `${rideData.line_id} to ${rideData.headsign} departing at ${startTimeFormated}`,
			title_labels: [String(rideData.line_id)],
		});
	}
}

async function addStopsReferenceContext(
	props: DescribeAlertProps,
	collector: DescribeAlertPromptBodyCollector,
	resolvedReferences: DescribeAlertResolvedReference[],
) {
	if (props.reference_type !== 'stops') return;

	const foundStops = await getOperationalStopsBatch({
		agency_ids: [props.agency_id],
		date_end: props.active_period_end_date,
		date_start: props.active_period_start_date,
	});
	if (!foundStops?.length) throw new Error('No Operational Stops found for the given references');

	for (const selectedReference of props.references) {
		const matchingStop = foundStops.find(stop => String(stop.stop_id) === String(selectedReference.parent_id));
		if (!matchingStop) throw new Error(`Operational Stop not found for reference with parent_id ${selectedReference.parent_id}`);
		collector.addBody(`Stop: [${matchingStop.stop_id}] ${matchingStop.stop_name}`);

		const resolvedChildLabels: string[] = [];
		const titleLabels: string[] = [];
		if (selectedReference.child_ids?.length) {
			const matchingLines = matchingStop.hashed_patterns
				.filter(line => selectedReference.child_ids?.includes(String(line.line_id)));
			if (matchingLines?.length) {
				collector.addBody('↳ Only for the following lines:');
				for (const line of matchingLines) {
					collector.addBody(`Line (title): ${line.line_short_name}`);
					collector.addBody(`(${line.line_short_name}) ${line.line_long_name}`);
					resolvedChildLabels.push(`(${line.line_short_name}) ${line.line_long_name}`);
					titleLabels.push(line.line_short_name);
				}
			}
		}

		resolvedReferences.push({
			parent_id: selectedReference.parent_id,
			reference_type: 'stops',
			resolved_child_labels: resolvedChildLabels,
			resolved_parent_label: `[${matchingStop.stop_id}] ${matchingStop.stop_name}`,
			title_labels: titleLabels,
		});
	}
}

async function buildDescribeAlertContextData(props: DescribeAlertProps): Promise<DescribeAlertContextData> {
	validateDescribeAlertProps(props);

	const collector = createPromptBodyCollector();
	const resolvedReferences: DescribeAlertResolvedReference[] = [];
	const agencyLabels = await getAgencyLabels(props);

	addDemonstrationTimingContext(props, collector);
	addAgencyReferenceContext(props, collector, resolvedReferences, agencyLabels);
	await addLinesReferenceContext(props, collector, resolvedReferences);
	await addRidesReferenceContext(props, collector, resolvedReferences);
	await addStopsReferenceContext(props, collector, resolvedReferences);

	return {
		body_entries: collector.body_entries,
		body_steps: collector.body_steps,
		resolved_references: resolvedReferences,
	};
}

function sanitizeUserInstructions(userInstructions: string) {
	return userInstructions
		.normalize('NFKC')
		.replaceAll('\n', ' ')
		.replace(/[\u200B-\u200D\uFEFF]/g, '')
		.replace(/\s+/g, ' ')
		.replace(/!{2,}/g, m => m.split('').join('\\!'))
		.replace(/#{2,}/g, m => m.split('').join('\\#'))
		.replace(/`{3,}/g, m => m.split('').join('\\`'))
		.replaceAll(userInstructionDelimitersPrompt.start, '')
		.replaceAll(userInstructionDelimitersPrompt.end, '');
}

function getPromptIntroEntries(props: DescribeAlertProps, i18nCode: I18nCode): string[] {
	return [
		initDescriptionPrompt[i18nCode],
		brandingPrompt[i18nCode],
		titleFormatTemplatePrompt[i18nCode],
		referenceTypePrompt[props.reference_type][i18nCode],
		causePrompt[props.cause][i18nCode],
		effectPrompt[props.effect][i18nCode],
	];
}

function buildPromptForLanguage(
	props: DescribeAlertProps,
	contextData: DescribeAlertContextData,
	i18nCode: I18nCode,
): DescribeAlertDebugPrompt {
	const introEntries = getPromptIntroEntries(props, i18nCode);
	const alertPrompt = new PromptBuilder();

	for (const introEntry of introEntries) {
		alertPrompt.add('intro', introEntry);
	}

	for (const bodyStep of contextData.body_steps) {
		if (bodyStep.type === 'add') alertPrompt.add('body', bodyStep.text);
		else alertPrompt.append('body', bodyStep.text);
	}

	if (props.user_instructions) {
		const sanitizedUserInstructions = sanitizeUserInstructions(props.user_instructions);
		const userInstructionsPrompt = userInstructionPrompt[i18nCode].replaceAll('{{USER_INSTRUCTIONS}}', sanitizedUserInstructions);
		alertPrompt.add('body', userInstructionsPrompt);
	}

	return {
		compressed: alertPrompt.getCompressed(),
		expanded: alertPrompt.get(),
		intro_entries: introEntries,
	};
}

export async function buildDescribeAlertDebugData(props: DescribeAlertProps): Promise<DescribeAlertDebugData> {
	const contextData = await buildDescribeAlertContextData(props);
	const i18nCode: I18nCode = 'pt';

	return {
		body_entries: contextData.body_entries,
		prompt_by_language: {
			[i18nCode]: buildPromptForLanguage(props, contextData, i18nCode),
		},
		resolved_references: contextData.resolved_references,
	};
}

/**
 * Generates a description and title for an alert based on its properties.
 * @param props The properties of the alert to be described.
 * @returns An object containing the description and title of the alert
 * in multiple languages, or undefined if required properties are missing.
 */
export async function describeAlert(props: DescribeAlertProps): Promise<DescribeAlertReturnType | undefined> {
	const contextData = await buildDescribeAlertContextData(props);
	const i18nCode: I18nCode = 'pt';

	const result: DescribeAlertReturnType = {
		en: { description: '', title: '' },
		pt: { description: '', title: '' },
	};

	const aiProvider = new OCIGenerativeAIProvider();
	const prompt = buildPromptForLanguage(props, contextData, i18nCode);
	const aiResult = await aiProvider.run(prompt.compressed, { temperature: 0.3 });
	const generated = parseAlertGeneratedCopy(aiResult);
	result['pt'].title = generated.title;
	result['pt'].description = generated.description;

	return result;
}
