import { expect, test } from '@playwright/test';

/* * */

test.use({ geolocation: { latitude: 38.79, longitude: -9.1 }, permissions: ['geolocation'], viewport: { height: 844, width: 390 } });

test('current location can be selected again for either route field and restored', async ({ page }) => {
	await page.context().grantPermissions(['geolocation']);
	await page.context().setGeolocation({ latitude: 38.79, longitude: -9.1 });
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	await page.route('**/v1/**', async route => await route.fulfill({ json: response([]) }));
	await page.route('**/v1/motis/plan?**', async route => await route.fulfill({ json: response({ itineraries: [{ duration: 600, endTime: '2026-10-01T11:10:00Z', id: 'current-location-route', legs: [], startTime: '2026-10-01T11:00:00Z', transfers: 0 }] }) }));
	await page.addInitScript(() => {
		if (window.sessionStorage.getItem('route-current-location-seeded')) return;
		window.sessionStorage.setItem('route-current-location-seeded', 'true');
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
	await expect(page.getByRole('dialog', { name: 'Opções de percurso' })).toBeVisible();

	await page.getByRole('button', { name: 'Destino Oeiras' }).click();
	const destinationPicker = page.getByRole('dialog', { name: 'Escolher destino' });
	await destinationPicker.getByRole('button', { name: 'A sua localização' }).click();
	await expect(page.getByRole('button', { name: 'Destino A sua localização' })).toBeVisible({ timeout: 15_000 });
	await expect.poll(async () => await page.evaluate(() => JSON.parse(window.localStorage.getItem('navegante:app-session:v1') ?? '{}').route)).toMatchObject({ destination: null, destinationUsesCurrentLocation: true });

	await page.reload();
	await expect(page.getByRole('button', { name: 'Destino A sua localização' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Partida Montijo' })).toBeVisible();

	await page.getByRole('button', { name: 'Partida Montijo' }).click();
	const originPicker = page.getByRole('dialog', { name: 'Escolher partida' });
	await originPicker.getByRole('button', { name: 'A sua localização' }).click();
	await expect(page.getByRole('button', { name: 'Partida A sua localização' })).toBeVisible({ timeout: 15_000 });
	await expect.poll(async () => await page.evaluate(() => JSON.parse(window.localStorage.getItem('navegante:app-session:v1') ?? '{}').route)).toMatchObject({ origin: null, originUsesCurrentLocation: true });
});
