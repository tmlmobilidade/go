import { expect, test } from '@playwright/test';

/* * */

test.use({ geolocation: { latitude: 38.79, longitude: -9.1 }, permissions: ['geolocation'], viewport: { height: 844, width: 390 } });

test('itinerary connects transport and waiting steps and ends at the destination', async ({ page }) => {
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	await page.route('**/v1/**', async route => await route.fulfill({ json: response([]) }));
	await page.route('**/v1/network/lines', async route => await route.fulfill({ json: response([{
		_id: '2790', agency_id: 'test', color: '#c61d23', district_ids: [], district_names: [], facilities: [], locality_ids: [], locality_names: [], long_name: 'Sacavém - Oriente', municipality_ids: [], municipality_names: [], parish_ids: [], parish_names: [], pattern_ids: [], route_ids: [], short_name: '2790', stop_ids: [], text_color: '#ffffff', tts_name: '2790',
	}]) }));
	await page.route('**/v1/motis/geocode?**', async route => await route.fulfill({
		json: response([{ lat: 38.9, lon: -9.05, name: 'Alverca de teste', type: 'PLACE' }]),
	}));
	await page.route('**/v1/motis/plan?**', async route => await route.fulfill({ json: response({ itineraries: [createItinerary()] }) }));
	await page.goto('/hub/navegante-app');
	await page.getByRole('button', { name: 'Pesquisar', exact: true }).click();
	await page.getByRole('textbox', { name: 'Pesquisar linhas, paragens, alertas e locais' }).fill('Alverca');
	await page.getByRole('button', { name: /Alverca de teste/ }).click();
	const choice = page.getByRole('button', { name: /^Selecionar percurso/ });
	await expect(choice).toHaveAccessibleName(/6 min de espera/);
	await expect(choice.locator('..').locator('[data-realtime="true"] strong')).toHaveCSS('color', 'rgb(0, 110, 255)');
	await expect(choice).not.toHaveAccessibleName(/Previsto às/);
	await expect(page.getByText(/^Previsto às/)).toHaveCount(0);
	await page.getByRole('button', { name: 'Expandir painel' }).click();
	await choice.click();
	const preview = page.getByRole('dialog', { name: 'Resumo da rota' });
	await expect(preview.locator('header').getByText('7 min a pé', { exact: true }).first()).toBeVisible();
	await expect(preview.locator('header').getByText('6 min de espera', { exact: true })).toBeVisible();
	await expect(preview.getByRole('button', { name: 'Iniciar viagem com este percurso' })).toBeInViewport();
	await preview.getByRole('button', { name: 'Expandir painel' }).click();
	await page.addStyleTag({ content: 'nextjs-portal { display: none; }' });
	await page.screenshot({ path: '/private/tmp/navegante-itinerary-top.png' });
	const timeline = preview.locator('ol').first();
	const steps = timeline.locator(':scope > li');
	await expect(steps).toHaveCount(6);
	await expect(steps.nth(1)).toContainText('Esperar 4 min');
	await expect(steps.nth(4)).toContainText('Esperar 2 min');
	await expect(steps.nth(3).getByText('2 min', { exact: true })).toBeVisible();
	const walkingAlignment = await steps.nth(3).evaluate(element => {
		const marker = element.querySelector('[data-start-node]');
		const duration = element.querySelector('[class*="durationChip"]');
		if (!marker || !duration) return null;
		const markerRect = marker.getBoundingClientRect();
		const durationRect = duration.getBoundingClientRect();
		return { durationCenter: durationRect.y + durationRect.height / 2, markerCenter: markerRect.y + markerRect.height / 2 };
	});
	expect(walkingAlignment).toBeTruthy();
	if (walkingAlignment) expect(walkingAlignment.durationCenter).toBeCloseTo(walkingAlignment.markerCenter, 0);
	await expect(steps.nth(3).locator('[data-origin], [data-destination]')).toHaveCount(0);
	await expect(timeline.getByText('Oriente', { exact: true })).toHaveCount(3);
	await expect(timeline.getByText('Sacavém', { exact: true })).toHaveCount(1);
	await expect(timeline.getByText(/^(Origem|Destino|Chegada ao destino)$/)).toHaveCount(0);
	await expect(steps.last()).toContainText('Alverca de teste');
	await expect(steps.last().locator('[data-end-node]').getByRole('img', { name: 'Chegada ao destino' })).toBeVisible();
	const destinationMarker = steps.last().locator('[data-final-destination="true"]');
	await expect(destinationMarker).toHaveCSS('background-color', 'rgb(255, 255, 255)');
	await expect(destinationMarker).toHaveCSS('border-color', 'rgb(0, 0, 0)');
	expect(await destinationMarker.evaluate(element => getComputedStyle(element, '::after').backgroundColor)).toBe('rgb(0, 0, 0)');
	await expect(timeline.getByText('Alverca de teste', { exact: true })).toHaveCount(1);
	await expect(timeline.getByText(/Viajar de|Caminhar até|Parte .* do horário/)).toHaveCount(0);
	const busStep = steps.nth(2);
	const headsign = busStep.getByLabel('Sentido Oriente');
	await expect(headsign).toBeVisible();
	await expect(headsign.locator('svg')).toHaveCount(0);
	await expect(timeline.getByText('0 min', { exact: true })).toHaveCount(0);
	await expect(steps.first().getByText('5 min', { exact: true })).toBeVisible();
	const firstWalkAlignment = await steps.first().evaluate(element => {
		const marker = element.querySelector('[class*="modeMarker"]');
		const duration = element.querySelector('[class*="durationChip"]');
		if (!marker || !duration) return null;
		const markerRect = marker.getBoundingClientRect();
		const durationRect = duration.getBoundingClientRect();
		return { durationCenter: durationRect.y + durationRect.height / 2, markerCenter: markerRect.y + markerRect.height / 2 };
	});
	expect(firstWalkAlignment).toBeTruthy();
	if (firstWalkAlignment) expect(firstWalkAlignment.durationCenter).toBeCloseTo(firstWalkAlignment.markerCenter, 0);
	const layout = await busStep.evaluate(element => {
		const originRow = element.querySelector('[data-origin]');
		const destinationRow = element.querySelector('[data-destination]');
		const originName = originRow?.querySelector('strong');
		const destinationName = destinationRow?.querySelector('strong');
		const originTime = originRow?.lastElementChild;
		const destinationTime = destinationRow?.lastElementChild;
		const stopsToggle = element.querySelector('button');
		const headsign = element.querySelector('[aria-label="Sentido Oriente"]');
		if (!originName || !destinationName || !originTime || !destinationTime || !stopsToggle || !headsign) return null;
		return {
			destinationFontSize: parseFloat(getComputedStyle(destinationName).fontSize),
			destinationName: destinationName.getBoundingClientRect().toJSON(),
			destinationTime: destinationTime.getBoundingClientRect().toJSON(),
			headsign: headsign.getBoundingClientRect().toJSON(),
			originFontSize: parseFloat(getComputedStyle(originName).fontSize),
			originName: originName.getBoundingClientRect().toJSON(),
			originTime: originTime.getBoundingClientRect().toJSON(),
			stopsToggle: stopsToggle.getBoundingClientRect().toJSON(),
		};
	});
	expect(layout).toBeTruthy();
	if (layout) {
		expect(layout.originTime.x).toBeGreaterThan(layout.originName.x + layout.originName.width);
		expect(layout.destinationTime.x).toBeGreaterThan(layout.destinationName.x + layout.destinationName.width);
		expect(layout.originTime.x + layout.originTime.width).toBeCloseTo(layout.destinationTime.x + layout.destinationTime.width, 0);
		expect(layout.stopsToggle.y).toBeGreaterThan(layout.originName.y + layout.originName.height);
		expect(layout.stopsToggle.y + layout.stopsToggle.height).toBeLessThan(layout.destinationName.y);
		expect(layout.headsign.y).toBeGreaterThan(layout.originName.y + layout.originName.height);
		expect(layout.originFontSize).toBe(layout.destinationFontSize);
	}
	await expect(steps.nth(2).getByText('Sacavém', { exact: true })).toHaveCount(1);
	await expect(steps.nth(2).getByRole('button', { name: '1 paragem intermédia' })).toBeVisible();
	await steps.nth(2).getByRole('button', { name: '1 paragem intermédia' }).click();
	await expect(steps.nth(2).getByText('Moscavide', { exact: true })).toBeVisible();
	for (const step of await steps.all()) {
		expect(await step.evaluate(element => getComputedStyle(element, '::before').borderLeftStyle)).toBe('dotted');
	}
	const coloredSegment = busStep.locator(':scope > span[aria-hidden="true"]');
	await expect(coloredSegment).toHaveCSS('background-color', 'rgb(198, 29, 35)');
	await expect(steps.nth(5).locator(':scope > span[aria-hidden="true"]')).toHaveCSS('background-color', 'rgb(107, 114, 128)');
	for (const index of [0, 1, 3, 4]) {
		await expect(steps.nth(index).locator(':scope > span[aria-hidden="true"]')).toHaveCount(0);
	}
	const colorAlignment = await busStep.evaluate(element => {
		const stripe = element.querySelector(':scope > span[aria-hidden="true"]');
		const nextMarker = element.querySelector('[data-end-node]');
		if (!stripe || !nextMarker) return null;
		const rect = stripe.getBoundingClientRect();
		const nextMarkerRect = nextMarker.getBoundingClientRect();
		const dotted = getComputedStyle(element, '::before');
		return { colorCenter: rect.x + rect.width / 2, dottedCenter: element.getBoundingClientRect().x + parseFloat(dotted.left) + parseFloat(dotted.borderLeftWidth) / 2, lineEnd: rect.bottom, nextNodeCenter: nextMarkerRect.y + nextMarkerRect.height / 2 };
	});
	expect(colorAlignment).toBeTruthy();
	if (colorAlignment) {
		expect(colorAlignment.colorCenter).toBeCloseTo(colorAlignment.dottedCenter, 0);
		expect(colorAlignment.lineEnd).toBeCloseTo(colorAlignment.nextNodeCenter, 0);
	}
	expect(await timeline.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
	await page.setViewportSize({ height: 844, width: 320 });
	expect(await timeline.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
	await page.setViewportSize({ height: 844, width: 390 });
	await steps.last().scrollIntoViewIfNeeded();
	await page.screenshot({ path: '/private/tmp/navegante-itinerary-bottom.png' });
});

/* * */

function createItinerary() {
	const startTime = '2026-09-29T09:00:00Z';
	const endTime = '2026-09-29T09:33:00Z';
	return {
		duration: 33 * 60,
		endTime,
		id: 'itinerary-details',
		legs: [
			createLeg('WALK', '09:00', '09:05', 'START', 'Sacavém'),
			{
				...createLeg('BUS', '09:09', '09:19', 'Sacavém', 'Oriente'),
				duration: 0,
				headsign: 'Oriente',
				intermediateStops: [{ arrival: '2026-09-29T09:14:00Z', lat: 38.8, lon: -9.1, name: 'Moscavide' }],
				realTime: true,
				routeShortName: '2790',
				scheduledEndTime: '2026-09-29T09:18:00Z',
				scheduledStartTime: '2026-09-29T09:08:00Z',
			},
			createLeg('WALK', '09:22', '09:24', 'Oriente', 'Oriente'),
			{ ...createLeg('RAIL', '09:26', '09:33', 'Oriente', 'END'), headsign: 'Alverca', realTime: true, routeShortName: 'Linha de Azambuja', scheduledEndTime: '2026-09-29T09:38:00Z' },
		],
		startTime,
		transfers: 1,
	};
}

function createLeg(mode: string, start: string, end: string, from: string, to: string) {
	const startTime = `2026-09-29T${start}:00Z`;
	const endTime = `2026-09-29T${end}:00Z`;
	return {
		duration: (Date.parse(endTime) - Date.parse(startTime)) / 1_000,
		endTime,
		from: { lat: 38.79, lon: -9.1, name: from },
		legGeometry: { length: 0, points: '', precision: 5 },
		mode,
		realTime: false,
		scheduled: true,
		scheduledEndTime: endTime,
		scheduledStartTime: startTime,
		startTime,
		to: { lat: 38.9, lon: -9.05, name: to },
	};
}
