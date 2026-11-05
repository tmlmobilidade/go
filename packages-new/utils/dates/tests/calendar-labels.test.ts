import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getCompactMonthOptions, getCompactWeekdayOptions, getMonthOptions, getWeekdayOptions } from '../src/calendar-labels.js';

/* * */

test('formats compact localized options with initial capitals and no final dot', () => {
	for (const [locale, saturday, february] of [['pt-PT', 'Sáb', 'Fev'], ['es-ES', 'Sáb', 'Feb'], ['en-GB', 'Sat', 'Feb']]) {
		assert.equal(getCompactWeekdayOptions(locale).find(option => option.value === 6)?.label, saturday);
		assert.equal(getCompactMonthOptions(locale).find(option => option.value === 2)?.label, february);
	}
});

test('preserves native full-length labels and numeric calendar values', () => {
	assert.equal(getWeekdayOptions('pt-PT', 'long')[5].label, 'sábado');
	assert.equal(getMonthOptions('pt-PT', 'long')[1].label, 'fevereiro');
	assert.deepEqual(getCompactWeekdayOptions('pt-PT').map(option => option.value), [1, 2, 3, 4, 5, 6, 7]);
	assert.deepEqual(getCompactMonthOptions('pt-PT').map(option => option.value), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});
