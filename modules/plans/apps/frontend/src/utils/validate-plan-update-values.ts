/* * */

import { type UpdatePlanDto } from '@tmlmobilidade/go-types';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

export const validatePlanUpdateValues = (values: UpdatePlanDto): UpdatePlanDto => {
	//

	if (!values) {
		throw new Error('No values provided for validation');
	}

	if (!values.gtfs_feed_info) {
		throw new Error('gtfs_feed_info is required in the values');
	}

	if (!values.gtfs_feed_info.feed_start_date || !values.gtfs_feed_info.feed_end_date) {
		throw new Error('Both feed_start_date and feed_end_date are required in gtfs_feed_info');
	}

	//
	// Transform dates to OperationalDate

	const feedStartDate = Dates
		.fromFormat(values.gtfs_feed_info.feed_start_date, 'yyyy-MM-dd', 'Europe/Lisbon')
		.set({ hour: 12 })
		.operational_date;

	const feedEndDate = Dates
		.fromFormat(values.gtfs_feed_info.feed_end_date, 'yyyy-MM-dd', 'Europe/Lisbon')
		.set({ hour: 12 })
		.operational_date;

	//
	// Return prepared values

	return {
		...values,
		gtfs_feed_info: {
			...values.gtfs_feed_info,
			feed_end_date: feedEndDate,
			feed_start_date: feedStartDate,
		},
	};

	//
};
