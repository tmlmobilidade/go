import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/* * */

test.use({ viewport: { height: 844, width: 390 } });

test('line pattern picker contains focus, selects by keyboard, and restores its trigger', async ({ page }) => {
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	const patterns = Array.from({ length: 8 }, (_, index) => ({
		_id: `pattern-${index}`,
		direction_id: String(index % 2),
		headsign: `Destino de teste ${index}`,
		line_id: 'line-test',
		path: [{ stop_id: 'stop-test', stop_sequence: 1 }],
		route_id: 'route-test',
		shape_polyline: '',
		trips: [],
		valid_on: [20991231],
		version_id: `version-${index}`,
	}));
	await page.route('**/v1/**', async route => await route.fulfill({ json: response([]) }));
	await page.route('**/v1/network/lines', async route => await route.fulfill({ json: response([{
		_id: 'line-test', agency_id: 'test-agency', color: '#0055AA', long_name: 'Linha de teste', pattern_ids: patterns.map(pattern => pattern._id), route_ids: ['route-test'], short_name: '999', stop_ids: ['stop-test'], text_color: '#FFFFFF',
	}]) }));
	await page.route('**/v1/network/routes', async route => await route.fulfill({ json: response([{ _id: 'route-test', long_name: 'Percurso de teste' }]) }));
	await page.route('**/v1/network/stops', async route => await route.fulfill({ json: response([{ _id: 'stop-test', agency_ids: [], latitude: 38.7, locality_name: 'Lisboa', longitude: -9.1, municipality_name: 'Lisboa', name: 'Paragem de teste' }]) }));
	await page.route('**/v1/network/patterns/*', async route => await route.fulfill({ json: response(patterns.filter(pattern => route.request().url().endsWith(`/${pattern._id}`))) }));
	await page.addInitScript(() => window.localStorage.setItem('navegante:app-session:v1', JSON.stringify({
		isMapFiltersOpen: false, route: null, savedAt: Date.now(), sheets: [{ entityId: 'line-test', view: 'lines-detail' }], snapIndex: 2, version: 1,
	})));
	await page.goto('/hub/navegante-app');
	const line = page.getByRole('dialog', { includeHidden: true, name: 'Detalhes da linha' });
	const trigger = line.getByRole('button', { exact: true, includeHidden: true, name: 'Destino: Destino de teste 0' });
	await trigger.focus();
	await page.keyboard.press('Enter');
	const picker = page.getByRole('dialog', { exact: true, name: 'Selecionar percurso' });
	await expect(picker).toBeVisible();
	await expect(trigger).toHaveAttribute('aria-expanded', 'true');
	await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
	const panelId = await trigger.getAttribute('aria-controls');
	expect(panelId).toBeTruthy();
	await expect(picker.locator(`[id="${panelId}"]`)).toBeVisible();
	await expect(page.getByRole('dialog')).toHaveCount(1);
	await expect(page.locator('[data-overlay-container]')).toHaveAttribute('aria-hidden', 'true');
	await expect(picker.getByRole('button', { name: /Destino de teste 0/ })).toHaveAttribute('aria-pressed', 'true');
	for (let step = 0; step < 12; step++) {
		await page.keyboard.press('Tab');
		await expect.poll(() => picker.evaluate(element => element.contains(document.activeElement))).toBe(true);
		await expect(page.locator(':focus')).toBeInViewport({ ratio: 1 });
	}
	const scan = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
	expect(scan.violations, JSON.stringify(scan.violations)).toEqual([]);
	await page.keyboard.press('Escape');
	await expect(picker).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(trigger).toHaveAttribute('aria-expanded', 'false');
	await page.keyboard.press('Enter');
	await expect(picker).toBeVisible();
	await picker.getByRole('button', { name: /Destino de teste 0/ }).focus();
	const choice = picker.getByRole('button', { name: /Destino de teste 7/ });
	await choice.focus();
	await expect(choice).toBeInViewport({ ratio: 1 });
	await expect(choice).toBeFocused();
	await page.keyboard.press('Space');
	await expect(picker).toHaveCount(0);
	const updatedTrigger = line.getByRole('button', { exact: true, includeHidden: true, name: 'Destino: Destino de teste 7' });
	await expect(updatedTrigger).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(picker.getByRole('button', { name: /Destino de teste 7/ })).toHaveAttribute('aria-pressed', 'true');
	await picker.getByRole('button', { name: 'Fechar' }).click();
	await expect(updatedTrigger).toBeFocused();
});
