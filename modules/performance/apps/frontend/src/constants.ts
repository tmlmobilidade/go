/* * */

import { IconBuildingFactory, IconBus, IconCheckupList, IconCurrencyEuro, IconLeaf, IconMapPin, IconMessageCircle, IconMoodSmile, IconShieldCheck, IconUsers } from '@tabler/icons-react';

export interface DashboardDefinition {
	description?: string
	key: string
	label: string
	visible?: boolean
}

export interface TopicDefinition {
	dashboards: DashboardDefinition[]
	description?: string
	filters?: string[]
	icon?: React.ComponentType
	key: string
	label: string
	visible?: boolean
}

export const TOPICS = {
	COVERAGE_AVAILABILITY: 'coverage-availability',
	CUSTOMER_SATISFACTION: 'customer-satisfaction',
	DEMAND: 'demand',
	FEEDBACK: 'feedback',
	INSPECTIONS: 'inspections',
	OPERATIONAL_COSTS: 'operational_costs',
	REVENUE: 'revenue',
	SERVICE_COMPLIANCE: 'service_compliance',
	SUPPLY: 'supply',
	SUSTAINABILITY: 'sustainability',
} as const;

export const TOPICS_REGISTRY: TopicDefinition[] = [
	{
		dashboards: [
			{
				key: 'demand-by',
				label: 'Procura por...',
				visible: true,
			},
			{
				key: 'occupancy-rate',
				label: 'Taxa de ocupação', // shows load factor or seat utilization per line/time
			},
			{
				key: 'oversupply-zones', // Linhas pouca procura
				label: 'Excesso de oferta', // identifies lines or time periods with too much capacity vs. low usage
			},
			{
				key: 'undersupply-zones', // Linhas com muita procura
				label: 'Falta de oferta', // shows where demand exceeds supply (crowded services)
			},
			{
				key: 'temporal-alignment',
				label: 'Alinhamento temporal', // compares supply and demand patterns by hour/day
			},
			{
				key: 'supply-demand-ratio',
				label: 'Rácio oferta/procura', // aggregate indicator showing proportionality
			},
			{
				key: 'efficiency-index',
				label: 'Índice de eficiência', // synthetic KPI summarizing alignment quality
			},
		],
		description: 'O tema Alinhamento oferta-procura analisa o equilíbrio entre a capacidade disponibilizada (oferta) e a utilização efetiva do serviço (procura). O objetivo é avaliar se os recursos estão a ser alocados de forma eficiente — identificando situações de excesso de oferta (veículos subutilizados) ou falta de oferta (sobrelotação e procura não satisfeita).',
		icon: IconUsers,
		key: TOPICS.DEMAND,
		label: 'Procura',
		visible: true,
	},
	{
		dashboards: [
			{
				key: 'supply-by',
				label: 'Oferta por...',
			},
		],
		description: 'O tema Oferta analisa o equilíbrio entre a capacidade disponibilizada (oferta) e a utilização efetiva do serviço (procura). O objetivo é avaliar se os recursos estão a ser alocados de forma eficiente — identificando situações de excesso de oferta (veículos subutilizados) ou falta de oferta (sobrelotação e procura não satisfeita).',
		icon: IconBus,
		key: TOPICS.SUPPLY,
		label: 'Oferta',
		visible: true,
	},
	{
		dashboards: [],
		icon: IconMessageCircle,
		key: TOPICS.FEEDBACK,
		label: 'Feedback',
		visible: true,
	},
	{
		dashboards: [
			{
				key: 'delays',
				label: 'Atrasos',
			},
			{
				key: 'advances',
				label: 'Adiantamentos',
			},
			{
				key: 'perturbations',
				label: 'Perturbações',
			},
			{
				key: 'cancellations',
				label: 'Cancelamentos',
			},
		],
		icon: IconCheckupList,
		key: 'service_compliance',
		label: 'Cumprimento de serviço',
	},
	{
		dashboards: [
			{
				key: 'offer_evolution',
				label: 'Evolução da oferta',
			},
			{
				key: 'contract_compliance',
				label: 'Cumprimento do contrato',
			},
			{
				key: 'spatial_coverage',
				label: 'Cobertura espacial',
			},
		],
		icon: IconMapPin,
		key: 'coverage_availability',
		label: 'Cobertura e disponibilidade',
	},
	{
		dashboards: [
			{
				key: 'fare_evasion',
				label: 'Fuga ao pagamento',
			},
			{
				key: 'fraud',
				label: 'Fraude',
			},
		],
		icon: IconShieldCheck,
		key: 'inspections',
		label: 'Fiscalização',
	},
	{
		dashboards: [],
		icon: IconBuildingFactory,
		key: 'operational_costs',
		label: 'Custos operacionais',
	},
	{
		dashboards: [],
		icon: IconLeaf,
		key: 'sustainability',
		label: 'Impacto ambiental',
	},
	{
		dashboards: [],
		icon: IconMoodSmile,
		key: 'customer_satisfaction',
		label: 'Satisfação do cliente',
	},
	{
		dashboards: [],
		icon: IconCurrencyEuro,
		key: 'revenue',
		label: 'Receita',
	},
];

export const AGENCIES = {
	AREA_1: '41',
	AREA_2: '42',
	AREA_3: '43',
	AREA_4: '44',
} as const;

export type AgencyType = typeof AGENCIES[keyof typeof AGENCIES];

export type AgencyTypeWithAll = 'all' | AgencyType;

export type SystemStatusType = 'negative' | 'positive' | 'warning';
