import { UpdateAgencySchema } from '@tmlmobilidade/go-types-core';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getAgenciesDetailValidationRules } from './get-agencies-detail-validation-rules';

/* * */

test('editing current rules produces a valid save payload when saved data contains obsolete rules', () => {
	const savedRules = {
		agency_id_field: { depends_on: [], severity: 'error' as const },
		agency_id_valid: { compare: [{ key: '1', value: 'Agency' }], depends_on: ['agency_id_field' as const], options: ['1'], severity: 'error' as const },
		obsolete_rule: { severity: 'warning' },
	};

	assert.equal(UpdateAgencySchema.safeParse({ plans: { validation_rules: savedRules } }).success, false);

	const editedRules = getAgenciesDetailValidationRules({
		...savedRules,
		agency_id_valid: { ...savedRules.agency_id_valid, severity: 'warning' },
	});
	const payload = UpdateAgencySchema.parse({ plans: { validation_rules: editedRules } });

	assert.deepEqual(payload.plans?.validation_rules, {
		agency_id_field: savedRules.agency_id_field,
		agency_id_valid: { ...savedRules.agency_id_valid, severity: 'warning' },
	});
	assert.deepEqual(savedRules.obsolete_rule, { severity: 'warning' });
});

test('cleanup retains invalid settings on current rules so save validation still reports them', () => {
	const rules = getAgenciesDetailValidationRules({
		agency_id_valid: { depends_on: [], options: [123 as unknown as string], severity: 'error' },
	});
	const result = UpdateAgencySchema.safeParse({ plans: { validation_rules: rules } });

	assert.equal(result.success, false);
	if (result.success) return;
	assert.deepEqual(result.error.issues[0].path, ['plans', 'validation_rules', 'agency_id_valid', 'options', 0]);
});
