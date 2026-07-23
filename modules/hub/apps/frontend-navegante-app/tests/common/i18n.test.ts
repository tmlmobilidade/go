import namespaceDefaultPt from '@/i18n/namespaces/default/pt.json' with { type: 'json' };
import { createI18nInstance } from '@tmlmobilidade/ui/i18n';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

describe('createI18nInstance', () => {
	it('makes application translations available synchronously', () => {
		const instance = createI18nInstance({
			pt: {
				default: namespaceDefaultPt,
			},
		});

		assert.equal(instance.t('default:action-bar.ActionBar.search.label'), 'Pesquisar');
	});

	it('keeps application translations isolated between instances', () => {
		const applicationInstance = createI18nInstance({
			pt: {
				default: namespaceDefaultPt,
			},
		});
		const sharedInstance = createI18nInstance();

		assert.equal(applicationInstance.t('default:action-bar.ActionBar.search.label'), 'Pesquisar');
		assert.equal(sharedInstance.t('default:action-bar.ActionBar.search.label'), 'action-bar.ActionBar.search.label');
	});
});
