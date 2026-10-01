/* * */

import { type ClickhouseField } from './field.js';

/**
 * Definition for allowed ClickHouse table partition by.
 * Please avoid using other partition by before consulting with the team
 * as ClickHouse has many partition by strategies with different features and limitations.
 */
export type ClickHouseTablePartitionBy<T extends object> = `intDiv(${ClickhouseField<T>}, 100)` | string;
