import { expect, test } from '@playwright/test';

/* * */

test('reopens the active search sheet after a webview reload', async ({ page }) => {
	await page.goto('/hub/navegante-app');
	await page.getByRole('button', { name: 'Pesquisar' }).click();
	await expect(page.getByRole('dialog', { name: 'Pesquisa' })).toBeVisible();

	await expect.poll(async () => page.evaluate(() => JSON.parse(window.localStorage.getItem('navegante:app-session:v1') ?? '{}').sheets?.at(-1)?.view)).toBe('search');
	await page.reload();
	await expect(page.getByRole('dialog', { name: 'Pesquisa' })).toBeVisible();

	await page.getByRole('dialog', { name: 'Pesquisa' }).getByRole('button', { name: 'Fechar' }).click();
	await expect.poll(async () => page.evaluate(() => JSON.parse(window.localStorage.getItem('navegante:app-session:v1') ?? '{}').sheets?.length)).toBe(0);
	await page.reload();
	await expect(page.getByRole('dialog', { name: 'Pesquisa' })).toBeHidden();
});

test('reopens the map filters sheet after a webview reload', async ({ page }) => {
	await page.goto('/hub/navegante-app');
	await page.getByRole('button', { name: 'Camadas do mapa' }).click();
	await expect(page.getByRole('dialog', { name: 'Filtros do mapa' })).toBeVisible();
	await page.reload();
	await expect(page.getByRole('dialog', { name: 'Filtros do mapa' })).toBeVisible();
});

for (const detail of [
	{ entityId: 'stop-test', name: 'Detalhes da paragem', view: 'stops-detail' },
	{ entityId: 'line-test', name: 'Detalhes da linha', view: 'lines-detail' },
]) {
	test(`${detail.view} opens at the middle snap`, async ({ page }) => {
		await page.route('**/v1/**', async route => await route.fulfill({ json: { data: [], error: null, timestamp: Date.now() } }));
		await page.addInitScript(({ entityId, view }) => window.localStorage.setItem('navegante:app-session:v1', JSON.stringify({
			isMapFiltersOpen: false,
			route: null,
			savedAt: Date.now(),
			sheets: [{ entityId, view }],
			snapIndex: null,
			version: 1,
		})), { entityId: detail.entityId, view: detail.view });
		await page.goto('/hub/navegante-app');
		const sheet = page.getByRole('dialog', { name: detail.name });
		const viewportHeight = page.viewportSize()?.height ?? 0;
		await expect(sheet).toBeVisible();
		await expect.poll(async () => await page.evaluate(() => JSON.parse(window.localStorage.getItem('navegante:app-session:v1') ?? '{}').snapIndex)).toBe(2);
		await expect.poll(async () => (await sheet.boundingBox())?.y ?? Infinity).toBeLessThan(viewportHeight * 0.5);
	});
}

test('resets a stop detail date saved on a previous day', async ({ page }) => {
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	await page.route('**/v1/**', async route => await route.fulfill({ json: response([]) }));
	await page.route('**/v1/network/stops', async route => await route.fulfill({ json: response([{
		_id: 'stop-test',
		agency_ids: [],
		latitude: 38.7,
		line_ids: [],
		longitude: -9.1,
		name: 'Paragem de teste',
		pattern_ids: [],
	}]) }));
	await page.addInitScript(() => {
		if (window.sessionStorage.getItem('old-operational-date-seeded')) return;
		window.sessionStorage.setItem('old-operational-date-seeded', 'true');
		window.sessionStorage.setItem('operational-date-int', '20251001');
		window.sessionStorage.setItem('operational-date-selected-on', '20251001');
		window.localStorage.setItem('navegante:app-session:v1', JSON.stringify({
			isMapFiltersOpen: false,
			route: null,
			savedAt: Date.now(),
			sheets: [{ entityId: 'stop-test', view: 'stops-detail' }],
			snapIndex: 2,
			version: 1,
		}));
	});
	await page.goto('/hub/navegante-app');
	await expect(page.getByRole('dialog', { name: 'Detalhes da paragem' })).toBeVisible();
	const today = await page.evaluate(() => {
		const date = new Date();
		return date.getFullYear() * 10_000 + (date.getMonth() + 1) * 100 + date.getDate();
	});
	await expect.poll(async () => await page.evaluate(() => Number(window.sessionStorage.getItem('operational-date-int')))).toBe(today);
	await expect(page.getByRole('radio', { name: 'Hoje' })).toBeChecked();
	await page.getByRole('dialog', { name: 'Detalhes da paragem' }).getByText('Amanhã', { exact: true }).click();
	await expect(page.getByRole('radio', { name: 'Amanhã' })).toBeChecked();
	await page.reload();
	await expect(page.getByRole('radio', { name: 'Amanhã' })).toBeChecked();
});

test('migrates map and tracking preferences from session storage', async ({ page }) => {
	await page.addInitScript(() => {
		window.sessionStorage.setItem('user-location-tracking-mode', JSON.stringify('idle'));
		window.sessionStorage.setItem('active-viewport-map-sources', JSON.stringify(['alerts']));
		window.sessionStorage.setItem('excluded-viewport-map-operators', JSON.stringify(['CM']));
	});
	await page.goto('/hub/navegante-app');

	await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('user-location-tracking-mode'))).toBe('"idle"');
	await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('active-viewport-map-sources'))).toBe('["alerts"]');
	await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('excluded-viewport-map-operators'))).toBe('["CM"]');
});

test('saves a manually moved map camera across reloads', async ({ page }) => {
	await page.addInitScript(() => window.localStorage.setItem('user-location-tracking-mode', JSON.stringify('idle')));
	await page.goto('/hub/navegante-app');
	const canvas = page.locator('canvas.maplibregl-canvas');
	await expect(canvas).toBeVisible();
	const bounds = await canvas.boundingBox();
	if (!bounds) throw new Error('Map canvas has no bounds');
	const startX = bounds.x + bounds.width / 2;
	const startY = bounds.y + bounds.height / 2;
	await page.mouse.move(startX, startY);
	await page.mouse.down();
	await page.mouse.move(startX + 80, startY + 50, { steps: 8 });
	await page.mouse.up();

	const readCamera = async () => page.evaluate(() => JSON.parse(window.localStorage.getItem('navegante:map-camera:v1') ?? '{}').camera);
	await expect.poll(readCamera).toMatchObject({ bearing: 0, zoom: 9 });
	const savedCamera = await readCamera();
	await page.reload();
	await expect(canvas).toBeVisible();
	await expect.poll(readCamera).toEqual(savedCamera);
});

test('restores a route sheet and requests fresh itineraries', async ({ page }) => {
	let planRequests = 0;
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	await page.route('**/v1/**', async route => await route.fulfill({ json: response([]) }));
	await page.route('**/v1/motis/plan?**', async (route) => {
		planRequests += 1;
		await route.fulfill({ json: response({ itineraries: [{ duration: 600, endTime: '2026-10-01T11:10:00Z', id: 'restored-route', legs: [], startTime: '2026-10-01T11:00:00Z', transfers: 0 }] }) });
	});
	await page.addInitScript(() => {
		window.localStorage.setItem('user-location-tracking-mode', JSON.stringify('idle'));
		window.localStorage.setItem('navegante:app-session:v1', JSON.stringify({
			route: {
				destination: { detail: 'Destination', label: 'Destination', lat: 38.8, lon: -9.1, type: 'PLACE' },
				locationSearchTarget: 'destination',
				origin: { detail: 'Origin', label: 'Origin', lat: 38.7, lon: -9.2, type: 'PLACE' },
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
	await expect.poll(() => planRequests).toBe(1);
});

test('clears itinerary state when returning to a stop detail', async ({ page }) => {
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	await page.route('**/v1/**', async route => await route.fulfill({ json: response([]) }));
	await page.route('**/v1/motis/plan?**', async route => await route.fulfill({ json: response({ itineraries: [{
		duration: 600,
		endTime: '2026-10-01T11:10:00Z',
		id: 'stop-route',
		legs: [{
			duration: 600,
			endTime: '2026-10-01T11:10:00Z',
			from: { lat: 38.7, lon: -9.2, name: 'Montijo' },
			legGeometry: { length: 0, points: '', precision: 5 },
			mode: 'BUS',
			realTime: false,
			routeShortName: '2790',
			scheduled: true,
			scheduledEndTime: '2026-10-01T11:10:00Z',
			scheduledStartTime: '2026-10-01T11:00:00Z',
			startTime: '2026-10-01T11:00:00Z',
			to: { lat: 38.8, lon: -9.1, name: 'Sacavém (Estação)' },
		}],
		startTime: '2026-10-01T11:00:00Z',
		transfers: 0,
	}] }) }));
	await page.addInitScript(() => window.localStorage.setItem('navegante:app-session:v1', JSON.stringify({
		isMapFiltersOpen: false,
		route: {
			destination: { detail: '', label: 'Sacavém (Estação)', lat: 38.8, lon: -9.1, type: 'STOP' },
			locationSearchTarget: 'destination',
			origin: { detail: '', label: 'Montijo', lat: 38.7, lon: -9.2, type: 'PLACE' },
			originUsesCurrentLocation: false,
			selectedItineraryIndex: 0,
			travelTime: { date: new Date().toISOString(), mode: 'now' },
			viewMode: 'itinerary-detail',
		},
		savedAt: Date.now(),
		sheets: [{ entityId: 'stop-test', view: 'stops-detail' }, { view: 'routes' }],
		snapIndex: 1,
		version: 1,
	})));
	await page.goto('/hub/navegante-app');
	const preview = page.getByRole('dialog', { name: 'Resumo da rota' });
	await expect(preview.getByRole('button', { name: 'Ver alternativas' })).toBeVisible();
	await preview.getByRole('button', { name: 'Ver alternativas' }).click();
	await page.getByRole('dialog', { name: 'Opções de percurso' }).getByRole('button', { exact: true, name: 'Fechar' }).click();
	await expect(page.getByRole('dialog', { name: 'Detalhes da paragem' })).toBeVisible();
	await expect(page.getByRole('button', { name: /^Partida / })).toHaveCount(0);
	await expect(page.getByRole('button', { name: /^Destino / })).toHaveCount(0);
	await expect.poll(async () => await page.evaluate(() => JSON.parse(window.localStorage.getItem('navegante:app-session:v1') ?? '{}').route)).toBeNull();
});

test('uses a fresh device position for a restored current-location route', async ({ page }) => {
	await page.context().grantPermissions(['geolocation']);
	await page.context().setGeolocation({ latitude: 38.79, longitude: -9.1 });
	let requestedOrigin: null | string = null;
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	await page.route('**/v1/**', async route => await route.fulfill({ json: response([]) }));
	await page.route('**/v1/motis/plan?**', async (route) => {
		requestedOrigin = new URL(route.request().url()).searchParams.get('fromPlace');
		await route.fulfill({ json: response({ itineraries: [] }) });
	});
	await page.addInitScript(() => window.localStorage.setItem('navegante:app-session:v1', JSON.stringify({
		isMapFiltersOpen: false,
		route: {
			destination: { detail: 'Destination', label: 'Destination', lat: 38.8, lon: -9.2, type: 'PLACE' },
			locationSearchTarget: 'destination',
			origin: null,
			originUsesCurrentLocation: true,
			selectedItineraryIndex: 0,
			travelTime: { date: new Date().toISOString(), mode: 'now' },
			viewMode: 'results',
		},
		savedAt: Date.now(),
		sheets: [{ view: 'routes' }],
		snapIndex: 1,
		version: 1,
	})));
	await page.goto('/hub/navegante-app');
	await expect.poll(() => requestedOrigin).toBe('38.79,-9.1');
});

test('restores a line shape after reload without a missing vehicle-layer error', async ({ page }) => {
	const layerErrors: string[] = [];
	page.on('pageerror', error => layerErrors.push(error.message));
	page.on('console', (message) => {
		if (message.type() === 'error' && message.text().includes('Cannot add layer')) layerErrors.push(message.text());
	});
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	await page.route('**/v1/**', async route => await route.fulfill({ json: response([]) }));
	await page.route('**/v1/network/lines', async route => await route.fulfill({ json: response([{
		_id: 'line-test',
		agency_id: 'test-agency',
		color: '#0055AA',
		long_name: 'Circular de teste',
		pattern_ids: ['pattern-test'],
		route_ids: [],
		short_name: '999',
		stop_ids: [],
		text_color: '#FFFFFF',
	}]) }));
	await page.route('**/v1/network/patterns/pattern-test', async route => await route.fulfill({ json: response([{
		_id: 'pattern-test',
		agency_id: 'test-agency',
		color: '#0055AA',
		direction_id: 0,
		headsign: 'Circular de teste',
		line_id: 'line-test',
		path: [],
		route_id: 'route-test',
		shape_extension: 0,
		shape_id: 'shape-test',
		shape_polyline: '_}`yhA~lljP_ibE~hbE',
		short_name: '999',
		text_color: '#FFFFFF',
		trips: [],
		tts_headsign: 'Circular de teste',
		valid_on: [20991231],
		version_id: 'version-test',
	}]) }));
	await page.addInitScript(() => window.localStorage.setItem('navegante:app-session:v1', JSON.stringify({
		isMapFiltersOpen: false,
		route: null,
		savedAt: Date.now(),
		sheets: [{ entityId: 'line-test', view: 'lines-detail' }],
		snapIndex: 1,
		version: 1,
	})));
	await page.goto('/hub/navegante-app');
	await expect(page.getByRole('dialog', { name: 'Detalhes da linha' })).toBeVisible();
	await expect(page.locator('canvas.maplibregl-canvas')).toBeVisible();
	await expect.poll(() => layerErrors).toEqual([]);
	await page.reload();
	await expect(page.getByRole('dialog', { name: 'Detalhes da linha' })).toBeVisible();
	await expect.poll(() => layerErrors).toEqual([]);
});

test('restores a selected itinerary preview with its details', async ({ page }) => {
	await page.context().grantPermissions(['geolocation']);
	await page.context().setGeolocation({ latitude: 38.79, longitude: -9.1 });
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	await page.route('**/v1/**', async route => await route.fulfill({ json: response([]) }));
	await page.route('**/v1/motis/geocode?**', async route => await route.fulfill({ json: response([{ lat: 38.9, lon: -9.05, name: 'Oeiras de teste', type: 'PLACE' }]) }));
	await page.route('**/v1/motis/plan?**', async route => await route.fulfill({ json: response({ itineraries: [0, 1].map(index => ({
		duration: (45 - index) * 60,
		endTime: `2026-10-01T12:${index === 0 ? '45' : '44'}:00Z`,
		id: `preview-${index}`,
		legs: [{
			duration: (45 - index) * 60,
			endTime: `2026-10-01T12:${index === 0 ? '45' : '44'}:00Z`,
			from: { lat: 38.79, lon: -9.1, name: 'Sacavém' },
			legGeometry: { length: 0, points: '', precision: 5 },
			mode: 'BUS',
			realTime: false,
			routeShortName: `${2790 + index}`,
			scheduled: true,
			scheduledEndTime: `2026-10-01T12:${index === 0 ? '45' : '44'}:00Z`,
			scheduledStartTime: '2026-10-01T12:00:00Z',
			startTime: '2026-10-01T12:00:00Z',
			to: { lat: 38.9, lon: -9.05, name: 'Oeiras' },
		}],
		startTime: '2026-10-01T12:00:00Z',
		transfers: 0,
	})) }) }));
	await page.goto('/hub/navegante-app');
	await page.getByRole('button', { exact: true, name: 'Pesquisar' }).click();
	await page.getByRole('textbox', { name: 'Pesquisar linhas, paragens, alertas e locais' }).fill('Oeiras');
	await page.getByRole('button', { name: /Oeiras de teste/ }).click();
	await page.getByRole('button', { name: /^Selecionar percurso/ }).nth(1).click();
	const preview = page.getByRole('dialog', { name: 'Resumo da rota' });
	await expect(preview.getByText('(44 min)')).toBeVisible();
	await preview.getByRole('button', { name: 'Expandir painel' }).click();
	await expect(preview.getByRole('button', { name: 'Recolher painel' })).toBeVisible();
	await expect.poll(async () => (await preview.boundingBox())?.y ?? Infinity).toBeLessThan(100);
	await expect.poll(async () => await page.evaluate(() => JSON.parse(window.localStorage.getItem('navegante:app-session:v1') ?? '{}').snapIndex)).toBe(3);
	await page.reload();
	await expect(preview.getByText('(44 min)')).toBeVisible();
	await expect(preview.getByRole('button', { name: 'Recolher painel' })).toBeVisible();
	await expect.poll(async () => (await preview.boundingBox())?.y ?? Infinity).toBeLessThan(100);
	await page.evaluate(() => {
		const key = 'navegante:app-session:v1';
		const saved = JSON.parse(window.localStorage.getItem(key) ?? '{}');
		saved.route.origin = { detail: '', label: 'Sacavém (Estação)', lat: 38.79, lon: -9.1, type: 'PLACE' };
		saved.route.originUsesCurrentLocation = false;
		window.localStorage.setItem(key, JSON.stringify(saved));
	});
	await page.reload();
	await expect(preview.getByText('(44 min)')).toBeVisible();
	await expect(preview.getByRole('button', { name: 'Recolher painel' })).toBeVisible();
	await expect.poll(async () => (await preview.boundingBox())?.y ?? Infinity).toBeLessThan(100);
	await page.evaluate(() => {
		const key = 'navegante:app-session:v1';
		const saved = JSON.parse(window.localStorage.getItem(key) ?? '{}');
		saved.snapIndex = 2;
		window.localStorage.setItem(key, JSON.stringify(saved));
	});
	await page.reload();
	await expect(preview.getByText('(44 min)')).toBeVisible();
	await expect.poll(async () => (await preview.boundingBox())?.y ?? Infinity).toBeGreaterThan(200);
	await expect.poll(async () => (await preview.boundingBox())?.y ?? Infinity).toBeLessThan(400);
});

test('resumes an active trip after reload and restores its sheets when ended', async ({ page }) => {
	await page.context().grantPermissions(['geolocation']);
	await page.context().setGeolocation({ latitude: 38.79, longitude: -9.1 });
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	let planRequests = 0;
	await page.route('**/v1/**', async route => await route.fulfill({ json: response([]) }));
	await page.route('**/v1/motis/geocode?**', async route => await route.fulfill({ json: response([{ lat: 38.9, lon: -9.05, name: 'Oeiras de teste', type: 'PLACE' }]) }));
	await page.route('**/v1/motis/plan?**', async (route) => {
		planRequests += 1;
		await route.fulfill({ json: response({ itineraries: [{
			duration: 2_640,
			endTime: '2026-10-01T12:44:00Z',
			id: 'active-trip-test',
			legs: [{
				duration: 2_640,
				endTime: '2026-10-01T12:44:00Z',
				from: { lat: 38.79, lon: -9.1, name: 'Sacavém' },
				legGeometry: { length: 0, points: '', precision: 5 },
				mode: 'BUS',
				realTime: false,
				routeShortName: '2790',
				scheduled: true,
				scheduledEndTime: '2026-10-01T12:44:00Z',
				scheduledStartTime: '2026-10-01T12:00:00Z',
				startTime: '2026-10-01T12:00:00Z',
				to: { lat: 38.9, lon: -9.05, name: 'Oeiras' },
			}],
			startTime: '2026-10-01T12:00:00Z',
			transfers: 0,
		}] }) });
	});
	await page.goto('/hub/navegante-app');
	await page.getByRole('button', { exact: true, name: 'Pesquisar' }).click();
	await page.getByRole('textbox', { name: 'Pesquisar linhas, paragens, alertas e locais' }).fill('Oeiras');
	await page.getByRole('button', { name: /Oeiras de teste/ }).click();
	await page.getByRole('button', { name: /^Selecionar percurso/ }).click();
	await page.getByRole('dialog', { name: 'Resumo da rota' }).getByRole('button', { name: 'Iniciar viagem com este percurso' }).click();
	const endTrip = page.getByRole('main').getByRole('button', { name: 'Terminar' });
	await expect(endTrip).toBeVisible();
	await expect.poll(async () => await page.evaluate(() => JSON.parse(window.localStorage.getItem('navegante:app-session:v1') ?? '{}').activeTrip?.itinerary?.id)).toBe('active-trip-test');
	await page.reload();
	await expect(endTrip).toBeVisible();
	await expect(page.getByRole('dialog', { name: 'Resumo da rota' })).toBeHidden();
	expect(planRequests).toBe(1);
	await page.getByRole('main').getByRole('button', { name: /2790/ }).click();
	const tripDetail = page.getByRole('dialog', { name: 'Resumo da rota' });
	await expect(tripDetail.getByRole('button', { name: 'Terminar' })).toBeVisible();
	await page.reload();
	await expect(tripDetail.getByRole('button', { name: 'Terminar' })).toBeVisible();
	await tripDetail.getByRole('button', { exact: true, name: 'Fechar' }).click();
	await expect(endTrip).toBeVisible();
	await endTrip.click();
	await expect(page.getByRole('dialog', { name: 'Opções de percurso' })).toBeVisible();
	await expect.poll(async () => await page.evaluate(() => JSON.parse(window.localStorage.getItem('navegante:app-session:v1') ?? '{}').activeTrip)).toBeNull();
});
