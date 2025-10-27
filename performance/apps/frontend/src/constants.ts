/* * */

import { IconArrowsLeftRight, IconBuildingFactory, IconCheckupList, IconCurrencyEuro, IconLeaf, IconMapPin, IconMoodSmile, IconShieldCheck } from '@tabler/icons-react';

export interface DashboardDefinition {
	description?: string
	key: string
	label: string
}

export interface TopicDefinition {
	dashboards: DashboardDefinition[]
	filters?: string[]
	icon?: React.ComponentType
	key: string
	label: string
}

export const EXPLORER_TOPICS: TopicDefinition[] = [
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
		dashboards: [],
		icon: IconArrowsLeftRight,
		key: 'supply_demand_alignment',
		label: 'Alinhamento oferta-procura',
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

export const OPERATORS = {
	ALL: 'all',
	AREA_1: '41',
	AREA_2: '42',
	AREA_3: '43',
	AREA_4: '44',
} as const;

export type OperatorType = typeof OPERATORS[keyof typeof OPERATORS];
