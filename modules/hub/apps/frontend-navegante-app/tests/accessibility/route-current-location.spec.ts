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

test('plans from the latest watched position without a second geolocation request', async ({ page }) => {
	const requestedOrigins: string[] = [];
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	await page.route('**/v1/**', async route => await route.fulfill({ json: response([]) }));
	await page.route('**/v1/motis/plan?**', async (route) => {
		requestedOrigins.push(new URL(route.request().url()).searchParams.get('fromPlace') ?? '');
		await route.fulfill({ json: response({ itineraries: [] }) });
	});
	await page.addInitScript(() => {
		Object.defineProperty(navigator, 'geolocation', {
			configurable: true,
			value: {
				clearWatch: () => {},
				getCurrentPosition: () => {
					window.sessionStorage.setItem('one-shot-called', 'true');
				},
				watchPosition: (success: PositionCallback) => {
					const watchCount = Number(window.sessionStorage.getItem('watch-count') ?? '0') + 1;
					window.sessionStorage.setItem('watch-count', String(watchCount));
					const position = {
						coords: { accuracy: 20, latitude: watchCount === 1 ? 38.79 : 38.8, longitude: watchCount === 1 ? -9.1 : -9.11 },
						timestamp: Date.now() - 60_000,
					} as GeolocationPosition;
					setTimeout(() => success(position), 0);
					return watchCount;
				},
			},
		});
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
	await expect(page.locator('.maplibregl-marker span[class*="dot"]')).toBeVisible();
	await page.getByRole('button', { name: 'Partida Montijo' }).click();
	await page.getByRole('dialog', { name: 'Escolher partida' }).getByRole('button', { name: 'A sua localização' }).click();
	await expect.poll(() => requestedOrigins.at(-1)).toBe('38.79,-9.1');
	await expect(page.getByRole('button', { name: 'Partida A sua localização' })).toBeVisible();
	await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
	await expect.poll(async () => await page.evaluate(() => Number(window.sessionStorage.getItem('watch-count')))).toBeGreaterThan(1);
	await page.getByRole('button', { name: 'Partida A sua localização' }).click();
	await page.getByRole('dialog', { name: 'Escolher partida' }).getByRole('button', { name: 'A sua localização' }).click();
	await expect.poll(() => requestedOrigins.at(-1)).toBe('38.8,-9.11');
	await expect.poll(async () => await page.evaluate(() => window.sessionStorage.getItem('one-shot-called'))).toBeNull();
	await expect(page.getByRole('button', { name: 'Localização desativada' })).toHaveCount(0);
});
