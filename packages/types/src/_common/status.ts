/* * */

import { z } from 'zod';

/* PROCESSING STATUS */
/* * */

export const ProcessingStatusSchema = z.enum(['waiting', 'processing', 'complete', 'error']);
export type ProcessingStatus = z.infer<typeof ProcessingStatusSchema>;

/* DELAY STATUS */
/* * */

export const DelayStatusSchema = z.enum(['delayed', 'early', 'ontime', 'none']);
export type DelayStatus = z.infer<typeof DelayStatusSchema>;

/* SEEN STATUS */
/* * */

export const SeenStatusSchema = z.enum(['gone', 'seen', 'unseen']);
export type SeenStatus = z.infer<typeof SeenStatusSchema>;

/* OPERATIONAL STATUS */
/* * */

export const OperationalStatusSchema = z.enum(['ended', 'missed', 'running', 'scheduled']);
export type OperationalStatus = z.infer<typeof OperationalStatusSchema>;

/* PUBLISH STATUS */
/* * */
export const PublishStatusSchema = z.enum(['PUBLISHED', 'ARCHIVED', 'DRAFT']);
export type PublishStatus = z.infer<typeof PublishStatusSchema>;

/* APPROVAL STATUS */
/* * */

export const ApprovalStatusSchema = z.enum(['pending', 'approved', 'rejected', 'none']);
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;
