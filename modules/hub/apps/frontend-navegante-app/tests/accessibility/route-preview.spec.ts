import { expect, test } from '@playwright/test';

/* * */

test.use({ geolocation: { latitude: 38.79, longitude: -9.1 }, permissions: ['geolocation'], viewport: { height: 844, width: 390 } });

test('selected itinerary stays actionable in compact preview and returns to its alternatives', async ({ page }) => {
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	await page.route('**/v1/**', async route => await route.fulfill({ json: response([]) }));
	await page.route('**/v1/network/lines', async route => await route.fulfill({ json: response([{
		_id: 'line-2791',
		agency_id: 'test-agency',
		color: '#0055AA',
		long_name: 'Linha de teste',
		pattern_ids: [],
		route_ids: [],
		short_name: '2791',
		stop_ids: [],
		text_color: '#FFFFFF',
	}]) }));
	await page.route('**/v1/motis/geocode?**', async route => await route.fulfill({
		json: response([{ lat: 38.9, lon: -9.05, name: 'Alverca de teste', type: 'PLACE' }]),
	}));
	await page.route('**/v1/motis/plan?**', async route => await route.fulfill({
		json: response({ itineraries: Array.from({ length: 12 }, (_, index) => createItinerary(index)) }),
	}));
	await page.goto('/hub/navegante-app');
	await page.getByRole('button', { exact: true, name: 'Pesquisar' }).click();
	await page.getByRole('textbox', { name: 'Pesquisar linhas, paragens, alertas e locais' }).fill('Alverca');
	await page.getByRole('button', { name: /Alverca de teste/ }).click();
	const choices = page.getByRole('button', { name: /^Selecionar percurso/ });
	await expect(choices).toHaveCount(12);
	await expect(choices.first().locator('..').locator('[data-realtime="false"] strong')).toHaveCSS('color', 'rgb(90, 90, 100)');
	await expect(page.getByRole('button', { name: 'Iniciar viagem com este percurso' })).toHaveCount(0);
	await page.getByRole('button', { name: 'Expandir painel' }).click();
	await choices.nth(1).click();
	const preview = page.getByRole('dialog', { name: 'Resumo da rota' });
	await expect(preview.locator('header').getByText('(44 min)', { exact: true })).toBeVisible();
	await expect(preview.locator('header [data-agency-id="test-agency"]')).toHaveText('2791');
	await expect(preview.locator('header [data-agency-id="test-agency"]')).toBeInViewport();
	const go = preview.getByRole('button', { name: 'Iniciar viagem com este percurso' });
	await expect(go).toBeInViewport();
	await expect(go).toBeEnabled();
	await expect(preview.getByRole('button', { name: 'Ver alternativas' })).toBeInViewport();
	await expect(preview.getByRole('button', { name: 'Expandir painel' })).toHaveAttribute('aria-expanded', 'false');
	await page.screenshot({ path: '/private/tmp/navegante-route-preview.png' });
	await preview.getByRole('button', { name: 'Ver alternativas' }).click();
	await expect(page.getByRole('dialog', { name: 'Opções de percurso' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Iniciar viagem com este percurso' })).toHaveCount(0);
	await expect(choices.nth(1)).toHaveAttribute('aria-pressed', 'true');
	await page.getByRole('button', { exact: true, name: 'Melhor' }).click();
	const sortSheet = page.getByRole('dialog', { name: 'Ordenar' });
	const sortRows = sortSheet.locator('label');
	await expect(sortRows).toHaveCount(4);
	await expect.poll(async () => await sortRows.evaluateAll((rows) => {
		const boxes = rows.map(row => row.getBoundingClientRect());
		return boxes.every((box, index) => box.width > 250 && box.height >= 56 && (index === 0 || box.top >= boxes[index - 1].bottom));
	})).toBe(true);
	await expect(sortRows.last()).toBeInViewport({ ratio: 1 });
	await page.screenshot({ path: '/private/tmp/navegante-sort-sheet.png' });
	await page.getByRole('radio', { exact: true, name: 'Rápida' }).focus();
	await page.keyboard.press('Space');
	await choices.nth(11).scrollIntoViewIfNeeded();
	const resultsScroller = page.getByRole('dialog', { name: 'Opções de percurso' }).locator('.react-modal-sheet-content-scroller');
	const previousScrollTop = await resultsScroller.evaluate(element => element.scrollTop);
	expect(previousScrollTop).toBeGreaterThan(0);
	await choices.nth(11).click();
	await preview.getByRole('button', { name: 'Ver alternativas' }).click();
	await expect(page.getByRole('button', { exact: true, name: 'Rápida' })).toBeVisible();
	await expect.poll(async () => await resultsScroller.evaluate(element => element.scrollTop)).toBeCloseTo(previousScrollTop, 0);
	await expect(choices.nth(11)).toHaveAttribute('aria-pressed', 'true');
	await choices.nth(11).click();
	await go.click();
	await expect(preview).toBeHidden();
	await expect(page.getByRole('button', { name: 'Ver alternativas' })).toBeHidden();
	await expect(page.getByRole('main').getByRole('button', { name: 'Terminar' })).toBeVisible();
	await page.getByRole('main').getByRole('button', { name: 'Terminar' }).click();
	await expect(choices.nth(11)).toHaveAttribute('aria-pressed', 'true');
	await page.getByRole('dialog', { name: 'Opções de percurso' }).getByRole('button', { name: 'Recolher painel' }).click();
	await page.getByRole('button', { exact: true, name: 'Destino Alverca de teste' }).click();
	await page.getByRole('textbox').fill('Alverca');
	await page.getByRole('dialog').getByRole('button', { name: /Alverca de teste/ }).click();
	await expect(choices).toHaveCount(12);
	await expect(page.getByRole('dialog', { name: 'Opções de percurso' }).getByRole('button', { name: 'Expandir painel' })).toHaveAttribute('aria-expanded', 'false');
	await page.getByRole('button', { name: 'Trocar partida e destino' }).click();
	await expect(page.getByRole('button', { exact: true, name: 'Partida Alverca de teste' })).toBeVisible();
	await choices.first().click();
	await expect(preview).toBeVisible();
	await expect(go).toHaveCount(0);
	await expect(preview.locator('[aria-current="step"]')).toHaveCount(0);
	await preview.getByRole('button', { name: 'Ver alternativas' }).click();
	await page.getByRole('dialog', { name: 'Opções de percurso' }).getByRole('button', { name: 'Recolher painel' }).click();
	await page.getByRole('button', { name: 'Trocar partida e destino' }).click();
	await expect(page.getByRole('button', { exact: true, name: 'Partida A sua localização' })).toBeVisible();
	await choices.first().click();
	await expect(go).toBeEnabled();
	await preview.getByRole('button', { name: 'Ver alternativas' }).click();
	await page.getByRole('dialog', { name: 'Opções de percurso' }).getByRole('button', { exact: true, name: 'Fechar' }).click();
	await page.getByRole('dialog', { exact: true, name: 'Pesquisa' }).getByRole('button', { exact: true, name: 'Fechar' }).click();
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(page.getByRole('button', { name: /^Partida / })).toHaveCount(0);
	await expect(page.getByRole('button', { name: /^Destino / })).toHaveCount(0);
	await page.getByRole('button', { exact: true, name: 'Pesquisar' }).click();
	await expect(page.getByRole('textbox', { name: 'Pesquisar linhas, paragens, alertas e locais' })).toHaveValue('');
});

/* * */

function createItinerary(index: number) {
	const duration = (45 - index) * 60;
	const startTime = '2026-09-28T12:00:00Z';
	const endTime = new Date(new Date(startTime).getTime() + duration * 1_000).toISOString();
	return {
		duration,
		endTime,
		id: `preview-${index}`,
		legs: [{
			duration,
			endTime,
			from: { lat: 38.79, lon: -9.1, name: 'Sacavém' },
			legGeometry: { length: 0, points: '', precision: 5 },
			mode: 'BUS',
			realTime: false,
			routeShortName: `${2790 + index}`,
			scheduled: true,
			scheduledEndTime: endTime,
			scheduledStartTime: startTime,
			startTime,
			to: { lat: 38.9, lon: -9.05, name: 'Alverca' },
		}],
		startTime,
		transfers: 0,
	};
}
