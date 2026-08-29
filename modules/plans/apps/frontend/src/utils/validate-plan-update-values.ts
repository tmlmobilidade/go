/* * */

import { type UpdatePlanDto } from '@tmlmobilidade/go-types-operation';

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
	// Return prepared values

	return {
		...values,
		gtfs_feed_info: {
			...values.gtfs_feed_info,
			feed_end_date: values.gtfs_feed_info.feed_end_date,
			feed_start_date: values.gtfs_feed_info.feed_start_date,
		},
	};

	//
};
