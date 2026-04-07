/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';

/* * */

const GTFS_BASE_ROUTE = `${PAGE_ROUTES.alerts.BASE}/gtfs`;

/* * */

interface GtfsEntity {
	alert?: {
		active_period?: Array<{
			end?: number
			start?: number
		}>
		description_text?: {
			translation?: Array<{
				language?: string
				text?: string
			}>
		}
		header_text?: {
			translation?: Array<{
				language?: string
				text?: string
			}>
		}
	}
	id?: number | string
}

interface GtfsFeed {
	entity?: GtfsEntity[]
}

interface GtfsApiResponse {
	data?: GtfsFeed | null
}

/* * */

function GetTranslationText(translations: Array<{ language?: string, text?: string }> | undefined) {
	if (!translations?.length) return null;
	const portuguese = translations.find(item => item.language === 'pt' && item.text);
	if (portuguese?.text) return portuguese.text;
	return translations.find(item => item.text)?.text ?? null;
}

function FormatUnixDate(unixValue?: number) {
	if (!unixValue) return null;
	const date = new Date(unixValue * 1_000);
	if (Number.isNaN(date.getTime())) return null;
	return new Intl.DateTimeFormat('pt-PT', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(date);
}

async function FetchGtfsFeed() {
	const response = await fetch(API_ROUTES.alerts.GTFS_CARRIS_METROPOLITANA, {
		next: { revalidate: 30 },
	});

	if (!response.ok) {
		return {
			feed: null,
			status: response.status,
		};
	}

	const payload = await response.json() as GtfsApiResponse;

	return {
		feed: payload.data ?? null,
		status: response.status,
	};
}

/* * */

export default async function Page() {
	const { feed: gtfsFeed, status: gtfsFeedStatus } = await FetchGtfsFeed();

	if (!gtfsFeed) {
		return (
			<main className="flex w-full justify-center px-4 pb-6 pt-[10px] sm:px-6">
				<div className="space-y-[20px]" style={{ margin: '0 auto', maxWidth: 750, width: '100%' }}>
					<section className="rounded-3xl border bg-white p-6">
						<h1 className="text-2xl font-semibold">Alertas Públicos</h1>
						<p className="mt-2 text-sm">Não foi possível carregar o feed GTFS (HTTP {gtfsFeedStatus}).</p>
					</section>
				</div>
			</main>
		);
	}

	const entities = gtfsFeed.entity ?? [];
	const groupedEntities = entities.reduce<Record<string, GtfsEntity[]>>((acc, entity) => {
		const startDate = FormatUnixDate(entity.alert?.active_period?.[0]?.start) ?? 'Sem data definida';
		if (!acc[startDate]) acc[startDate] = [];
		acc[startDate].push(entity);
		return acc;
	}, {});

	return (
		<main className="flex w-full justify-center px-4 pb-6 pt-[10px] sm:px-6">
			<div className="space-y-[20px]" style={{ margin: '0 auto', maxWidth: 750, width: '100%' }}>
				<section className="rounded-3xl border bg-white p-6">
					<h1 className="text-3xl font-semibold">Alertas de Serviço</h1>
					<p className="mt-2 max-w-2xl text-sm text-zinc-600">
						Fique a par de todas as alterações à rede e mantenha-se informado sobre alertas ativos no serviço.
					</p>
					<p className="mt-4 text-sm font-medium text-zinc-700">Encontrados {entities.length} alerta(s).</p>
				</section>

				{!entities.length && (
					<section className="rounded-3xl border bg-white p-6">
						<p className="text-sm">Não existem alertas disponíveis neste momento.</p>
					</section>
				)}

				{Object.entries(groupedEntities).map(([startDate, items]) => (
					<section key={startDate} className="overflow-hidden rounded-3xl border bg-white">
						<header className="border-b p-5">
							<h2 className="mt-1 text-2xl font-semibold">A partir de {startDate}</h2>
						</header>

						<ul className="list-none">
							{items.map((entity) => {
								const entityId = String(entity.id ?? '').trim();
								if (!entityId) return null;

								const title = GetTranslationText(entity.alert?.header_text?.translation) ?? `Alerta ${entityId}`;
								const description = GetTranslationText(entity.alert?.description_text?.translation);

								return (
									<li key={entityId} className="border-b last:border-b-0">
										<a className="flex items-center justify-between gap-4 p-5 transition hover:bg-zinc-50" href={`${GTFS_BASE_ROUTE}/${entityId}`}>
											<div className="min-w-0">
												<p className="truncate text-base font-semibold">{title}</p>
												<p className="mt-1 text-xs text-zinc-500">ID: {entityId}</p>
												{description && <p className="mt-2 line-clamp-1 text-sm text-zinc-600">{description}</p>}
											</div>
											<span aria-hidden="true" className="text-zinc-400">›</span>
										</a>
									</li>
								);
							})}
						</ul>
					</section>
				))}
			</div>
		</main>
	);
}
