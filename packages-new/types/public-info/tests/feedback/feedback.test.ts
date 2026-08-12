import {
	getPublicFeedbackReasonValuesByEntity,
	PublicFeedbackReasonCategoriesByEntity,
	PublicFeedbackReasonSchema,
	PublicFeedbackReasonValues,
	PublicFeedbackReasonValuesByCategory,
	PublicFeedbackSchema,
	PublicFeedbackSubmissionSchema,
} from '../../src/index.ts';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

/* * */

const validLineSubmission = {
	agency_id: 'agency',
	entity_id: 'line',
	entity_type: 'line',
	mood: 'unhappy',
	reasons: ['late'],
	schema_version: 'v1',
} as const;

/* * */

describe('public feedback contract', () => {
	it('keeps each category ordered and free of duplicate reasons', () => {
		for (const reasons of Object.values(PublicFeedbackReasonValuesByCategory)) {
			assert.equal(new Set(reasons).size, reasons.length);
			assert.equal(reasons.every(reason => PublicFeedbackReasonSchema.safeParse(reason).success), true);
		}

		assert.equal(new Set(PublicFeedbackReasonValues).size, PublicFeedbackReasonValues.length);
		assert.deepEqual(PublicFeedbackReasonCategoriesByEntity.line, ['driver', 'line_service', 'vehicle']);
		assert.deepEqual(PublicFeedbackReasonCategoriesByEntity.stop, ['stop']);
	});

	it('accepts known reasons for the selected entity', () => {
		assert.equal(PublicFeedbackSubmissionSchema.safeParse(validLineSubmission).success, true);
		assert.equal(getPublicFeedbackReasonValuesByEntity('line').length, 34);
		assert.equal(getPublicFeedbackReasonValuesByEntity('stop').length, 21);
	});

	it('rejects unknown, cross-entity, duplicate, and excessive reasons', () => {
		assert.equal(PublicFeedbackSubmissionSchema.safeParse({ ...validLineSubmission, reasons: ['unknown'] }).success, false);
		assert.equal(PublicFeedbackSubmissionSchema.safeParse({ ...validLineSubmission, reasons: ['no_bench'] }).success, false);
		assert.equal(PublicFeedbackSubmissionSchema.safeParse({ ...validLineSubmission, reasons: ['late', 'late'] }).success, false);
		assert.equal(PublicFeedbackSubmissionSchema.safeParse({ ...validLineSubmission, reasons: ['early', 'late', 'detour', 'long_headway', 'too_crowded'] }).success, false);
	});

	it('requires agency attribution for lines and forbids it for stops', () => {
		assert.equal(PublicFeedbackSubmissionSchema.safeParse({ ...validLineSubmission, agency_id: undefined }).success, false);
		assert.equal(PublicFeedbackSubmissionSchema.safeParse({
			entity_id: 'stop',
			entity_type: 'stop',
			mood: 'happy',
			reasons: ['no_bench'],
			schema_version: 'v1',
		}).success, true);
		assert.equal(PublicFeedbackSubmissionSchema.safeParse({
			agency_id: 'agency',
			entity_id: 'stop',
			entity_type: 'stop',
			mood: 'happy',
			reasons: ['no_bench'],
			schema_version: 'v1',
		}).success, false);
	});

	it('keeps the timestamp out of submissions and requires it on stored rows', () => {
		const submission = PublicFeedbackSubmissionSchema.parse({ ...validLineSubmission, created_at: 1 });
		assert.equal('created_at' in submission, false);
		assert.equal(PublicFeedbackSchema.safeParse(validLineSubmission).success, false);
		assert.equal(PublicFeedbackSchema.safeParse({ ...validLineSubmission, created_at: Date.now() }).success, true);
		assert.equal(PublicFeedbackSchema.safeParse({
			agency_id: null,
			created_at: Date.now(),
			entity_id: 'stop',
			entity_type: 'stop',
			mood: 'happy',
			reasons: ['no_bench'],
			schema_version: 'v1',
		}).success, true);
	});

	it('keeps other feedback associated with its submitted entity', () => {
		const feedback = PublicFeedbackSchema.parse({
			...validLineSubmission,
			created_at: 1_700_000_000_000,
			entity_id: '[BNA17]2792',
			reasons: ['other'],
		});

		assert.equal(feedback.agency_id, 'agency');
		assert.equal(feedback.entity_id, '[BNA17]2792');
		assert.deepEqual(feedback.reasons, ['other']);
	});
});
