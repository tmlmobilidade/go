import { expect, test } from '@playwright/test';

/* * */

test.use({ viewport: { height: 844, width: 390 } });

test('feedback trigger stays clickable above a fully expanded line sheet', async ({ page }) => {
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	await page.route('**/v1/**', async route => await route.fulfill({ json: response([]) }));
	await page.route('**/v1/network/lines', async route => await route.fulfill({ json: response([{
		_id: 'line-test', agency_id: 'test-agency', color: '#0055AA', long_name: 'Linha de teste', pattern_ids: [], route_ids: [], short_name: '999', stop_ids: [], text_color: '#FFFFFF',
	}]) }));
	await page.addInitScript(() => window.localStorage.setItem('navegante:app-session:v1', JSON.stringify({
		isMapFiltersOpen: false, route: null, savedAt: Date.now(), sheets: [{ entityId: 'line-test', view: 'lines-detail' }], snapIndex: 3, version: 1,
	})));
	await page.goto('/hub/navegante-app');

	const trigger = page.getByRole('button', { name: 'Dá-nos o teu feedback' });
	await expect(page.getByRole('dialog', { name: 'Detalhes da linha' })).toBeVisible();
	await expect(trigger).toBeVisible();
	await expect.poll(async () => await trigger.evaluate(element => {
		const bounds = element.getBoundingClientRect();
		return element.contains(document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2));
	})).toBe(true);

	await trigger.click();
	await expect(page.getByRole('dialog', { name: 'Feedback' })).toBeVisible();
});
