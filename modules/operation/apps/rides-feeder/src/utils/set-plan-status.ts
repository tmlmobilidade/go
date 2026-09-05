/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ProcessingStatus } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

export async function setPlanStatus(planId: string, status: ProcessingStatus, hash?: string) {
	await goDb.operation.plans.updateById(planId, {
		'apps.rides_feeder.last_hash': hash ?? null,
		'apps.rides_feeder.status': status,
		'apps.rides_feeder.timestamp': Dates.now('utc').unix_milliseconds,
	});
};
