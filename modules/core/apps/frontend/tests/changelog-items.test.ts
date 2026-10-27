import assert from 'node:assert/strict';
import { test } from 'node:test';

import { moveChangelogItem, sortChangelogItemsByCategory } from '../src/components/dev/changelog/detail/changelog-items.js';

/* * */

const items = [
	{ _id: 'fix-1', category: 'bug_fix' },
	{ _id: 'feature-1', category: 'new_feature' },
	{ _id: 'fix-2', category: 'bug_fix' },
	{ _id: 'feature-2', category: 'new_feature' },
] as const;

const ids = (list: readonly { _id: string }[]) => list.map(item => item._id);

test('items stay grouped by category and keep their order inside each group', () => {
	assert.deepEqual(ids(sortChangelogItemsByCategory([...items])), ['feature-1', 'feature-2', 'fix-1', 'fix-2']);
});

test('items move only within their own category', () => {
	assert.deepEqual(ids(moveChangelogItem([...items], 'fix-2', -1)), ['feature-1', 'feature-2', 'fix-2', 'fix-1']);
	assert.deepEqual(ids(moveChangelogItem([...items], 'fix-1', -1)), ['feature-1', 'feature-2', 'fix-1', 'fix-2']);
	assert.deepEqual(ids(moveChangelogItem([...items], 'feature-2', 1)), ['feature-1', 'feature-2', 'fix-1', 'fix-2']);
});
