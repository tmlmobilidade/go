import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getSavedRuleSeverity } from '../src/rules/get-rule-severity.js';
import { normalizeValidationRules } from '../src/rules/normalize-validation-rules.js';
import { ruleCatalogue } from '../src/rules/rules-catalogue.js';
import { ruleConfigKeys } from '../src/rules/rules-groups.js';
import { setRuleSeverity } from '../src/rules/set-rule-severity.js';

test('rebuilds saved rules without obsolete rules or file sections', () => {
	const input = {
		agency: {
			_file: 'warning',
			agency_id_unique: { depends_on: [], options: ['current'], severity: 'ignore' },
			old_agency_rule: { severity: 'invalid' },
		},
		obsolete: { _file: 'invalid', old_rule: { severity: 'error' } },
		removed: null,
	};
	const result = normalizeValidationRules(JSON.stringify(input));
	assert.deepEqual(result, {
		agency: {
			_file: 'warning',
			agency_id_unique: { depends_on: [], options: ['current'], severity: 'ignore' },
		},
	});
	assert.deepEqual(normalizeValidationRules(result), result);
	result.agency?.agency_id_unique?.options?.push('changed');
	assert.deepEqual(input.agency.agency_id_unique.options, ['current']);
});

test('every editable catalogue rule survives saving under its actual configuration key', () => {
	let rules = normalizeValidationRules({});
	for (const entry of ruleCatalogue) {
		if (entry.editable) rules = setRuleSeverity(rules, entry, 'warning');
	}
	const saved = normalizeValidationRules(rules);
	assert.deepEqual(saved, normalizeValidationRules(saved));
	for (const entry of ruleCatalogue) {
		if (!entry.editable) continue;
		assert.equal(getSavedRuleSeverity(saved, entry), 'warning', entry.id);
		assert.ok((ruleConfigKeys[entry.group] as readonly string[]).includes(entry.config_key), entry.id);
	}
	assert.equal(saved.fare_attributes?.fare_price_valid_non_negative_decimal?.severity, 'warning');
	assert.equal(saved.fare_attributes?._file, 'warning');
});

test('keeps missing severity distinct from explicitly ignored rules', () => {
	const input = { agency: { agency_id_unique: { severity: 'ignore' }, agency_name_present: { options: ['name'] } } };
	const editable = normalizeValidationRules(input, { allowIncomplete: true });
	assert.deepEqual(editable, input);
	assert.equal(editable.agency?.agency_url_valid_url, undefined);
	assert.throws(() => normalizeValidationRules(input), /agency_name_present: missing severity/);
	assert.deepEqual(normalizeValidationRules({}), {});
});

test('validates retained sections and severities', () => {
	assert.throws(() => normalizeValidationRules({ agency: null }), /agency: expected a rules section object/);
	assert.throws(() => normalizeValidationRules({ agency: { _file: 'invalid' } }), /agency._file: invalid severity/);
	assert.throws(() => normalizeValidationRules({ agency: { agency_id_unique: { severity: 'invalid' } } }), /agency_id_unique.severity: invalid severity/);
	assert.throws(() => normalizeValidationRules([]), /must be a JSON object/);
});
