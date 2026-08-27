/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/logger';

import { type RideWithAnalyses } from './types/ride-with-analyses.js';

/* * */

export async function alertJustification(ride: RideWithAnalyses, acceptance: RideAcceptance) {
	try {
		//

		//
		// Find a recent alert that references this ride or its line.
		const foundAlert = await goDb.operation.alerts.findOne({
			created_at: { $gte: Dates.now('Europe/Lisbon').minus({ days: 2 }).unix_timestamp },
			reference_type: { $in: ['rides', 'lines'] },
			references: { $elemMatch: { parent_id: { $in: [ride._id, ride.route_short_name] } } },
		});

		if (!foundAlert) return;

		//
		// Justify the acceptance with the alert.
		const { _id, ...fields } = acceptance;
		const now = Dates.now('utc').unix_timestamp;

		await goDb.operation.rideAcceptances.updateById(_id, {
			...fields,
			acceptance_status: 'under_review',
			justification: {
				created_at: now,
				created_by: foundAlert.created_by,
				justification_cause: foundAlert.cause,
				justification_source: 'alert',
				pto_message: foundAlert.description,
				updated_at: now,
				updated_by: foundAlert.created_by,
			},
			updated_by: 'system',
		});

		Logger.info({ message: `Justified ride ${ride._id} with alert ${foundAlert._id}.` });
	} catch (error) {
		Logger.error({ error, message: 'An error occurred. Halting execution.' });
	}
}
