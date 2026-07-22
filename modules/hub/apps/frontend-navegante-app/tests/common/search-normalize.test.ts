import { normalizeSearchText } from '@/utils/search/normalize';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

describe('normalizeSearchText', () => {
	it('makes search text case-insensitive and accent-insensitive', () => {
		assert.equal(normalizeSearchText('Cais do Sodré'), 'cais do sodre');
	});

	it('preserves whitespace so each search flow can choose whether to trim it', () => {
		assert.equal(normalizeSearchText('  Oriente  '), '  oriente  ');
	});
});
