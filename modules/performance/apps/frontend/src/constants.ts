/* * */

import { IconBuildingFactory, IconBus, IconCheckupList, IconCurrencyEuro, IconLeaf, IconMapPin, IconMoodSmile, IconShieldCheck, IconUsers } from '@tabler/icons-react';

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
	COVERAGE_AVAILABILITY: 'coverageAvailability',
	CUSTOMER_SATISFACTION: 'customerSatisfaction',
	DEMAND: 'demand',
	INSPECTIONS: 'inspections',
	OPERATIONAL_COSTS: 'operationalCosts',
	REVENUE: 'revenue',
	SERVICE_COMPLIANCE: 'serviceCompliance',
	SUPPLY: 'supply',
	SUSTAINABILITY: 'sustainability',
} as const;

export const TOPICS_REGISTRY: TopicDefinition[] = [
	{
		dashboards: [
			{
				key: 'demandBy',
				label: 'Procura por...',
				visible: true,
			},
			{
				key: 'occupancyRate',
				label: 'Taxa de ocupação', // shows load factor or seat utilization per line/time
			},
			{
				key: 'oversupplyZones', // Linhas pouca procura
				label: 'Excesso de oferta', // identifies lines or time periods with too much capacity vs. low usage
			},
			{
				key: 'undersupplyZones', // Linhas com muita procura
				label: 'Falta de oferta', // shows where demand exceeds supply (crowded services)
			},
			{
				key: 'temporalAlignment',
				label: 'Alinhamento temporal', // compares supply and demand patterns by hour/day
			},
			{
				key: 'supplyDemandRatio',
				label: 'Rácio oferta/procura', // aggregate indicator showing proportionality
			},
			{
				key: 'efficiencyIndex',
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
				key: 'supplyBy',
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
		key: 'serviceCompliance',
		label: 'Cumprimento de serviço',
	},
	{
		dashboards: [
			{
				key: 'offerEvolution',
				label: 'Evolução da oferta',
			},
			{
				key: 'contractCompliance',
				label: 'Cumprimento do contrato',
			},
			{
				key: 'spatialCoverage',
				label: 'Cobertura espacial',
			},
		],
		icon: IconMapPin,
		key: 'coverageAvailability',
		label: 'Cobertura e disponibilidade',
	},
	{
		dashboards: [
			{
				key: 'fareEvasion',
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
		key: 'operationalCosts',
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
		key: 'customerSatisfaction',
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
