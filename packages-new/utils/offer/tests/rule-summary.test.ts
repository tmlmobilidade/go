import { EventReplacementSchema, EventRestrictionSchema, EventRuleSchema, EventSchema, ManualRuleSchema, YearPeriodSchema } from '@tmlmobilidade/go-types-offer';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createOfferTranslator } from '../src/i18n/create-translator.js';
import { buildRuleSummaryGtfs } from '../src/rules/formatting/gtfs-rule-name.js';
import { buildRuleSummary } from '../src/rules/formatting/rule-summary.js';

/* * */

const audit = { created_at: 1_792_368_000_000, created_by: 'user', updated_at: 1_792_368_000_000 };
const period = YearPeriodSchema.parse({ ...audit, _id: 'period', agency_ids: ['agency'], code: '1', dates: [20260207], name: 'Período escolar', short_name: 'ESC' });
const rule = ManualRuleSchema.parse({ _id: 'rule', kind: 'manual', months: [2], operating_mode: 'include', timepoints: ['08:00'], weekdays: [6], year_period_ids: ['period'] });

test('uses one compact localized rule label with capitalized calendar abbreviations', async () => {
	for (const [locale, expected] of [
		['pt', 'Todos os períodos · Fev · Sáb'],
		['pt-PT', 'Todos os períodos · Fev · Sáb'],
		['es', 'Todos los periodos · Feb · Sáb'],
		['en', 'All periods · Feb · Sat'],
	]) {
		const t = await createOfferTranslator(locale);
		assert.equal(buildRuleSummary(rule, { locale, periods: [period], t }).label, expected);
	}
});

test('keeps agency-owned event titles and detailed event dates', async () => {
	const t = await createOfferTranslator('pt');
	const event = EventSchema.parse({ ...audit, _id: 'event', agency_ids: ['agency'], code: 'SPECIAL', dates: [20260207], rules: [], title: 'evento original' });
	const summary = buildRuleSummary({ ...rule, event_id: event._id }, { events: [event], locale: 'pt', periods: [period], t });
	assert.equal(summary.label, 'evento original · Fev · Sáb');
	assert.match(summary.tooltip, /07\/02\/2026 \(Sáb\)/);
});

test('keeps existing GTFS month and weekday tokens despite compact UI casing', async () => {
	for (const [locale, expected] of [['pt', 'ALL_FEV_SAB'], ['pt-PT', 'ALL_FEV_SABADO'], ['es', 'ALL_FEB_SAB'], ['en', 'ALL_FEB_SAT']]) {
		const t = await createOfferTranslator(locale);
		assert.equal(buildRuleSummaryGtfs(rule, { locale, periods: [period], t }), expected);
	}
});

test('shows consecutive month ranges and every separated month without inventing coverage', async () => {
	const t = await createOfferTranslator('pt');
	for (const [months, expected] of [
		[[4, 1, 2, 3], 'Jan–Abr'],
		[[1, 3, 6], 'Jan, Mar, Jun'],
		[[1, 2, 4, 5, 6, 9, 11, 12], 'Jan–Fev, Abr–Jun, Set, Nov–Dez'],
		[[12, 1, 1], 'Jan, Dez'],
	] as const) {
		const selected = ManualRuleSchema.parse({ ...rule, months });
		assert.equal(buildRuleSummary(selected, { locale: 'pt', periods: [period], t }).label, `Todos os períodos · ${expected} · Sáb`);
	}
});

test('omits a redundant month condition when every month is selected', async () => {
	const t = await createOfferTranslator('pt');
	const selected = ManualRuleSchema.parse({ ...rule, months: Array.from({ length: 12 }, (_, index) => index + 1) });
	assert.equal(buildRuleSummary(selected, { locale: 'pt', periods: [period], t }).label, 'Todos os períodos · Sáb');
});

test('identifies selected Periods by their own short names rather than a count', async () => {
	const t = await createOfferTranslator('pt');
	const holidays = YearPeriodSchema.parse({ ...period, _id: 'holidays', name: 'Férias escolares', short_name: 'FER' });
	const summer = YearPeriodSchema.parse({ ...period, _id: 'summer', name: 'Verão', short_name: 'VER' });
	const selected = ManualRuleSchema.parse({ ...rule, year_period_ids: [period._id, holidays._id] });
	assert.equal(buildRuleSummary(selected, { locale: 'pt', periods: [period, holidays, summer], t }).label, 'ESC e FER · Fev · Sáb');
});

test('uses full Period names when their abbreviations cannot distinguish them', async () => {
	const t = await createOfferTranslator('pt');
	const secondSchool = YearPeriodSchema.parse({ ...period, _id: 'second', name: 'Escolar alargado' });
	const summer = YearPeriodSchema.parse({ ...period, _id: 'summer', name: 'Verão', short_name: 'VER' });
	const selected = ManualRuleSchema.parse({ ...rule, year_period_ids: [period._id, secondSchool._id] });
	assert.equal(buildRuleSummary(selected, { locale: 'pt', periods: [period, secondSchool, summer], t }).label, 'Período escolar e Escolar alargado · Fev · Sáb');
});

test('uses the same compact conditions for replacement and manual rules without losing the event title', async () => {
	const t = await createOfferTranslator('pt');
	const summer = YearPeriodSchema.parse({ ...period, _id: 'summer', name: 'Verão', short_name: 'VER' });
	const options = { locale: 'pt', periods: [period, summer], t };
	const replacement = EventReplacementSchema.parse({
		_id: 'replacement', dates: [20260207], event: { id: 'event', title: 'Carnaval' }, kind: 'event_replacement', lines_mode: 'all', weekdays: [6], year_period_ids: [period._id],
	});
	const summary = buildRuleSummary(replacement, options);
	assert.equal(summary.label, 'Carnaval');
	assert.equal(summary.conditions, buildRuleSummary({ ...rule, months: [] }, options).label);
	assert.equal(summary.conditions, 'Período escolar · Sáb');
	assert.match(summary.tooltip, /Período escolar · Sáb/);
	assert.equal(buildRuleSummary({ ...replacement, same_weekday: true }, options).conditions, 'Período escolar · mesmo dia da semana');
});

test('distinguishes full-day, extended-hour windows and explicit-timepoint restrictions', async () => {
	const t = await createOfferTranslator('pt');
	const options = { locale: 'pt', t };
	const restriction = EventRestrictionSchema.parse({
		all_day: true, dates: [20261224], event: { id: 'event', title: 'Véspera' }, kind: 'event_restriction', lines_mode: 'all',
	});
	assert.equal(buildRuleSummary(restriction, options).conditions, 'Todo o dia');
	assert.equal(buildRuleSummary(EventRestrictionSchema.parse({ ...restriction, all_day: false, end_time: '27:59', start_time: '22:46' }), options).conditions, '22:46–27:59');
	assert.equal(buildRuleSummary(EventRestrictionSchema.parse({ ...restriction, all_day: false, timepoints: ['12:00', '08:00'] }), options).conditions, '08:00, 12:00');
});

test('formats stored event definitions consistently without requiring derived parent metadata', async () => {
	const t = await createOfferTranslator('pt');
	const options = { locale: 'pt', periods: [period], t };
	const definition = EventRuleSchema.parse({ dates: [20260207], kind: 'event_replacement', lines_mode: 'all', weekdays: [6], year_period_ids: [period._id] });
	const inferred = EventReplacementSchema.parse({ ...definition, event: { id: 'event', title: 'Carnaval' } });
	assert.equal(buildRuleSummary(definition, options).conditions, buildRuleSummary(inferred, options).conditions);
	assert.equal(buildRuleSummary(definition, options).label, 'Todos os períodos · Sáb');
	const restriction = EventRuleSchema.parse({ all_day: false, dates: [20260207], end_time: '27:59', kind: 'event_restriction', lines_mode: 'all', start_time: '22:46' });
	assert.equal(buildRuleSummary(restriction, options).conditions, '22:46–27:59');
});
