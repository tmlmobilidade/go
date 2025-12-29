/* * */

import { type Ride } from '@tmlmobilidade/types';

/* * */

type RideAnalysisLabels = Record<keyof Ride['analysis'], {
	description: string
	title: string
}>;

/* * */

export const rideAnalysisLabels: RideAnalysisLabels = {
	AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP: {
		description: 'AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP.description',
		title: 'AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP.title',
	},
	ENDED_AT_LAST_STOP: {
		description: 'ENDED_AT_LAST_STOP.description',
		title: 'ENDED_AT_LAST_STOP.title',
	},
	EXPECTED_APEX_VALIDATION_INTERVAL: {
		description: 'EXPECTED_APEX_VALIDATION_INTERVAL.description',
		title: 'EXPECTED_APEX_VALIDATION_INTERVAL.title',
	},
	EXPECTED_DRIVER_ID_QTY: {
		description: 'EXPECTED_DRIVER_ID_QTY.description',
		title: 'EXPECTED_DRIVER_ID_QTY.title',
	},
	EXPECTED_START_TIME: {
		description: 'EXPECTED_START_TIME.description',
		title: 'EXPECTED_START_TIME.title',
	},
	EXPECTED_VEHICLE_EVENT_DELAY: {
		description: 'EXPECTED_VEHICLE_EVENT_DELAY.description',
		title: 'EXPECTED_VEHICLE_EVENT_DELAY.title',
	},
	EXPECTED_VEHICLE_EVENT_INTERVAL: {
		description: 'EXPECTED_VEHICLE_EVENT_INTERVAL.description',
		title: 'EXPECTED_VEHICLE_EVENT_INTERVAL.title',
	},
	EXPECTED_VEHICLE_EVENT_QTY: {
		description: 'EXPECTED_VEHICLE_EVENT_QTY.description',
		title: 'EXPECTED_VEHICLE_EVENT_QTY.title',
	},
	EXPECTED_VEHICLE_ID_QTY: {
		description: 'EXPECTED_VEHICLE_ID_QTY.description',
		title: 'EXPECTED_VEHICLE_ID_QTY.title',
	},
	MATCHING_APEX_LOCATIONS: {
		description: 'MATCHING_APEX_LOCATIONS.description',
		title: 'MATCHING_APEX_LOCATIONS.title',
	},
	MATCHING_VEHICLE_IDS: {
		description: 'MATCHING_VEHICLE_IDS.description',
		title: 'MATCHING_VEHICLE_IDS.title',
	},
	SIMPLE_ONE_APEX_VALIDATION: {
		description: 'SIMPLE_ONE_APEX_VALIDATION.description',
		title: 'SIMPLE_ONE_APEX_VALIDATION.title',
	},
	SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION: {
		description: 'SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION.description',
		title: 'SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION.title',
	},
	SIMPLE_THREE_VEHICLE_EVENTS: {
		description: 'SIMPLE_THREE_VEHICLE_EVENTS.description',
		title: 'SIMPLE_THREE_VEHICLE_EVENTS.title',
	},
	TRANSACTION_SEQUENTIALITY: {
		description: 'TRANSACTION_SEQUENTIALITY.description',
		title: 'TRANSACTION_SEQUENTIALITY.title',
	},
};
