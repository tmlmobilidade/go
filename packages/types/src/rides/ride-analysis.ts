/* * */

import { z } from 'zod';

/* * */

export const RIDE_ANALYSIS_GRADE_OPTIONS = ['pass', 'fail', 'skip', 'error'] as const;
export const RideAnalysisGradeSchema = z.enum(RIDE_ANALYSIS_GRADE_OPTIONS);
export type RideAnalysisGrade = z.infer<typeof RideAnalysisGradeSchema>;

export const RideAnalysisGradeWithNoneSchema = RideAnalysisGradeSchema.or(z.literal('none'));
export type RideAnalysisGradeWithNone = z.infer<typeof RideAnalysisGradeWithNoneSchema>;

/* * */

/**
 * Schema for ride analysis summary.
 *
 * This schema represents a record where each key is a string and the value is an object
 * containing:
 * - grade: A value from the RideAnalysisGradeSchema, indicating the result of the analysis.
 * - reason: A string providing the reason for the given grade.
 *
 * @example
 * {
 *   TEST_1: { grade: 'failed', reason: 'TEST_REASON' },
 *   TEST_2: { grade: 'failed', reason: 'TEST_REASON' },
 * }
 */
export const RideAnalysisSummarySchema = z.record(
	z.string(), z.object({
		grade: RideAnalysisGradeSchema,
		reason: z.string(),
	}),
);

export type RideAnalysisSummary = z.infer<typeof RideAnalysisSummarySchema>;

/* * */

export const RideAnalysisSchema = z.object({
	error_message: z.string().optional(),
	grade: RideAnalysisGradeSchema,
	reason: z.string(),
});

export type RideAnalysis = z.infer<typeof RideAnalysisSchema>;

/* * */

export const atLeastOneVehicleEventOnFirstStopSchema = RideAnalysisSchema.extend({
	reason: z.enum(['NO_PATH_DATA', 'NO_VEHICLE_EVENTS', 'NO_VEHICLE_EVENTS_ON_FIRST_STOP', 'ONE_OR_MORE_VEHICLE_EVENTS_ON_FIRST_STOP']),
	value: z.number().nullable(),
});

export type AtLeastOneVehicleEventOnFirstStop = z.infer<typeof atLeastOneVehicleEventOnFirstStopSchema>;

/* * */

export const expectedDriverIdQtySchema = RideAnalysisSchema.extend({
	reason: z.enum(['NO_VEHICLE_EVENTS', 'UNEXPECTED_DRIVER_ID_QTY', 'EXPECTED_DRIVER_ID_QTY']),
	value: z.number().nullable(),
});

export type ExpectedDriverIdQty = z.infer<typeof expectedDriverIdQtySchema>;

/* * */

export const expectedVehicleIdQtySchema = RideAnalysisSchema.extend({
	reason: z.enum(['NO_VEHICLE_EVENTS', 'NO_APEX_VALIDATIONS', 'UNEXPECTED_VEHICLE_ID_QTY', 'EXPECTED_VEHICLE_ID_QTY']),
	value: z.number().nullable(),
});

export type ExpectedVehicleIdQty = z.infer<typeof expectedVehicleIdQtySchema>;

/* * */

export const expectedVehicleEventIntervalSchema = RideAnalysisSchema.extend({
	reason: z.enum(['NO_VEHICLE_EVENTS', 'EXPECTED_VEHICLE_EVENT_INTERVAL', 'UNEXPECTED_VEHICLE_EVENT_INTERVAL']),
	value: z.number().nullable(),
});

export type ExpectedVehicleEventInterval = z.infer<typeof expectedVehicleEventIntervalSchema>;

/* * */

export const endedAtLastStopSchema = RideAnalysisSchema.extend({
	reason: z.enum(['NO_PATH_DATA', 'NO_VEHICLE_EVENTS', 'ENDED_AT_LAST_STOP', 'ENDED_OUTSIDE_OF_LAST_STOP']),
});

export type EndedAtLastStop = z.infer<typeof endedAtLastStopSchema>;

/* * */

export const expectedVehicleEventDelaySchema = RideAnalysisSchema.extend({
	reason: z.enum(['NO_VEHICLE_EVENTS', 'UNEXPECTED_VEHICLE_EVENTS_DELAY', 'EXPECTED_VEHICLE_EVENTS_DELAY']),
	value: z.number().nullable(),
});

export type ExpectedVehicleEventDelay = z.infer<typeof expectedVehicleEventDelaySchema>;

/* * */

export const expectedVehicleEventQtySchema = RideAnalysisSchema.extend({
	expected_qty: z.number().nullable(),
	found_qty: z.number().nullable(),
	reason: z.enum(['NO_PATH_DATA', 'NO_VEHICLE_EVENTS', 'EXPECTED_VEHICLE_EVENT_QTY', 'UNEXPECTED_VEHICLE_EVENT_QTY']),
});

export type ExpectedVehicleEventQty = z.infer<typeof expectedVehicleEventQtySchema>;

/* * */

export const matchingApexLocationsSchema = RideAnalysisSchema.extend({
	reason: z.enum(['NO_PATH_DATA', 'NO_APEX_LOCATIONS', 'MISSING_APEX_LOCATION_FOR_AT_LEAST_ONE_STOP', 'MATCHING_APEX_LOCATIONS']),
});

export type MatchingApexLocations = z.infer<typeof matchingApexLocationsSchema>;

/* * */

export const expectedStartTimeSchema = RideAnalysisSchema.extend({
	reason: z.enum(['NO_START_TIME_SCHEDULED', 'NO_VEHICLE_EVENTS', 'UNKNOWN_START', 'EARLY_START', 'LATE_START', 'START_ON_TIME']),
	value: z.number().nullable(),
});

export type ExpectedStartTime = z.infer<typeof expectedStartTimeSchema>;

/* * */

export const simpleOneApexValidationSchema = RideAnalysisSchema.extend({
	reason: z.enum(['NO_APEX_VALIDATIONS', 'ONE_OR_MORE_APEX_VALIDATIONS']),
	value: z.number().nullable(),
});

export type SimpleOneApexValidation = z.infer<typeof simpleOneApexValidationSchema>;

/* * */

export const simpleOneVehicleEventOrApexValidationSchema = RideAnalysisSchema.extend({
	reason: z.enum(['NO_VEHICLE_EVENTS_OR_APEX_VALIDATIONS', 'FOUND_VEHICLE_EVENT_OR_APEX_VALIDATION']),
});

export type SimpleOneVehicleEventOrApexValidation = z.infer<typeof simpleOneVehicleEventOrApexValidationSchema>;

/* * */

export const simpleThreeVehicleEventsSchema = RideAnalysisSchema.extend({
	reason: z.enum(['NO_PATH_DATA', 'NO_VEHICLE_EVENTS', 'MISSING_FIRST_STOPS', 'MISSING_MIDDLE_STOPS', 'MISSING_LAST_STOPS', 'ALL_STOPS_FOUND']),
	stop_ids_first: z.array(z.string()).nullable(),
	stop_ids_last: z.array(z.string()).nullable(),
	stop_ids_middle: z.array(z.string()).nullable(),
});

export type SimpleThreeVehicleEvents = z.infer<typeof simpleThreeVehicleEventsSchema>;

/* * */

export const transactionSequentialitySchema = RideAnalysisSchema.extend({
	expected_qty: z.number().nullable(),
	found_qty: z.number().nullable(),
	missing_qty: z.number().nullable(),
	reason: z.enum(['NO_TRANSACTIONS', 'MISSING_TRANSACTIONS', 'ALL_TRANSACTIONS_RECEIVED']),
});

export type TransactionSequentiality = z.infer<typeof transactionSequentialitySchema>;

/* * */

export const matchingVehicleIdsSchema = RideAnalysisSchema.extend({
	reason: z.enum(['MATCHING_VEHICLE_IDS', 'VEHICLE_ID_MISMATCH', 'NO_VEHICLE_EVENTS', 'NO_APEX_TRANSACTIONS']),
});

export type MatchingVehicleIds = z.infer<typeof matchingVehicleIdsSchema>;

/* * */

export const expectedApexValidationIntervalSchema = RideAnalysisSchema.extend({
	reason: z.enum(['NO_APEX_VALIDATIONS', 'NOT_ENOUGH_VALIDATIONS', 'INTERVALS_TOO_SHORT', 'NON_ORGANIC_INTERVALS', 'EXPECTED_VALIDATION_INTERVALS']),
});

export type ExpectedApexValidationInterval = z.infer<typeof expectedApexValidationIntervalSchema>;
