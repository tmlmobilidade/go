import { PeriodsAssignmentFormSchema } from '@tmlmobilidade/go-offer-pckg-types';
import { YearPeriodSchema } from '@tmlmobilidade/go-types-offer';
import { type Permission } from '@tmlmobilidade/go-types-permissions';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getAssignablePeriods } from '../src/components/year-periods/shared/periods-assignment.js';

/* * */

const base = { agency_ids: ['A'], assignmentMode: 'existing', color: '', newPeriodName: '', yearPeriodId: '' };

test('existing assignment requires a selected period and mandatory operators', () => {
	assert.equal(PeriodsAssignmentFormSchema.safeParse(base).success, false);
	assert.equal(PeriodsAssignmentFormSchema.safeParse({ ...base, yearPeriodId: 'period' }).success, true);
	assert.equal(PeriodsAssignmentFormSchema.safeParse({ ...base, agency_ids: [], yearPeriodId: 'period' }).success, false);
});

test('create assignment requires a name but keeps colour optional like the domain', () => {
	assert.equal(PeriodsAssignmentFormSchema.safeParse({ ...base, assignmentMode: 'create', newPeriodName: '   ' }).success, false);
	assert.equal(PeriodsAssignmentFormSchema.safeParse({ ...base, assignmentMode: 'create', color: undefined, newPeriodName: 'School' }).success, true);
});

test('the picker offers only unlocked, fully authorized periods for the complete operator set', () => {
	const period = YearPeriodSchema.parse({ _id: 'a', agency_ids: ['A'], created_at: 1792368000000, created_by: 'actor', name: 'A', updated_at: 1792368000000, updated_by: 'actor' });
	const periods = [period, { ...period, _id: 'ab', agency_ids: ['A', 'B'] }, { ...period, _id: 'locked', is_locked: true }];
	const userPermissions: Permission[] = [{ action: 'update', resources: { agency_ids: ['A'] }, scope: 'year_periods' }];
	assert.deepEqual(getAssignablePeriods({ agencyIds: ['A'], periods, userPermissions }).map(item => item._id), ['a']);
	assert.deepEqual(getAssignablePeriods({ agencyIds: ['A', 'B'], periods, userPermissions }), []);
	assert.deepEqual(getAssignablePeriods({ agencyIds: ['B', 'A'], periods, userPermissions: [{ action: 'update', resources: { agency_ids: ['A', 'B'] }, scope: 'year_periods' }] }).map(item => item._id), ['ab']);
	assert.deepEqual(getAssignablePeriods({ agencyIds: ['A'], periods }), []);
});
