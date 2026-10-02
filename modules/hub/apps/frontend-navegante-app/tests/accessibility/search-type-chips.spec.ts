import { expect, test } from '@playwright/test';

/* * */

test.use({ viewport: { height: 844, width: 390 } });

test('search chips filter matching entity types and can be cleared', async ({ page }) => {
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	const lines = Array.from({ length: 12 }, (_, index) => ({
		_id: `line-${index}`,
		agency_id: 'IA9T6',
		color: '#f5c900',
		long_name: `Linha Oriente ${index}`,
		short_name: String(index + 1),
		text_color: '#000000',
	}));
	const stops = Array.from({ length: 12 }, (_, index) => ({
		_id: `stop-${index}`,
		agency_ids: [],
		municipality_name: 'Lisboa',
		name: `Paragem Oriente ${index}`,
		short_name: 'Oriente',
	}));
	const alerts = Array.from({ length: 12 }, (_, index) => ({
		_id: `alert-${index}`,
		description: 'Aviso na zona',
		reference_type: 'agency',
		references: [],
		title: `Alerta Oriente ${index}`,
	}));
	const places = Array.from({ length: 10 }, (_, index) => ({ lat: 38.767, lon: -9.099, name: `Local Oriente ${index}`, type: 'PLACE' }));
	await page.route('**/v1/**', async (route) => {
		const url = route.request().url();
		const data = url.includes('/network/lines')
			? lines
			: url.includes('/network/stops')
				? stops
				: url.endsWith('/v1/alerts')
					? alerts
					: url.includes('/motis/geocode')
						? places.slice(0, Number(new URL(url).searchParams.get('numResults')))
						: [];
		await route.fulfill({ json: response(data) });
	});
	await page.goto('/hub/navegante-app');
	await page.getByRole('button', { exact: true, name: 'Pesquisar' }).click();
	const search = page.getByRole('dialog', { name: 'Pesquisa' });
	const filters = search.getByRole('group', { name: 'Filtrar resultados por tipo' });
	await expect(filters).toHaveCount(0);
	await search.getByRole('textbox').fill('Oriente');
	await expect(search.getByRole('region', { name: 'Locais' })).toBeVisible();
	await expect(filters.getByRole('button')).toHaveCount(4);
	for (const category of ['Alertas', 'Linhas', 'Paragens', 'Locais']) {
		await expect(search.getByRole('region', { name: category }).locator('li')).toHaveCount(5);
	}
	await page.screenshot({ path: '/private/tmp/navegante-search-type-chips.png' });
	await filters.getByRole('button', { name: 'Paragens' }).click();
	await expect(filters.getByRole('button', { name: 'Paragens' })).toHaveAttribute('aria-pressed', 'true');
	await expect(search.getByRole('region')).toHaveCount(1);
	await expect(search.getByRole('region', { name: 'Paragens' }).locator('li')).toHaveCount(12);
	await filters.getByRole('button', { name: 'Linhas' }).click();
	await expect(search.getByRole('region', { name: 'Linhas' }).locator('li')).toHaveCount(12);
	await expect(search.getByRole('region')).toHaveCount(1);
	await filters.getByRole('button', { name: 'Alertas' }).click();
	await expect(search.getByRole('region', { name: 'Alertas' }).locator('li')).toHaveCount(12);
	await filters.getByRole('button', { name: 'Locais' }).click();
	await expect(search.getByRole('region', { name: 'Locais' }).locator('li')).toHaveCount(10);
	await filters.getByRole('button', { name: 'Locais' }).click();
	await expect(search.getByRole('region')).toHaveCount(4);
	await filters.getByRole('button', { name: 'Alertas' }).click();
	await search.getByRole('button', { name: 'Limpar pesquisa' }).click();
	await expect(search.getByRole('textbox')).toHaveValue('');
	await expect(filters).toHaveCount(0);
	await expect(search.getByRole('region', { name: 'Carris' })).toBeVisible();
	await search.getByRole('textbox').fill('Oriente');
	await expect(search.getByRole('region')).toHaveCount(4);
});
