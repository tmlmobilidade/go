/* * */

import { type SimplifiedApexBankingTap } from '@/apex/simplified/simplified-apex-banking-taps.js';
import { type SimplifiedApexInspectionDecision } from '@/apex/simplified/simplified-apex-inspection-decision.js';
import { type SimplifiedApexInspection } from '@/apex/simplified/simplified-apex-inspection.js';
import { type SimplifiedApexLocation } from '@/apex/simplified/simplified-apex-location.js';
import { type SimplifiedApexOnBoardRefund } from '@/apex/simplified/simplified-apex-on-board-refund.js';
import { type SimplifiedApexOnBoardSale } from '@/apex/simplified/simplified-apex-on-board-sale.js';
import { type SimplifiedApexValidation } from '@/apex/simplified/simplified-apex-validation.js';

/* * */

export type AnySimplifiedApex =
  | SimplifiedApexBankingTap
  | SimplifiedApexInspection
  | SimplifiedApexInspectionDecision
  | SimplifiedApexLocation
  | SimplifiedApexOnBoardRefund
  | SimplifiedApexOnBoardSale
  | SimplifiedApexValidation;
