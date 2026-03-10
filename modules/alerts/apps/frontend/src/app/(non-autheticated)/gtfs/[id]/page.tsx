/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button } from '@tmlmobilidade/ui';

/* * */

const GTFS_LIST_ROUTE = `${PAGE_ROUTES.alerts.BASE}/gtfs`;

/* * */

interface GtfsEntity {
	[key: string]: unknown
	alert?: {
		active_period?: Array<{
			end?: number
			start?: number
		}>
		cause?: string
		description_text?: {
			translation?: Array<{
				language?: string
				text?: string
			}>
		}
		effect?: string
		header_text?: {
			translation?: Array<{
				language?: string
				text?: string
			}>
		}
		informed_entity?: Array<{
			route_id?: string
			stop_id?: string
			trip?: {
				route_id?: string
			}
		}>
	}
	id?: number | string
}

interface GtfsFeed {
	entity?: GtfsEntity[]
	header?: Record<string, unknown>
}

interface GtfsApiResponse {
	data?: GtfsFeed | null
}

interface FetchGtfsFeedResult {
	feed: GtfsFeed | null
	status: number
}

/* * */

function GetAlertEntity(feed: GtfsFeed | null | undefined, alertId: string) {
	if (!feed?.entity) return undefined;
	const normalizedAlertId = alertId.trim();
	return feed.entity.find(entity => String(entity.id ?? '').trim() === normalizedAlertId);
}

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

function NormalizeUpperText(value?: string) {
	if (!value) return null;
	return value.replaceAll('_', ' ');
}

const CAUSE_LABELS: Record<string, string> = {
	ABUSIVE_PARKING: 'Estacionamento Abusivo',
	ACCIDENT: 'Acidente',
	CONSTRUCTION: 'Obras',
	DEMONSTRATION: 'Evento / Manifestação',
	DRIVER_ABSENCE: 'Ausência de Motorista',
	DRIVER_ISSUE: 'Problema com Motorista',
	HIGH_PASSENGER_LOAD: 'Elevada Lotação',
	MEDICAL_EMERGENCY: 'Emergência Médica',
	NETWORK_UPDATE: 'Atualização de Rede',
	POLICE_ACTIVITY: 'Atividade Policial',
	PUBLIC_DISORDER: 'Desacatos',
	ROAD_ISSUE: 'Incidente na Via',
	STRIKE: 'Greve',
	TECHNICAL_ISSUE: 'Problema Técnico',
	TRAFFIC_JAM: 'Trânsito',
	VEHICLE_ISSUE: 'Problema com Veículo',
	WEATHER: 'Condições Meteorológicas',
};

const EFFECT_LABELS: Record<string, string> = {
	ACCESSIBILITY_ISSUE: 'Impacto na Acessibilidade',
	ADDITIONAL_SERVICE: 'Serviço Adicional',
	DETOUR: 'Desvio',
	MODIFIED_SERVICE: 'Serviço Modificado',
	NO_SERVICE: 'Cancelamento',
	ON_BOARD_SALE_ISSUE: 'Venda a Bordo Condicionada',
	REALTIME_INFO_ISSUE: 'Impacto na Informação ao Público',
	REDUCED_SERVICE: 'Encurtamento de Percurso',
	SIGNIFICANT_DELAYS: 'Atrasos Significativos',
	STOP_MOVED: 'Paragem Deslocada',
};

function GetEntityRoutes(entity: GtfsEntity | undefined) {
	if (!entity?.alert?.informed_entity?.length) return [];
	const routes = entity.alert.informed_entity
		.map(item => item.route_id ?? item.trip?.route_id)
		.filter(Boolean) as string[];
	return Array.from(new Set(routes));
}

async function FetchGtfsFeed(): Promise<FetchGtfsFeedResult> {
	const response = await fetch(API_ROUTES.alerts.GTFS_CARRIS_METROPOLITANA, {
		next: { revalidate: 30 },
	} as RequestInit);

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

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const { feed: gtfsFeed, status: gtfsFeedStatus } = await FetchGtfsFeed();
	const alertEntity = gtfsFeed ? GetAlertEntity(gtfsFeed, id) : undefined;

	if (!gtfsFeed || !alertEntity) {
		const alertUnavailableMessage = !gtfsFeed
			? `Não foi possível carregar o feed GTFS (HTTP ${gtfsFeedStatus}).`
			: `Alerta ${id} não encontrado no feed GTFS atual. Geralmente isso acontece quando o alerta ainda não está publicado, ainda não iniciou publicação, ou já terminou.`;

		return (
			<main className="flex min-h-screen w-full items-center justify-center bg-white px-4 pb-6 pt-[10px] sm:px-6">
				<div className="space-y-[20px]" style={{ margin: '0 auto', maxWidth: 750, width: '100%' }}>
					<div className="sticky top-[16px] z-10 w-full bg-white py-2 backdrop-blur">
						<Button
							href={GTFS_LIST_ROUTE}
							label="Ir para lista de alertas"
							variant="secondary"
						/>
					</div>

					<section className="rounded-3xl border p-8" style={{ margin: '0 auto', maxWidth: 750, width: '100%' }}>
						<h1 className="text-2xl font-semibold">GTFS do alerta</h1>
						<p className="mt-3 text-base leading-relaxed" style={{ textAlign: 'justify' }}>{alertUnavailableMessage}</p>
					</section>
				</div>
			</main>
		);
	}

	const alertTitle = GetTranslationText(alertEntity.alert?.header_text?.translation) ?? `Alerta ${id}`;
	const alertDescription = GetTranslationText(alertEntity.alert?.description_text?.translation);
	const alertCause = alertEntity.alert?.cause ? (CAUSE_LABELS[alertEntity.alert.cause] ?? NormalizeUpperText(alertEntity.alert.cause)) : null;
	const alertEffect = alertEntity.alert?.effect ? (EFFECT_LABELS[alertEntity.alert.effect] ?? NormalizeUpperText(alertEntity.alert.effect)) : null;
	const alertStartDate = FormatUnixDate(alertEntity.alert?.active_period?.[0]?.start);
	const alertEndDate = FormatUnixDate(alertEntity.alert?.active_period?.[0]?.end);
	const alertRoutes = GetEntityRoutes(alertEntity);
	const alertLocation = alertRoutes.join(', ');

	return (
		<main className="flex min-h-screen w-full items-center justify-center px-4 pb-6 pt-[10px] sm:px-6">
			<div className="space-y-[20px]" style={{ margin: '0 auto', maxWidth: 750, width: '100%' }}>
				<div className="sticky top-[16px] z-10 w-full  py-2 backdrop-blur">
					<Button
						href={GTFS_LIST_ROUTE}
						label="Ir para lista de alertas"
						variant="secondary"
					/>
				</div>

				<section className="overflow-hidden rounded-3xl border" style={{ margin: '0 auto', maxWidth: 750, width: '100%' }}>
					<div className="space-y-4 p-8">
						<h1 className="text-5xl font-semibold leading-tight tracking-tight">{alertTitle}</h1>

						<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-2xl font-semibold">
							{alertCause && <p>{alertCause}</p>}
							{alertEffect && <p>{alertEffect}</p>}
							{alertStartDate && <p className="text-zinc-750">Início: {alertStartDate}</p>}
						</div>
					</div>
				</section>

				<section className="rounded-3xl border  p-8" style={{ margin: '0 auto', maxWidth: 750, width: '100%' }}>
					{alertDescription && <p className="whitespace-pre-line text-4xl font-medium leading-relaxed" style={{ textAlign: 'justify' }}>{alertDescription}</p>}

					<div className="mt-6 space-y-2 text-sm text-zinc-750">
						{alertEndDate && <p><strong>Fim:</strong> {alertEndDate}</p>}
						{!!alertRoutes.length && <p><strong>Linhas:</strong> {alertLocation}</p>}
					</div>
				</section>
			</div>
		</main>
	);
}
