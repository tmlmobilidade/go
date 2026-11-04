import { expect, type Page, type Route, test } from '@playwright/test';

/* * */

const success = { data: { itineraries: [{ duration: 600, endTime: '2026-10-12T11:10:00Z', id: 'latest-route', legs: [], startTime: '2026-10-12T11:00:00Z', transfers: 0 }] }, error: null, timestamp: Date.now() };

async function setupRoute(page: Page) {
	const requests: Route[] = [];
	await page.route('**/v1/**', async route => await route.fulfill({ json: { data: [], error: null, timestamp: Date.now() } }));
	await page.route('**/v1/motis/plan?**', (route) => {
		requests.push(route);
	});
	await page.addInitScript(() => {
		window.localStorage.setItem('navegante:app-session:v1', JSON.stringify({
			isMapFiltersOpen: false,
			route: {
				destination: { detail: 'Oeiras', label: 'Oeiras', lat: 38.69, lon: -9.31, type: 'PLACE' },
				destinationUsesCurrentLocation: false,
				locationSearchTarget: 'destination',
				origin: { detail: 'Montijo', label: 'Montijo', lat: 38.7, lon: -8.97, type: 'PLACE' },
				originUsesCurrentLocation: false,
				selectedItineraryIndex: 0,
				travelTime: { date: new Date().toISOString(), mode: 'now' },
				viewMode: 'results',
			},
			savedAt: Date.now(),
			sheets: [{ view: 'routes' }],
			snapIndex: 1,
			version: 1,
		}));
	});
	await page.goto('/hub/navegante-app');
	await expect.poll(() => requests.length).toBe(1);
	return requests;
}

async function finishRequest(page: Page, route: Route, json: unknown) {
	const received = page.waitForResponse(response => response.url() === route.request().url());
	await route.fulfill({ json });
	await (await received).finished();
	await page.evaluate(async () => await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

for (const source of ['restoration', 'planning']) {
	for (const outcome of ['empty', 'error']) {
		test(`ignores stale ${outcome} from ${source} after a newer route succeeds`, async ({ page }) => {
			const requests = await setupRoute(page);
			let staleIndex = 0;
			if (source === 'planning') {
				await finishRequest(page, requests[0], success);
				await expect(page.getByRole('button', { name: /^Selecionar percurso/ })).toHaveCount(1);
				await page.getByRole('button', { name: 'Trocar partida e destino' }).click();
				await expect.poll(() => requests.length).toBe(2);
				staleIndex = 1;
			}
			await page.getByRole('button', { name: 'Trocar partida e destino' }).click();
			await expect.poll(() => requests.length).toBe(staleIndex + 2);
			await finishRequest(page, requests[staleIndex + 1], success);
			await expect(page.getByRole('button', { name: /^Selecionar percurso/ })).toHaveCount(1);
			await page.getByRole('button', { name: /^Destino / }).click();
			await expect(page.getByRole('dialog', { name: 'Escolher destino' })).toBeVisible();
			await finishRequest(page, requests[staleIndex], outcome === 'empty'
				? { data: { itineraries: [] }, error: null, timestamp: Date.now() }
				: { data: null, error: 'Old request failed', timestamp: Date.now() });
			await expect(page.getByRole('dialog', { name: 'Escolher destino' })).toBeVisible();
			await page.getByRole('dialog', { name: 'Escolher destino' }).getByRole('button', { exact: true, name: 'Voltar' }).click();
			await expect(page.getByRole('dialog', { name: 'Opções de percurso' })).toBeVisible();
			await expect(page.getByRole('button', { name: /^Selecionar percurso/ })).toHaveCount(1);
			await expect(page.getByRole('dialog', { name: 'Opções de percurso' }).getByRole('alert')).toHaveCount(0);
		});
	}
}

test('a current failure reports its error without closing the destination picker', async ({ page }) => {
	const requests = await setupRoute(page);
	await finishRequest(page, requests[0], success);
	await expect(page.getByRole('button', { name: /^Selecionar percurso/ })).toHaveCount(1);
	await page.getByRole('button', { name: 'Trocar partida e destino' }).click();
	await expect.poll(() => requests.length).toBe(2);
	await page.getByRole('button', { name: /^Destino / }).click();
	await finishRequest(page, requests[1], { data: null, error: 'Current request failed', timestamp: Date.now() });
	await expect(page.getByRole('dialog', { name: 'Escolher destino' })).toBeVisible();
	await page.getByRole('button', { exact: true, name: 'Voltar' }).click();
	await expect(page.getByRole('dialog', { name: 'Opções de percurso' }).getByRole('alert')).toHaveText('Não foi possível calcular a rota.');
});

test('closing the route ignores its pending restoration response', async ({ page }) => {
	const requests = await setupRoute(page);
	await page.getByRole('dialog', { name: 'Opções de percurso' }).getByRole('button', { exact: true, name: 'Fechar' }).click();
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await finishRequest(page, requests[0], { data: { itineraries: [] }, error: null, timestamp: Date.now() });
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(page.getByRole('button', { exact: true, name: 'Pesquisar' })).toBeVisible();
	await expect.poll(async () => await page.evaluate(() => JSON.parse(window.localStorage.getItem('navegante:app-session:v1') ?? '{}').route)).toBeNull();
});
