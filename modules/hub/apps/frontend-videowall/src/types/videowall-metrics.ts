/* * */

import { type ApiResponse } from '@tmlmobilidade/go-types-shared';

/* * */

/**
 * The agencies for which the videowall metrics endpoints publish values.
 */
export type VideowallMetricsAgency = '41' | '42' | '43' | '44' | 'cm';

/**
 * A videowall metrics API response. Besides the standard API response fields,
 * the metrics endpoints also carry the timestamp of the underlying resource.
 */
export type VideowallMetricsResponse<T> = ApiResponse<T> & {
	timestamp_resource?: number
};

/* * */

export type VideowallDelaysMetrics = Record<'_cm_average_delay_minutes' | `_${VideowallMetricsAgency}_delayed_for_more_than_five_minutes_count`, number>;

export type VideowallSlaMetrics = Record<`_${VideowallMetricsAgency}_scheduled_rides_total` | `_${VideowallMetricsAgency}_scheduled_rides_until_now` | `_${VideowallMetricsAgency}_simple_three_events_or_simple_one_validation_transaction_fail_until_now`, number>;

export type VideowallValidationsMetrics = Record<`_${VideowallMetricsAgency}_last_week_valid_count` | `_${VideowallMetricsAgency}_today_valid_count`, number>;

export type VideowallVkmMetrics = Record<`_${VideowallMetricsAgency}_scheduled_vkm_until_now` | `_${VideowallMetricsAgency}_simple_three_events_or_simple_one_validation_transaction_vkm_until_now`, number>;
