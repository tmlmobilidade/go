import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { AnnotationSchema, CreateAnnotationSchema, UpdateAnnotationSchema } from '../src/dates/annotation.js';

/* * */

describe('annotation client and stored contracts', () => {
	it('creates annotations from client fields without an audit actor', () => {
		assert.deepEqual(CreateAnnotationSchema.parse({ title: 'Annotation' }), {
			agency_ids: [],
			dates: [],
			is_locked: false,
			title: 'Annotation',
		});
	});

	it('ignores client-provided identifiers and audit fields during creation', () => {
		const input = { _id: 'spoof', created_at: 1, created_by: 'spoof', title: 'Annotation', updated_at: 1, updated_by: 'spoof' };
		assert.deepEqual(CreateAnnotationSchema.parse(input), CreateAnnotationSchema.parse({ title: 'Annotation' }));
	});

	it('keeps the updater server-owned and still validates editable fields', () => {
		assert.deepEqual(UpdateAnnotationSchema.parse({ created_by: 'spoof', title: 'Edited', updated_by: 'spoof' }), { title: 'Edited' });
		assert.equal(UpdateAnnotationSchema.safeParse({ title: '' }).success, false);
	});

	it('requires the server actor on stored annotations', () => {
		const input = { _id: 'annotation', created_at: 1_792_368_000_000, title: 'Annotation', updated_at: 1_792_368_000_000 };
		assert.equal(AnnotationSchema.safeParse(input).success, false);
		assert.equal(AnnotationSchema.safeParse({ ...input, created_by: 'user' }).success, true);
	});
});
