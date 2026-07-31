/* * */

import { type Dates } from '@tmlmobilidade/dates';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type VideowallServiceValue } from '@tmlmobilidade/go-types-public-info';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

const ELIGIBILITY_GRACE_MS = 300_000;
const RIDE_END_GRACE_MS = 120_000;

interface VideowallRideAnalysis {
	EXPECTED_START_TIME: {
		reason: null | string
		value: null | number
	}
	SIMPLE_ONE_APEX_VALIDATION: {
		grade: string
	}
	SIMPLE_THREE_VEHICLE_EVENTS: {
		grade: string
	}
}

export interface VideowallRide {
	agency_id: string
	analysis: null | VideowallRideAnalysis
	extension_scheduled: number
	seen_first_at: null | number
	seen_last_at: null | number
	start_time_observed: null | number
	start_time_scheduled: number
	system_status: string
}

interface VideowallServiceAgencyFacts {
	delays: {
		delayed_for_more_than_five_minutes_rides_qty: number
		start_delay_minutes_sum: number
		start_delay_sample_qty: number
	}
	sla: VideowallServiceValue['sla']
	vkm: {
		scheduled_distance_m: number
		simple_one_apex_validation_distance_m: number
		simple_three_vehicle_events_distance_m: number
		simple_three_vehicle_events_or_apex_validation_distance_m: number
	}
}

export interface VideowallServiceResult {
	agencies: Record<string, VideowallServiceValue>
	definition_version: 'videowall-service-legacy-v1'
	eligible_scheduled_cutoff: number
	generated_at: number
	operational_date: number
	reference_cutoff: number
}

interface VideowallServiceTimeBoundaries {
	eligibleScheduledCutoff: number
	referenceCutoff: number
}

/* * */

export function calculateVideowallRide(
	ride: VideowallRide,
	boundaries: VideowallServiceTimeBoundaries,
): VideowallServiceAgencyFacts {
	const isComplete = ride.system_status === 'complete';
	const isScheduledEligible = isComplete && ride.analysis !== null && ride.start_time_scheduled <= boundaries.eligibleScheduledCutoff;
	const hasNoEvidence = isScheduledEligible && !ride.seen_first_at;
	const hasEndedEvidence = isScheduledEligible && Boolean(ride.seen_first_at) && ride.seen_last_at !== null && ride.seen_last_at <= boundaries.referenceCutoff - RIDE_END_GRACE_MS;
	const simpleOnePassed = ride.analysis?.SIMPLE_ONE_APEX_VALIDATION.grade === 'pass';
	const simpleThreePassed = ride.analysis?.SIMPLE_THREE_VEHICLE_EVENTS.grade === 'pass';
	const expectedStartTime = isComplete && ride.start_time_observed
		? ride.analysis?.EXPECTED_START_TIME
		: undefined;
	const hasDelaySample = expectedStartTime?.value !== null && expectedStartTime?.value !== undefined && expectedStartTime.value >= 0;
	const scheduledDistanceM = isScheduledEligible ? Math.max(0, ride.extension_scheduled) : 0;

	return {
		delays: {
			delayed_for_more_than_five_minutes_rides_qty:
				expectedStartTime?.reason === 'LATE_START' ? 1 : 0,
			start_delay_minutes_sum: hasDelaySample ? expectedStartTime.value : 0,
			start_delay_sample_qty: hasDelaySample ? 1 : 0,
		},
		sla: {
			scheduled_rides_total_qty: 1,
			scheduled_rides_until_cutoff_qty: isScheduledEligible ? 1 : 0,
			simple_one_apex_validation_fail_rides_qty:
				hasNoEvidence || (hasEndedEvidence && !simpleOnePassed) ? 1 : 0,
			simple_three_vehicle_events_fail_rides_qty:
				hasNoEvidence || (hasEndedEvidence && !simpleThreePassed) ? 1 : 0,
			simple_three_vehicle_events_or_apex_validation_fail_rides_qty:
				hasNoEvidence || (hasEndedEvidence && !simpleOnePassed && !simpleThreePassed) ? 1 : 0,
		},
		vkm: {
			scheduled_distance_m: scheduledDistanceM,
			simple_one_apex_validation_distance_m:
				hasEndedEvidence && simpleOnePassed ? scheduledDistanceM : 0,
			simple_three_vehicle_events_distance_m:
				hasEndedEvidence && simpleThreePassed ? scheduledDistanceM : 0,
			simple_three_vehicle_events_or_apex_validation_distance_m:
				hasEndedEvidence && (simpleOnePassed || simpleThreePassed) ? scheduledDistanceM : 0,
		},
	};
}

function createEmptyServiceFacts(): VideowallServiceAgencyFacts {
	return {
		delays: {
			delayed_for_more_than_five_minutes_rides_qty: 0,
			start_delay_minutes_sum: 0,
			start_delay_sample_qty: 0,
		},
		sla: {
			scheduled_rides_total_qty: 0,
			scheduled_rides_until_cutoff_qty: 0,
			simple_one_apex_validation_fail_rides_qty: 0,
			simple_three_vehicle_events_fail_rides_qty: 0,
			simple_three_vehicle_events_or_apex_validation_fail_rides_qty: 0,
		},
		vkm: {
			scheduled_distance_m: 0,
			simple_one_apex_validation_distance_m: 0,
			simple_three_vehicle_events_distance_m: 0,
			simple_three_vehicle_events_or_apex_validation_distance_m: 0,
		},
	};
}

function addServiceFacts(total: VideowallServiceAgencyFacts, current: VideowallServiceAgencyFacts) {
	total.delays.delayed_for_more_than_five_minutes_rides_qty += current.delays.delayed_for_more_than_five_minutes_rides_qty;
	total.delays.start_delay_minutes_sum += current.delays.start_delay_minutes_sum;
	total.delays.start_delay_sample_qty += current.delays.start_delay_sample_qty;
	total.sla.scheduled_rides_total_qty += current.sla.scheduled_rides_total_qty;
	total.sla.scheduled_rides_until_cutoff_qty += current.sla.scheduled_rides_until_cutoff_qty;
	total.sla.simple_one_apex_validation_fail_rides_qty += current.sla.simple_one_apex_validation_fail_rides_qty;
	total.sla.simple_three_vehicle_events_fail_rides_qty += current.sla.simple_three_vehicle_events_fail_rides_qty;
	total.sla.simple_three_vehicle_events_or_apex_validation_fail_rides_qty += current.sla.simple_three_vehicle_events_or_apex_validation_fail_rides_qty;
	total.vkm.scheduled_distance_m += current.vkm.scheduled_distance_m;
	total.vkm.simple_one_apex_validation_distance_m += current.vkm.simple_one_apex_validation_distance_m;
	total.vkm.simple_three_vehicle_events_distance_m += current.vkm.simple_three_vehicle_events_distance_m;
	total.vkm.simple_three_vehicle_events_or_apex_validation_distance_m += current.vkm.simple_three_vehicle_events_or_apex_validation_distance_m;
}

function toVideowallServiceValue(facts: VideowallServiceAgencyFacts): VideowallServiceValue {
	return {
		delays: {
			average_start_delay_minutes: facts.delays.start_delay_sample_qty === 0
				? null
				: facts.delays.start_delay_minutes_sum / facts.delays.start_delay_sample_qty,
			delayed_for_more_than_five_minutes_rides_qty:
				facts.delays.delayed_for_more_than_five_minutes_rides_qty,
			start_delay_sample_qty: facts.delays.start_delay_sample_qty,
		},
		sla: facts.sla,
		vkm: {
			scheduled_distance_km: facts.vkm.scheduled_distance_m / 1_000,
			simple_one_apex_validation_distance_km:
				facts.vkm.simple_one_apex_validation_distance_m / 1_000,
			simple_three_vehicle_events_distance_km:
				facts.vkm.simple_three_vehicle_events_distance_m / 1_000,
			simple_three_vehicle_events_or_apex_validation_distance_km:
				facts.vkm.simple_three_vehicle_events_or_apex_validation_distance_m / 1_000,
		},
	};
}

/* * */

export async function calculateVideowallService(referenceNow: Dates): Promise<VideowallServiceResult> {
	//

	Logger.title('Calculating Videowall Service...');
	const timer = new Timer();
	const referenceCutoff = referenceNow.unix_timestamp;
	const eligibleScheduledCutoff = referenceCutoff - ELIGIBILITY_GRACE_MS;
	const agencies: Record<string, VideowallServiceAgencyFacts> = {};
	const ridesCollection = await goDb.operation.rides.getCollection();
	const ridesStream = ridesCollection
		.find({ operational_date: referenceNow.operational_date })
		.stream();

	for await (const document of ridesStream) {
		const ride = document as VideowallRide;
		const facts = agencies[ride.agency_id] ??= createEmptyServiceFacts();

		addServiceFacts(
			facts,
			calculateVideowallRide(
				ride,
				{ eligibleScheduledCutoff, referenceCutoff },
			),
		);
	}

	Logger.success(`Finished calculating Videowall Service (${timer.get()})`);

	return {
		agencies: Object.fromEntries(
			Object.entries(agencies)
				.sort(([left], [right]) => left.localeCompare(right))
				.map(([agencyId, facts]) => [agencyId, toVideowallServiceValue(facts)]),
		),
		definition_version: 'videowall-service-legacy-v1',
		eligible_scheduled_cutoff: eligibleScheduledCutoff,
		generated_at: referenceCutoff,
		operational_date: referenceNow.operational_date_int,
		reference_cutoff: referenceCutoff,
	};

	//
}
