import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/* * */

test.use({ geolocation: { latitude: 38.79, longitude: -9.1 }, permissions: ['geolocation'], viewport: { height: 844, width: 390 } });

test('endpoint pickers share location recents, support keyboard selection, and preserve other recents when cleared', async ({ page }) => {
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	await page.route('**/v1/**', async route => await route.fulfill({ json: response([]) }));
	await page.route('**/v1/network/lines', async route => await route.fulfill({ json: response([{ _id: 'line-test', agency_id: 'test-agency', long_name: 'Linha recente', pattern_ids: [], route_ids: [], short_name: '999', stop_ids: [] }]) }));
	await page.route('**/v1/network/stops', async route => await route.fulfill({ json: response([{ _id: 'stop-test', agency_ids: [], latitude: 38.8, longitude: -9.09, municipality_name: 'Lisboa', name: 'Paragem recente' }]) }));
	await page.route('**/v1/motis/geocode?**', async route => await route.fulfill({ json: response([{ lat: 38.9, lon: -9.05, name: 'Alverca de teste', type: 'PLACE' }]) }));
	await page.route('**/v1/motis/plan?**', async route => await route.fulfill({ json: response({ itineraries: [{
		duration: 2700, endTime: '2026-10-09T12:45:00Z', legs: [{ duration: 2700, endTime: '2026-10-09T12:45:00Z', from: { lat: 38.79, lon: -9.1, name: 'Sacavém' }, mode: 'BUS', routeShortName: '999', startTime: '2026-10-09T12:00:00Z', to: { lat: 38.9, lon: -9.05, name: 'Alverca' } }], startTime: '2026-10-09T12:00:00Z', transfers: 0,
	}] }) }));
	await page.addInitScript(() => window.localStorage.setItem('navegante:recent-searches:v1', JSON.stringify([
		{ id: 'line-test', type: 'line' },
		{ id: 'stop-test', type: 'stop' },
		{ id: 'recent-place', location: { detail: 'Lisboa', id: 'recent-place', label: 'Local recente', lat: 38.85, lon: -9.08, type: 'PLACE' }, type: 'poi' },
	])));
	await page.goto('/hub/navegante-app');
	await page.getByRole('button', { exact: true, name: 'Pesquisar' }).click();
	await page.getByRole('textbox').fill('Alverca');
	await page.getByRole('button', { name: /Alverca de teste/ }).click();
	await page.getByRole('button', { name: /^Selecionar percurso/ }).click();
	const preview = page.getByRole('dialog', { name: 'Resumo da rota' });
	await expect(preview).toBeVisible();
	await page.getByRole('button', { name: /^Destino / }).focus();
	await page.keyboard.press('Enter');
	const search = page.getByRole('dialog', { name: 'Escolher destino' });
	const input = search.getByRole('textbox');
	await expect(input).toBeFocused();
	const recents = search.getByRole('region', { name: 'Pesquisas recentes' });
	await expect(recents.getByRole('button', { name: /Paragem recente/ })).toBeVisible();
	await expect(recents.getByRole('button', { name: /Local recente/ })).toBeVisible();
	await expect(recents.getByRole('button', { name: /Linha recente/ })).toHaveCount(0);
	const scan = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
	expect(scan.violations, JSON.stringify(scan.violations)).toEqual([]);
	await recents.getByRole('button', { name: /Local recente/ }).focus();
	await page.keyboard.press('Enter');
	const results = page.getByRole('dialog', { name: 'Opções de percurso' });
	await expect(results).toBeVisible();
	await expect(results.locator('[tabindex="-1"]')).toBeFocused();
	await expect(page.getByRole('button', { exact: true, name: 'Destino Local recente' })).toBeVisible();
	await page.getByRole('button', { name: /^Partida / }).focus();
	await page.keyboard.press('Enter');
	const originSearch = page.getByRole('dialog', { name: 'Escolher partida' });
	await expect(originSearch.getByRole('textbox')).toBeFocused();
	await originSearch.getByRole('button', { name: /Paragem recente/ }).focus();
	await page.keyboard.press('Space');
	await expect(results).toBeVisible();
	await expect(page.getByRole('button', { exact: true, name: 'Partida Paragem recente' })).toBeVisible();
	await page.getByRole('button', { name: /^Destino / }).click();
	await search.getByRole('button', { name: 'Limpar recentes' }).focus();
	await page.keyboard.press('Enter');
	await expect(input).toBeFocused();
	await expect(recents.getByRole('status')).toHaveText('Ainda não há pesquisas recentes.');
	await expect(recents.getByRole('list')).toHaveCount(0);
	await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem('navegante:recent-searches:v1') ?? '[]'))).toEqual([{ id: 'line-test', type: 'line' }]);
	await page.keyboard.press('Escape');
	await expect(results).toBeVisible();
});
