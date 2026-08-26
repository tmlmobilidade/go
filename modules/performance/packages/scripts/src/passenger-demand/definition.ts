/* * */

import { ValidApexValidationStatusValues } from '@tmlmobilidade/go-types-apex';

/* * */

export const PASSENGER_DEMAND_ACCEPTED_VALIDATION_STATUSES = ValidApexValidationStatusValues;
export const PASSENGER_DEMAND_ACCEPTED_VALIDATION_STATUSES_SQL = PASSENGER_DEMAND_ACCEPTED_VALIDATION_STATUSES
	.map(status => `'${status}'`)
	.join(', ');
export const PASSENGER_DEMAND_DEFINITION_VERSION = 'passenger-demand-v2';
export const PASSENGER_DEMAND_TIMEZONE = 'Europe/Lisbon';
export const PASSENGER_DEMAND_UNKNOWN_DIMENSION_ID = '__unknown__';

/* * */
