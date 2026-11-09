import { CalendarDateSchema, OperationalDateIntSchema, OperationalDateSchema, OperationalTimeSchema, UnixMillisecondsSchema, UnixSecondsSchema, validateCalendarDate, validateOperationalDate, validateOperationalTime, validateUnixMilliseconds, validateUnixSeconds } from '@tmlmobilidade/go-types-shared';
import { createValidationErrorMap } from '@tmlmobilidade/go-utils-validation';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { z } from 'zod';

import { GtfsFeedInfoSchema } from '../src/feed-info/feed-info.js';

const feed = { feed_end_date: 20260131, feed_lang: 'pt', feed_start_date: 20260101 };

test('feed dates inherit required and format messages from the shared schema', () => {
	for (const field of ['feed_start_date', 'feed_end_date']) {
		for (const locale of ['en', 'es', 'pt']) {
			const error = createValidationErrorMap(locale);
			const missing = GtfsFeedInfoSchema.safeParse({ ...feed, [field]: undefined }, { error });
			const invalid = GtfsFeedInfoSchema.safeParse({ ...feed, [field]: '2026-02-30' }, { error });
			const empty = GtfsFeedInfoSchema.safeParse({ ...feed, [field]: '' }, { error });
			const required = z.string().safeParse(undefined, { error }).error?.issues[0].message;
			assert.equal(missing.error?.issues[0].message, required);
			assert.deepEqual(missing.error?.issues[0].path, [field]);
			assert.match(invalid.error?.issues[0].message ?? '', /yyyyMMdd.*yyyy-MM-dd/);
			assert.equal(empty.error?.issues[0].message, invalid.error?.issues[0].message);
			assert.notEqual(invalid.error?.issues[0].message, required);
		}
	}
});

test('operational dates keep accepted inputs, branded numeric outputs and feed defaults', () => {
	for (const input of [20260101, '20260101', '2026-01-01']) {
		assert.equal(OperationalDateIntSchema.parse(input), 20260101);
		const result = GtfsFeedInfoSchema.parse({ ...feed, default_lang: null, feed_start_date: input });
		assert.equal(result.feed_start_date, 20260101);
		assert.equal(result.default_lang, 'pt');
		assert.equal(result.feed_contact_email, '');
	}
	for (const input of [null, true]) {
		const result = GtfsFeedInfoSchema.safeParse({ ...feed, feed_start_date: input }, { error: createValidationErrorMap('en') });
		assert.equal(result.error?.issues[0].message, 'Expected string / number');
	}
});

test('legacy date/time schemas emit localized Zod issues while direct validators still throw', () => {
	const cases: [z.ZodType, (value: string) => unknown, string, unknown][] = [
		[CalendarDateSchema, validateCalendarDate, '2026-01-01', '2026-01-01'],
		[OperationalDateSchema, validateOperationalDate, '20260101', '20260101'],
		[OperationalTimeSchema, validateOperationalTime, '27:59:59', '27:59:59'],
		[UnixMillisecondsSchema, validateUnixMilliseconds, '1715025600000', 1715025600000],
		[UnixSecondsSchema, validateUnixSeconds, '1715025600', 1715025600],
	];
	for (const [schema, validate, valid, output] of cases) {
		assert.equal(schema.parse(valid), output);
		assert.throws(() => validate('invalid'));
		const english = schema.safeParse('invalid', { error: createValidationErrorMap('en') });
		const portuguese = schema.safeParse('invalid', { error: createValidationErrorMap('pt') });
		assert.equal(english.success, false);
		assert.equal(portuguese.success, false);
		assert.notEqual(english.error?.issues[0].message, portuguese.error?.issues[0].message);
		assert.equal(english.error?.issues[0].code, 'custom');
	}
});
