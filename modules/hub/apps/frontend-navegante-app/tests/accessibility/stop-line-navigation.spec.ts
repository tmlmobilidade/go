import { expect, test } from '@playwright/test';

/* * */

test.use({ viewport: { height: 844, width: 390 } });

test('a line chip in stop details opens the line and returns to the stop', async ({ page }) => {
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	await page.route('**/v1/**', async route => await route.fulfill({ json: response([]) }));
	await page.route('**/v1/network/lines', async route => await route.fulfill({ json: response([{
		_id: 'line-test',
		agency_id: 'test-agency',
		color: '#c61d23',
		long_name: 'Linha de teste',
		pattern_ids: [],
		route_ids: [],
		short_name: '2790',
		stop_ids: ['stop-test'],
		text_color: '#ffffff',
	}]) }));
	await page.route('**/v1/network/stops', async route => await route.fulfill({ json: response([{
		_id: 'stop-test',
		agency_ids: ['test-agency'],
		latitude: 38.7,
		line_ids: ['line-test'],
		longitude: -9.1,
		name: 'Avenida de Moscavide 30',
		pattern_ids: [],
	}]) }));
	await page.addInitScript(() => window.localStorage.setItem('navegante:app-session:v1', JSON.stringify({
		isMapFiltersOpen: false,
		route: null,
		savedAt: Date.now(),
		sheets: [{ entityId: 'stop-test', view: 'stops-detail' }],
		snapIndex: 2,
		version: 1,
	})));
	await page.goto('/hub/navegante-app');
	const stopSheet = page.getByRole('dialog', { name: 'Detalhes da paragem' });
	await expect(stopSheet.getByRole('button', { name: 'Direções' })).toBeVisible();
	await page.screenshot({ path: '/private/tmp/navegante-stop-header.png' });
	await stopSheet.getByRole('button', { name: 'Abrir detalhes da linha 2790' }).click();
	const lineSheet = page.getByRole('dialog', { name: 'Detalhes da linha' });
	await expect(lineSheet).toBeVisible();
	await lineSheet.getByRole('button', { name: 'Fechar' }).click();
	await expect(stopSheet).toBeVisible();
});
