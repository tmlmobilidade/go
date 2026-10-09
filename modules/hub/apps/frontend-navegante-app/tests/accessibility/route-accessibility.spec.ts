import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';

/* * */

test.use({ geolocation: { latitude: 38.79, longitude: -9.1 }, permissions: ['geolocation'], viewport: { height: 844, width: 390 } });

test('nested sorting hides the parent, traps keyboard focus, and restores its trigger', async ({ page }) => {
	await mockRouting(page);
	await openResults(page);
	const results = page.getByRole('dialog', { includeHidden: true, name: 'Opções de percurso' });
	const trigger = results.getByRole('button', { exact: true, includeHidden: true, name: 'Recomendado' });
	await trigger.focus();
	await page.keyboard.press('Enter');
	const filter = page.getByRole('dialog', { exact: true, name: 'Ordenar' });
	await expectFullWidthRows(filter, 4);
	await expect(page.locator('[data-overlay-container]')).toHaveAttribute('aria-hidden', 'true');
	await expect(page.getByRole('dialog')).toHaveCount(1);
	await expect(trigger).toHaveAttribute('aria-expanded', 'true');
	const panelId = await trigger.getAttribute('aria-controls');
	if (!panelId) throw new Error('Sort trigger must identify its filter panel');
	await expect(filter.locator(`[id="${panelId}"]`).getByRole('radiogroup')).toBeVisible();
	await expect(filter.getByRole('radio', { exact: true, name: 'Recomendado' })).toBeChecked();
	await expectFocusInside(filter);
	for (let step = 0; step < 8; step++) {
		await page.keyboard.press('Tab');
		await expectFocusInside(filter);
	}
	await page.keyboard.press('Shift+Tab');
	await expectFocusInside(filter);
	await scanDialog(page, filter);
	await page.keyboard.press('Escape');
	await expect(filter).toBeHidden();
	await expect(trigger).toBeFocused();
	await expect(trigger).toHaveAttribute('aria-expanded', 'false');
	await expect(results).toBeVisible();
	await trigger.press('Enter');
	await filter.getByRole('radio', { exact: true, name: 'Mais rápida' }).focus();
	await page.keyboard.press('Space');
	await expect(filter).toBeHidden();
	await expect(results.getByRole('button', { exact: true, name: 'Mais rápida' })).toBeFocused();
});

test('transport checkboxes filter results and announce when no routes remain', async ({ page }) => {
	await mockRouting(page);
	await openResults(page);
	const results = page.getByRole('dialog', { name: 'Opções de percurso' });
	await results.getByRole('button', { exact: true, name: 'Modos' }).click();
	const filter = page.getByRole('dialog', { exact: true, name: 'Modos' });
	await expectFullWidthRows(filter, 2);
	await page.screenshot({ path: '/private/tmp/navegante-transport-filter.png' });
	const bus = filter.getByRole('checkbox', { exact: true, name: 'Autocarro' });
	const rail = filter.getByRole('checkbox', { exact: true, name: 'Comboio' });
	await expect(bus).toBeChecked();
	await expect(rail).toBeChecked();
	await scanDialog(page, filter);
	await bus.focus();
	await page.keyboard.press('Space');
	await expect(bus).not.toBeChecked();
	await expect(rail).toBeChecked();
	await rail.focus();
	await page.keyboard.press('Space');
	await expect(rail).not.toBeChecked();
	await page.keyboard.press('Escape');
	await expect(results.getByRole('button', { name: /^Selecionar percurso/ })).toHaveCount(0);
	await expect(page.getByRole('status').filter({ hasText: 'Nenhum percurso com estes transportes.' })).toBeAttached();
	await expect(results.getByRole('button', { name: /Modos/ })).toBeFocused();
});

test('time radios and date validation remain labelled and keyboard operable', async ({ page }) => {
	await mockRouting(page);
	await openResults(page);
	await page.getByRole('dialog', { name: 'Opções de percurso' }).getByRole('button', { exact: true, name: 'Agora' }).click();
	const filter = page.getByRole('dialog', { exact: true, name: 'Data e hora' });
	await expectFullWidthRows(filter, 3);
	await page.screenshot({ path: '/private/tmp/navegante-date-filter.png' });
	await expect(filter.getByRole('radio', { exact: true, name: 'Agora' })).toBeChecked();
	await filter.getByRole('radio', { exact: true, name: 'Chegar até' }).focus();
	await page.keyboard.press('Space');
	await expect(filter.getByRole('radio', { exact: true, name: 'Chegar até' })).toBeChecked();
	await expect(filter.getByRole('radio', { exact: true, name: 'Partida às' })).not.toBeChecked();
	const date = filter.getByRole('textbox', { exact: true, name: 'Data e hora' });
	await expect(date).toBeInViewport({ ratio: 1 });
	await date.fill('');
	await expect(date).toHaveAttribute('aria-invalid', 'true');
	const error = filter.getByRole('alert');
	await expect(error).toHaveText('Indica uma data e hora válidas.');
	const errorId = await error.getAttribute('id');
	if (!errorId) throw new Error('Date validation must expose an error ID');
	await expect(date).toHaveAttribute('aria-describedby', errorId);
	await scanDialog(page, filter);
	await date.fill('2026-10-01T14:00');
	await expect(error).toHaveCount(0);
	await expect(date).not.toHaveAttribute('aria-invalid', 'true');
	await filter.getByRole('radio', { exact: true, name: 'Agora' }).focus();
	await page.keyboard.press('Space');
	await expect(filter).toBeHidden();
	await expect(page.getByRole('button', { exact: true, name: 'Agora' })).toBeFocused();
});

test('keyboard focus expands clipped content and preview keeps map controls available', async ({ page }) => {
	await mockRouting(page);
	await openResults(page);
	const results = page.getByRole('dialog', { name: 'Opções de percurso' });
	await results.getByRole('button', { name: 'Recolher painel' }).click();
	const handle = results.getByRole('button', { name: 'Expandir painel' });
	await handle.focus();
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	await expect(results.getByRole('button', { name: 'Recolher painel' })).toHaveAttribute('aria-expanded', 'true');
	const choice = results.getByRole('button', { name: /^Selecionar percurso/ }).first();
	await choice.focus();
	await page.keyboard.press('Enter');
	const preview = page.getByRole('dialog', { name: 'Resumo da rota' });
	await expect(preview).not.toHaveAttribute('aria-modal', 'true');
	await expect(preview.locator('[tabindex="-1"]')).toBeFocused();
	await expect(preview.getByRole('button', { name: 'Expandir painel' })).toHaveAttribute('aria-expanded', 'false');
	await expect(preview.getByRole('button', { name: 'Iniciar viagem com este percurso' })).toBeInViewport();
	await expect(page.getByRole('button', { name: /^Destino / })).toBeVisible();
	await scanDialog(page, preview);
	await preview.getByRole('button', { exact: true, name: 'Voltar' }).click();
	await expect(results).toBeVisible();
});

test('origin and destination searches focus their input and return to route results', async ({ page }) => {
	await mockRouting(page);
	await openResults(page);
	const results = page.getByRole('dialog', { name: 'Opções de percurso' });
	for (const target of ['partida', 'destino']) {
		await results.getByRole('button', { name: 'Recolher painel' }).click();
		await page.getByRole('button', { name: target === 'partida' ? /^Partida / : /^Destino / }).click();
		const search = page.getByRole('dialog', { name: target === 'partida' ? 'Escolher partida' : 'Escolher destino' });
		await expect(page.locator('[data-overlay-container]')).toHaveAttribute('aria-hidden', 'true');
		const input = search.getByRole('textbox');
		await expect(input).toBeFocused();
		await input.fill('Alverca');
		const choice = search.getByRole('button', { name: /Alverca de teste/ });
		await expect(choice).toBeVisible();
		await scanDialog(page, search);
		await choice.focus();
		await page.keyboard.press('Enter');
		await expect(results).toBeVisible();
		await expect(results.locator('[tabindex="-1"]')).toBeFocused();
		await expect(results.getByRole('button', { name: /^Selecionar percurso/ })).toHaveCount(2);
		await results.getByRole('button', { name: 'Expandir painel' }).click();
	}
});

for (const failure of ['error', 'empty'] as const) {
	test(`planning exposes busy state then announces ${failure === 'error' ? 'a failed request' : 'no alternatives'}`, async ({ page }) => {
		const routing = await mockRouting(page);
		await openResults(page);
		await page.getByRole('dialog', { name: 'Opções de percurso' }).getByRole('button', { name: 'Recolher painel' }).click();
		await page.getByRole('button', { name: /^Destino / }).click();
		const search = page.getByRole('dialog', { name: 'Escolher destino' });
		await search.getByRole('textbox').fill('Alverca');
		const gate = routing.holdNextPlan();
		await search.getByRole('button', { name: /Alverca de teste/ }).click();
		const results = page.getByRole('dialog', { name: 'Opções de percurso' });
		await expect(results.locator('[aria-busy="true"]')).toBeVisible();
		await expect(page.getByRole('status').filter({ hasText: 'A calcular...' })).toBeAttached();
		gate.release(failure);
		const error = results.getByRole('alert');
		await expect(error).toHaveText(failure === 'error' ? 'Não foi possível calcular a rota.' : 'Nenhuma alternativa encontrada. Experimente outra data ou localizações mais próximas da rede.');
		await expect(results.locator('[aria-busy="true"]')).toHaveCount(0);
		await expect(results.getByRole('button', { name: /^Selecionar percurso/ })).toHaveCount(0);
		await scanDialog(page, results);
	});
}

/* * */

async function expectFocusInside(dialog: Locator) {
	await expect.poll(async () => await dialog.evaluate(element => element.contains(document.activeElement) ? 'inside' : document.activeElement?.outerHTML)).toBe('inside');
}

async function expectFullWidthRows(dialog: Locator, count: number) {
	const rows = dialog.locator('label');
	await expect(rows).toHaveCount(count);
	await expect.poll(async () => await rows.evaluateAll((elements) => {
		const boxes = elements.map(element => element.getBoundingClientRect());
		return boxes.every((box, index) => box.width > 250 && box.height >= 56 && (index === 0 || box.top >= boxes[index - 1].bottom));
	})).toBe(true);
	await expect(rows.last()).toBeInViewport({ ratio: 1 });
}

async function scanDialog(page: Page, dialog: Locator) {
	const id = await dialog.getAttribute('aria-labelledby');
	expect(id).toBeTruthy();
	const scan = await new AxeBuilder({ page }).include(`[aria-labelledby="${id}"]`).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
	// Contrast remains tracked by VISUAL-02; every other finding blocks these flows.
	const unexpected = scan.violations.filter(violation => violation.id !== 'color-contrast');
	expect(unexpected, JSON.stringify(unexpected.map(violation => ({ id: violation.id, targets: violation.nodes.map(node => node.target) })))).toEqual([]);
}

async function openResults(page: Page) {
	await page.goto('/hub/navegante-app');
	await page.getByRole('button', { exact: true, name: 'Pesquisar' }).click();
	await page.getByRole('textbox').fill('Alverca');
	await page.getByRole('button', { name: /Alverca de teste/ }).click();
	await expect(page.getByRole('button', { name: /^Selecionar percurso/ })).toHaveCount(2);
	await page.getByRole('button', { name: 'Expandir painel' }).click();
	await page.getByRole('button', { name: /^Selecionar percurso/ }).first().click();
	await page.getByRole('button', { name: 'Ver alternativas' }).click();
	await expect(page.getByRole('button', { name: 'Recolher painel' })).toBeVisible();
	await expect(page.getByRole('dialog', { name: 'Opções de percurso' }).locator('[tabindex="-1"]')).toBeFocused();
}

async function mockRouting(page: Page) {
	let pending: null | Promise<'empty' | 'error'> = null;
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	await page.route('**/v1/**', async route => await route.fulfill({ json: response([]) }));
	await page.route('**/v1/motis/geocode?**', async route => await route.fulfill({ json: response([{ lat: 38.9, lon: -9.05, name: 'Alverca de teste', type: 'PLACE' }]) }));
	await page.route('**/v1/motis/plan?**', async (route) => {
		const next = pending;
		pending = null;
		const failure = next === null ? null : await next;
		await route.fulfill({ json: failure === 'error' ? { data: null, error: 'Routing unavailable', timestamp: Date.now() } : response({ itineraries: failure === 'empty' ? [] : [createItinerary('BUS'), createItinerary('RAIL')] }) });
	});
	return {
		holdNextPlan() {
			let release: (failure: 'empty' | 'error') => void = () => undefined;
			pending = new Promise((resolve) => {
				release = resolve;
			});
			return { release };
		},
	};
}

function createItinerary(mode: 'BUS' | 'RAIL') {
	const startTime = '2026-09-28T12:00:00Z';
	const endTime = '2026-09-28T12:45:00Z';
	return {
		duration: 2700,
		endTime,
		legs: [{ duration: 2700, endTime, from: { lat: 38.79, lon: -9.1, name: 'Sacavém' }, legGeometry: { length: 0, points: '', precision: 5 }, mode, realTime: false, routeShortName: mode === 'BUS' ? '2790' : 'R', scheduled: true, scheduledEndTime: endTime, scheduledStartTime: startTime, startTime, to: { lat: 38.9, lon: -9.05, name: 'Alverca' } }],
		startTime,
		transfers: 0,
	};
}
