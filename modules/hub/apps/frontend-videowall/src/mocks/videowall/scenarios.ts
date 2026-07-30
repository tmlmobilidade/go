/* * */

import { type PassengerDemandValue } from '@tmlmobilidade/go-types-public-info';

import { type VideowallMockScenario } from './config';

/* * */

interface VideowallScenarioDefinition {
	availability: boolean
	demand: {
		current_qty: number
		last_week_factor: number
		reference_lower_qty: number
		reference_median_qty: number
		reference_upper_qty: number
		trend_factor: number
	}
	service: {
		average_delay_minutes: number
		delayed_ratio: number
		distance_delivery_ratio: number
		failure_ratio: number
	}
}

/* * */

export const VIDEOWALL_SCENARIOS = {
	bad: {
		availability: true,
		demand: {
			current_qty: 111_800,
			last_week_factor: 1.08,
			reference_lower_qty: 123_500,
			reference_median_qty: 130_000,
			reference_upper_qty: 136_500,
			trend_factor: 0.78,
		},
		service: {
			average_delay_minutes: 8.4,
			delayed_ratio: 0.21,
			distance_delivery_ratio: 0.74,
			failure_ratio: 0.12,
		},
	},
	excellent: {
		availability: true,
		demand: {
			current_qty: 142_300,
			last_week_factor: 0.94,
			reference_lower_qty: 123_500,
			reference_median_qty: 130_000,
			reference_upper_qty: 136_500,
			trend_factor: 1.12,
		},
		service: {
			average_delay_minutes: 1.1,
			delayed_ratio: 0.025,
			distance_delivery_ratio: 0.99,
			failure_ratio: 0.008,
		},
	},
	regular: {
		availability: true,
		demand: {
			current_qty: 130_800,
			last_week_factor: 0.99,
			reference_lower_qty: 123_500,
			reference_median_qty: 130_000,
			reference_upper_qty: 136_500,
			trend_factor: 1.01,
		},
		service: {
			average_delay_minutes: 2.4,
			delayed_ratio: 0.07,
			distance_delivery_ratio: 0.94,
			failure_ratio: 0.035,
		},
	},
	unavailable: {
		availability: false,
		demand: {
			current_qty: 0,
			last_week_factor: 1,
			reference_lower_qty: 0,
			reference_median_qty: 0,
			reference_upper_qty: 0,
			trend_factor: 1,
		},
		service: {
			average_delay_minutes: 0,
			delayed_ratio: 0,
			distance_delivery_ratio: 0,
			failure_ratio: 0,
		},
	},
} as const satisfies Record<VideowallMockScenario, VideowallScenarioDefinition>;

/* * */

export function getDemandDeviationStatus(
	currentValue: number,
	lowerValue: number,
	upperValue: number,
): PassengerDemandValue['deviation_status'] {
	if (currentValue < lowerValue) return 'below_typical';
	if (currentValue > upperValue) return 'above_typical';
	return 'typical';
}
