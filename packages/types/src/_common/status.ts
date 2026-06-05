/* * */

import { z } from 'zod';

/* * */
/* PROCESSING STATUS */

export const ProcessingStatusValues = ['waiting', 'processing', 'complete', 'error', 'skipped'] as const;
export const ProcessingStatusSchema = z.enum(ProcessingStatusValues);
export type ProcessingStatus = z.infer<typeof ProcessingStatusSchema>;

/* * */
/* DELAY STATUS */

export const DelayStatusValues = ['ontime', 'delayed', 'early', 'none'] as const;
export const DelayStatusSchema = z.enum(DelayStatusValues);
export type DelayStatus = z.infer<typeof DelayStatusSchema>;

/* * */
/* SEEN STATUS */

export const SeenStatusValues = ['unseen', 'seen', 'gone'] as const;
export const SeenStatusSchema = z.enum(SeenStatusValues);
export type SeenStatus = z.infer<typeof SeenStatusSchema>;

/* * */
/* OPERATIONAL STATUS */

export const OperationalStatusValues = ['ended', 'missed', 'running', 'scheduled'] as const;
export const OperationalStatusSchema = z.enum(OperationalStatusValues);
export type OperationalStatus = z.infer<typeof OperationalStatusSchema>;

/* * */
/* PUBLISH STATUS */

export const PublishStatusValues = ['published', 'archived', 'draft'] as const;
export const PublishStatusSchema = z.enum(PublishStatusValues);
export type PublishStatus = z.infer<typeof PublishStatusSchema>;

/* * */
/* APPROVAL STATUS */

export const ApprovalStatusValues = ['pending', 'approved', 'rejected', 'none'] as const;
export const ApprovalStatusSchema = z.enum(ApprovalStatusValues);
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;

/* * */
/* CONDITION STATUS */

const ConditionStatusValues = ['not_applicable', 'unknown', 'missing', 'damaged', 'ok'] as const;
export const ConditionStatusSchema = z.enum(ConditionStatusValues);
export type ConditionStatus = z.infer<typeof ConditionStatusSchema>;

/* * */
/* LIFECYCLE STATUS */

export const LifecycleStatusValues = ['draft', 'active', 'inactive', 'provisional', 'seasonal', 'voided'] as const;
export const LifecycleStatusSchema = z.enum(LifecycleStatusValues);
export type LifecycleStatus = z.infer<typeof LifecycleStatusSchema>;

/* * */
/* AVAILABILITY STATUS */

export const AvailabilityStatusValues = ['available', 'unavailable', 'unknown'] as const;
export const AvailabilityStatusSchema = z.enum(AvailabilityStatusValues);
export type AvailabilityStatus = z.infer<typeof AvailabilityStatusSchema>;

/* * */
/* VALIDITY STATUS */

export const ValidityStatusValues = ['valid', 'invalid', 'unknown'] as const;
export const ValidityStatusSchema = z.enum(ValidityStatusValues);
export type ValidityStatus = z.infer<typeof ValidityStatusSchema>;

/* * */
/* SYSTEM STATUS */

export const SystemStatusValues = ['waiting', 'incomplete', 'complete', 'error'] as const;
export const SystemStatusSchema = z.enum(SystemStatusValues);
export type SystemStatus = z.infer<typeof SystemStatusSchema>;
