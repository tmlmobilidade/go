import { expect, test } from '@playwright/test';

/* * */

test.use({ viewport: { height: 844, width: 390 } });

test('empty search groups lines by operator and reveals more lines on request', async ({ page }) => {
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	const lines = [
		{ _id: 'carris-1', agency_id: 'IA9T6', color: '#f5c900', long_name: 'Carris Central', short_name: '12', text_color: '#000000' },
		...['10', '2', '3', '4', '5', '6'].map((shortName, index) => ({
			_id: `cm-${shortName}`,
			agency_id: index % 2 ? 'BNA17' : 'LA77N',
			color: '#e0001a',
			long_name: `Linha Metropolitana ${shortName}`,
			short_name: shortName,
			text_color: '#ffffff',
		})),
	];
	await page.route('**/v1/**', async (route) => {
		const url = route.request().url();
		const data = url.includes('/network/lines') ? lines : url.endsWith('/v1/alerts') ? [{ _id: 'alert-1', description: 'Exemplo', reference_type: 'agency', references: [], title: 'Aviso de teste' }] : [];
		await route.fulfill({ json: response(data) });
	});
	await page.goto('/hub/navegante-app');
	await page.getByRole('button', { exact: true, name: 'Pesquisar' }).click();
	const search = page.getByRole('dialog', { name: 'Pesquisa' });
	const carris = search.getByRole('region', { name: 'Carris' });
	const metropolitan = search.getByRole('region', { name: 'Carris Metropolitana' });
	await expect(search.locator('section').first()).toContainText('Carris Central');
	await expect(carris.getByRole('button', { name: /Carris Central/ })).toBeVisible();
	await expect(search.getByText('Aviso de teste')).toHaveCount(0);
	await expect(metropolitan.locator('li')).toHaveCount(5);
	await expect(metropolitan.locator('li').first()).toContainText('2');
	await expect(metropolitan.locator('h2 img')).toHaveCount(1);
	await page.screenshot({ path: '/private/tmp/navegante-search-initial-lines.png' });
	await metropolitan.getByRole('button', { name: 'Ver mais linhas de Carris Metropolitana' }).click();
	await expect(metropolitan.locator('li')).toHaveCount(6);
	await search.getByRole('textbox').fill('Central');
	await expect(search.getByRole('region', { name: 'Carris Metropolitana' })).toHaveCount(0);
	await expect(search.getByRole('button', { name: /Carris Central/ })).toBeVisible();
});
