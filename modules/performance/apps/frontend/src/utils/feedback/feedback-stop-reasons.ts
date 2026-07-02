/* * */

import type { FeedbackEntityMetrics } from './feedback-metrics';
import type { PublicFeedback } from '@tmlmobilidade/types';

/* * */

export type FeedbackStopReasonCategory = 'stop' | 'unknown';

export interface FeedbackStopReasonMeter {
	id: FeedbackStopReasonCategory
	label: string
	reasons: FeedbackStopReasonReasonMeter[]
	selectable: boolean
	value: number
}

export interface FeedbackStopReasonReasonMeter {
	id: string
	label: string
	value: number
}

interface StopFeedbackReasonCount {
	label: string
	value: number
}

/* * */

const PERCENTAGE_DISPLAY_SCALE = 10;
const TOTAL_PERCENTAGE = 100;

const STOP_REASON_CATEGORIES = [
	{ id: 'stop', label: 'Paragem' },
	{ id: 'unknown', label: 'Indefinido' },
] as const satisfies readonly { id: FeedbackStopReasonCategory, label: string }[];

const STOP_REASON_LABELS = new Map<string, string>([
	['accessibility_issue', 'Problema de acessibilidade'],
	['audio_announcement_issue', 'Problema nos anúncios sonoros'],
	['confusing_signage', 'Sinalética confusa'],
	['damaged_bench', 'Banco danificado'],
	['dirty', 'Sujo'],
	['disorganized_boarding', 'Embarque ou fila desorganizada'],
	['display_issue', 'Problema no painel'],
	['elevator_escalator_issue', 'Problema no elevador ou escada rolante'],
	['lighting_issue', 'Problema na iluminação'],
	['missing_line_information', 'Informação de linhas em falta'],
	['no_bench', 'Sem banco'],
	['no_reason', 'Sem motivo indicado'],
	['no_shelter', 'Sem abrigo'],
	['no_trash_bin', 'Sem caixote do lixo'],
	['other', 'Outro'],
	['safety_incident', 'Incidente de segurança'],
	['shelter_issue', 'Problema no abrigo'],
	['sidewalk_issue', 'Problema no passeio'],
	['ticket_machine_issue', 'Problema na máquina de bilhetes'],
	['validator_issue', 'Problema no validador'],
	['weather_exposure_issue', 'Exposição ao mau tempo'],
	['wrong_panel_information', 'Informação errada no painel'],
]);

/* * */

function clampPercentage(value: number) {
	return Math.min(Math.max(value, 0), 100);
}

function roundPercentages(values: number[]) {
	if (values.length === 0) return [];

	const targetTotal = TOTAL_PERCENTAGE * PERCENTAGE_DISPLAY_SCALE;
	const scaledValues = values.map(value => clampPercentage(value) * PERCENTAGE_DISPLAY_SCALE);
	const roundedValues = scaledValues.map(Math.floor);
	const remainingValue = targetTotal - roundedValues.reduce((total, value) => total + value, 0);

	const indexesByRemainder = scaledValues
		.map((value, index) => ({ index, remainder: value - Math.floor(value) }))
		.sort((valueA, valueB) => valueB.remainder - valueA.remainder);

	for (let index = 0; index < remainingValue; index++) {
		const targetIndex = indexesByRemainder[index % indexesByRemainder.length]?.index;
		if (targetIndex === undefined) break;
		roundedValues[targetIndex] += 1;
	}

	return roundedValues.map(value => value / PERCENTAGE_DISPLAY_SCALE);
}

function getStopFeedbackReasonLabel(reason: string) {
	return STOP_REASON_LABELS.get(reason) ?? reason;
}

function getReasonMeters(reasonCounts: Map<string, StopFeedbackReasonCount>, totalReasonCount: number): FeedbackStopReasonReasonMeter[] {
	if (totalReasonCount === 0) return [];

	const reasonEntries = Array.from(reasonCounts.entries())
		.map(([id, reason]) => ({
			id,
			label: reason.label,
			value: (reason.value / totalReasonCount) * TOTAL_PERCENTAGE,
		}))
		.sort((reasonA, reasonB) => reasonB.value - reasonA.value || reasonA.label.localeCompare(reasonB.label, 'pt-PT'));

	const roundedValues = roundPercentages(reasonEntries.map(reason => reason.value));

	return reasonEntries.map((reason, index) => ({
		...reason,
		value: roundedValues[index] ?? reason.value,
	}));
}

/* * */

export function getFeedbackStopReasonMeters(rows: PublicFeedback[], metric: FeedbackEntityMetrics): FeedbackStopReasonMeter[] {
	const reasonCounts = new Map<string, StopFeedbackReasonCount>();
	let feedbackCount = 0;
	let reasonedFeedbackCount = 0;
	let totalReasonCount = 0;
	let unknownFeedbackCount = 0;

	for (const row of rows) {
		if (row.entity_type !== 'stop') continue;
		if (row.entity_id !== metric.entityId) continue;

		feedbackCount += 1;

		if (row.reasons.length === 0) {
			unknownFeedbackCount += 1;
			continue;
		}

		reasonedFeedbackCount += 1;

		for (const reason of Array.from(new Set(row.reasons))) {
			const currentReasonCount = reasonCounts.get(reason);

			reasonCounts.set(reason, {
				label: currentReasonCount?.label ?? getStopFeedbackReasonLabel(reason),
				value: (currentReasonCount?.value ?? 0) + 1,
			});

			totalReasonCount += 1;
		}
	}

	const categoryValues = [
		feedbackCount === 0 ? 0 : (reasonedFeedbackCount / feedbackCount) * TOTAL_PERCENTAGE,
		feedbackCount === 0 ? 0 : (unknownFeedbackCount / feedbackCount) * TOTAL_PERCENTAGE,
	];

	const roundedCategoryValues = feedbackCount === 0 ? categoryValues : roundPercentages(categoryValues);
	const reasonMeters = getReasonMeters(reasonCounts, totalReasonCount);

	return STOP_REASON_CATEGORIES.map((category, index) => ({
		id: category.id,
		label: category.label,
		reasons: category.id === 'stop' ? reasonMeters : [],
		selectable: category.id === 'stop' && reasonMeters.length > 0,
		value: roundedCategoryValues[index] ?? categoryValues[index] ?? 0,
	}));
}
