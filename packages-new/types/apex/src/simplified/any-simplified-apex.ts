/* * */

import { type SimplifiedApexBankingTap } from '@/simplified/simplified-apex-banking-taps.js';
import { type SimplifiedApexInspectionDecision } from '@/simplified/simplified-apex-inspection-decision.js';
import { type SimplifiedApexInspection } from '@/simplified/simplified-apex-inspection.js';
import { type SimplifiedApexLocation } from '@/simplified/simplified-apex-location.js';
import { type SimplifiedApexOnBoardRefund } from '@/simplified/simplified-apex-on-board-refund.js';
import { type SimplifiedApexOnBoardSale } from '@/simplified/simplified-apex-on-board-sale.js';
import { type SimplifiedApexValidation } from '@/simplified/simplified-apex-validation.js';

/* * */

export type AnySimplifiedApex =
  | SimplifiedApexBankingTap
  | SimplifiedApexInspection
  | SimplifiedApexInspectionDecision
  | SimplifiedApexLocation
  | SimplifiedApexOnBoardRefund
  | SimplifiedApexOnBoardSale
  | SimplifiedApexValidation;
