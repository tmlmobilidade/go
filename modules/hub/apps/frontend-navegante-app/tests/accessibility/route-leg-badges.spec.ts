import { expect, test } from '@playwright/test';

/* * */

test.use({ geolocation: { latitude: 38.79, longitude: -9.1 }, permissions: ['geolocation'], viewport: { height: 844, width: 390 } });

test('the map preview labels transit legs, skips walking, and shrinks badges when zooming out', async ({ page }) => {
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	await page.route('**/v1/**', async route => await route.fulfill({ json: response([]) }));
	await page.route('**/v1/motis/geocode?**', async route => await route.fulfill({
		json: response([{ lat: 38.9, lon: -9.05, name: 'Alverca de teste', type: 'PLACE' }]),
	}));
	await page.route('**/v1/motis/plan?**', async route => await route.fulfill({ json: response({ itineraries: [createItinerary()] }) }));
	await page.goto('/hub/navegante-app');
	await page.getByRole('button', { exact: true, name: 'Pesquisar' }).click();
	await page.getByRole('textbox', { name: 'Pesquisar linhas, paragens, alertas e locais' }).fill('Alverca');
	await page.getByRole('button', { name: /Alverca de teste/ }).click();
	await page.getByRole('button', { name: /^Selecionar percurso/ }).click();
	await expect(page.getByRole('dialog', { name: 'Resumo da rota' })).toBeVisible();
	await page.getByRole('dialog', { name: 'Resumo da rota' }).getByRole('button', { name: 'Ver alternativas' }).click();
	const mapBadges = page.locator('[data-route-leg-index]');
	const results = page.getByRole('dialog', { name: 'Opções de percurso' });
	await expect(results).toBeVisible();
	await results.getByRole('button', { name: 'Recolher painel' }).click();
	await expect(mapBadges).toHaveCount(2);
	await expect(mapBadges.nth(0)).toContainText('2701');
	await expect(mapBadges.nth(1)).toContainText('2702');
	await expect(mapBadges.nth(0)).toBeInViewport();
	await expect(mapBadges.nth(1)).toBeInViewport();
	await expect(page.locator('[data-route-leg-index="1"]')).toHaveCount(0);
	await page.screenshot({ path: '/private/tmp/navegante-map-route-results-badges.png' });
	await page.getByRole('button', { name: /^Selecionar percurso/ }).click();
	await expect(page.getByRole('dialog', { name: 'Resumo da rota' })).toBeVisible();
	await expect(mapBadges).toHaveCount(2);
	const badgeScale = async () => await mapBadges.first().evaluate(element => Number(new DOMMatrix(getComputedStyle(element).transform).a.toFixed(2)));
	const initialScale = await badgeScale();
	await page.mouse.move(195, 300);
	await page.mouse.wheel(0, 1000);
	await expect.poll(badgeScale).toBeLessThan(initialScale);
	await page.screenshot({ path: '/private/tmp/navegante-map-route-leg-badges.png' });
	await page.getByRole('dialog', { name: 'Resumo da rota' }).getByRole('button', { name: 'Ver alternativas' }).click();
	await expect(mapBadges).toHaveCount(2);
	await page.getByRole('dialog', { name: 'Opções de percurso' }).getByRole('button', { exact: true, name: 'Fechar' }).click();
	await expect(mapBadges).toHaveCount(0);
});

/* * */

function createItinerary() {
	const leg = (mode: string, routeShortName: string | undefined, startTime: string, endTime: string, from: { lat: number, lon: number, name: string }, to: { lat: number, lon: number, name: string }) => ({
		duration: (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1_000,
		endTime,
		from,
		legGeometry: { length: 0, points: '', precision: 5 },
		mode,
		realTime: false,
		routeShortName,
		scheduled: true,
		scheduledEndTime: endTime,
		scheduledStartTime: startTime,
		startTime,
		to,
	});
	const start = { lat: 38.79, lon: -9.1, name: 'Sacavém' };
	const transfer = { lat: 38.82, lon: -9.085, name: 'Intercâmbio' };
	const nearbyStop = { lat: 38.823, lon: -9.08, name: 'Intercâmbio 2' };
	const destination = { lat: 38.9, lon: -9.05, name: 'Alverca' };
	const startTime = '2026-09-28T12:00:00Z';
	const endTime = '2026-09-28T12:32:00Z';

	return {
		duration: 32 * 60,
		endTime,
		id: 'route-with-transfer',
		legs: [
			leg('BUS', '2701', startTime, '2026-09-28T12:10:00Z', start, transfer),
			leg('WALK', undefined, '2026-09-28T12:10:00Z', '2026-09-28T12:12:00Z', transfer, nearbyStop),
			leg('BUS', '2702', '2026-09-28T12:12:00Z', endTime, nearbyStop, destination),
		],
		startTime,
		transfers: 1,
	};
}
