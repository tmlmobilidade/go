import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getBannerActivity } from '../src/components/dev/banners/shared/banner-activity.js';

/* * */

test('scheduled visibility does not replace publication status', () => {
	const time = 1_793_016_000_000;
	assert.equal(getBannerActivity({ ends_at: null, starts_at: null, status: 'draft' }, time), 'draft');
	assert.equal(getBannerActivity({ ends_at: null, starts_at: null, status: 'archived' }, time), 'archived');
	assert.equal(getBannerActivity({ ends_at: null, starts_at: null, status: 'published' }, time), 'active');
});

test('banner start times are inclusive and end times exclusive', () => {
	const time = 1_793_016_000_000;
	assert.equal(getBannerActivity({ ends_at: null, starts_at: UnixMillisecondsSchema.parse(time + 1), status: 'published' }, time), 'scheduled');
	assert.equal(getBannerActivity({ ends_at: null, starts_at: UnixMillisecondsSchema.parse(time), status: 'published' }, time), 'active');
	assert.equal(getBannerActivity({ ends_at: UnixMillisecondsSchema.parse(time), starts_at: null, status: 'published' }, time), 'expired');
});
