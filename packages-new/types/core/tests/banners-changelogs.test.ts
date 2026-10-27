import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { BannerDismissalSchema, ChangelogReleaseSchema, ChangelogViewSchema, ContentScopeSchema, CreateChangelogReleaseSchema, CreateOperationalBannerSchema, OperationalBannerSchema, UpdateChangelogReleaseSchema, UpdateOperationalBannerSchema } from '../dist/index.js';

/* * */

const now = 1_793_016_000_000;
const audit = { _id: 'content', created_at: now, created_by: 'maintainer', updated_at: now };
const scope = { type: 'platform' };
const publication = { published_at: now, published_by: 'maintainer', status: 'published' };
const item = { _id: 'item-1', category: 'improvement', title: 'Clearer validation' };
const release = { ...audit, ...publication, items: [item], scope, summary: 'More useful feedback.', title: 'Offer update' };
const banner = { ...audit, ...publication, kind: 'maintenance', message: 'Offer will be unavailable.', scope, title: 'Planned maintenance' };

describe('banner and changelog contracts', () => {
	it('requires an explicit platform or nonempty unique module scope', () => {
		assert.equal(ContentScopeSchema.safeParse(scope).success, true);
		assert.equal(ContentScopeSchema.safeParse({ module_ids: ['offer', 'operation'], type: 'modules' }).success, true);
		for (const input of [
			{ module_ids: [], type: 'modules' },
			{ module_ids: ['offer', 'offer'], type: 'modules' },
			{ module_ids: ['unknown'], type: 'modules' },
			{ module_ids: ['offer'], type: 'platform' },
		]) assert.equal(ContentScopeSchema.safeParse(input).success, false);
	});

	it('allows incomplete drafts but requires complete releases at publication', () => {
		const draft = ChangelogReleaseSchema.parse({ ...audit, scope });
		assert.equal(draft.status, 'draft');
		assert.equal(draft.published_at, null);
		assert.equal(ChangelogReleaseSchema.safeParse({ ...draft, ...publication }).success, false);
		assert.equal(ChangelogReleaseSchema.safeParse(release).success, true);
		for (const patch of [{ title: ' ' }, { summary: '' }, { items: [] }, { published_at: null }, { published_by: null }]) {
			assert.equal(ChangelogReleaseSchema.safeParse({ ...release, ...patch }).success, false);
		}
	});

	it('preserves item order and rejects duplicate stable IDs and unknown categories', () => {
		const second = { ...item, _id: 'item-2', category: 'bug_fix' };
		assert.deepEqual(ChangelogReleaseSchema.parse({ ...release, items: [second, item] }).items.map(change => change._id), ['item-2', 'item-1']);
		assert.equal(ChangelogReleaseSchema.safeParse({ ...release, items: [item, item] }).success, false);
		assert.equal(ChangelogReleaseSchema.safeParse({ ...release, items: [{ ...item, category: 'other' }] }).success, false);
	});

	it('retains paired publication metadata after unpublishing or archiving', () => {
		for (const status of ['draft', 'archived']) {
			assert.equal(ChangelogReleaseSchema.safeParse({ ...release, status }).success, true);
			assert.equal(ChangelogReleaseSchema.safeParse({ ...release, published_by: null, status }).success, false);
		}
	});

	it('strips server-owned fields from content creation and editing without introducing update defaults', () => {
		for (const schema of [CreateChangelogReleaseSchema, UpdateChangelogReleaseSchema]) {
			assert.deepEqual(Object.keys(schema.parse({ ...release, is_locked: true, updated_by: 'spoof' })).sort(), schema === UpdateChangelogReleaseSchema ? ['items', 'scope', 'status', 'summary', 'title'] : ['items', 'scope', 'summary', 'title']);
		}
		for (const schema of [CreateOperationalBannerSchema, UpdateOperationalBannerSchema]) {
			const parsed = schema.parse({ ...banner, dismissal_version: 42, updated_by: 'spoof' });
			for (const field of ['_id', 'created_at', 'created_by', 'updated_at', 'updated_by', 'published_at', 'published_by', 'dismissal_version']) {
				assert.equal(field in parsed, false);
			}
		}
		assert.equal('status' in CreateOperationalBannerSchema.parse(banner), false);
		assert.equal(UpdateOperationalBannerSchema.parse({ status: 'published' }).status, 'published');
		assert.equal(UpdateChangelogReleaseSchema.parse({ status: 'archived' }).status, 'archived');
		assert.equal(UpdateChangelogReleaseSchema.safeParse({ status: 'invalid' }).success, false);
		assert.equal(UpdateOperationalBannerSchema.safeParse({ status: 'invalid' }).success, false);
		assert.deepEqual(UpdateChangelogReleaseSchema.parse({}), {});
		assert.deepEqual(UpdateOperationalBannerSchema.parse({}), {});
	});

	it('validates banner schedules including partial edits merged with stored content', () => {
		assert.equal(OperationalBannerSchema.safeParse(banner).success, true);
		assert.equal(OperationalBannerSchema.safeParse({ ...banner, starts_at: now }).success, true);
		assert.equal(OperationalBannerSchema.safeParse({ ...banner, ends_at: now }).success, true);
		for (const endsAt of [now - 1, now]) {
			assert.equal(CreateOperationalBannerSchema.safeParse({ ...banner, ends_at: endsAt, starts_at: now }).success, false);
		}
		const patch = UpdateOperationalBannerSchema.parse({ ends_at: now - 1 });
		assert.equal(OperationalBannerSchema.safeParse({ ...banner, starts_at: now, ...patch }).success, false);
	});

	it('requires banner publication content, valid links, severity, and positive dismissal versions', () => {
		assert.equal(OperationalBannerSchema.parse(banner).dismissal_version, 1);
		assert.equal(OperationalBannerSchema.safeParse({ ...audit, kind: 'incident', scope }).success, true);
		for (const patch of [{ title: '' }, { message: '' }, { severity: 'danger' }, { dismissal_version: 0 }, { dismissal_version: 1.5 }, { published_at: null }]) {
			assert.equal(OperationalBannerSchema.safeParse({ ...banner, ...patch }).success, false);
		}
		for (const url of ['https://go.tmlmobilidade.pt', 'http://example.com']) {
			assert.equal(OperationalBannerSchema.safeParse({ ...banner, link: { label: 'Details', url } }).success, true);
		}
		for (const url of ['not a URL', 'javascript:alert(1)', 'ftp://example.com']) {
			assert.equal(OperationalBannerSchema.safeParse({ ...banner, link: { label: 'Details', url } }).success, false);
		}
	});

	it('requires interaction identity, time, and the dismissed version', () => {
		const view = { _id: 'view', release_id: 'release', seen_at: now, user_id: 'user' };
		const dismissal = { _id: 'dismissal', banner_id: 'banner', dismissal_version: 2, dismissed_at: now, user_id: 'user' };
		assert.deepEqual(ChangelogViewSchema.parse(view), view);
		assert.deepEqual(BannerDismissalSchema.parse(dismissal), dismissal);
		assert.equal(ChangelogViewSchema.safeParse({ ...view, user_id: '' }).success, false);
		assert.throws(() => ChangelogViewSchema.parse({ ...view, seen_at: 123 }), /milliseconds/);
		assert.equal(BannerDismissalSchema.safeParse({ ...dismissal, dismissal_version: 0 }).success, false);
	});
});
