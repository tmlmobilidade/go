/**
 * Definition for allowed ClickHouse table engines.
 * Please avoid using other engines before consulting with the team
 * as ClickHouse has many engines with different features and limitations.
 * For example, only `ReplicatedMergeTree` supports automatic replication.
 */
export type ClickHouseTableEngine = 'ReplicatedMergeTree';
