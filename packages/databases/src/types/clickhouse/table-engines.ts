/**
 * Definition for allowed ClickHouse table engines.
 * Please avoid using other engines before consulting with the team
 * as ClickHouse has many engines with different features and limitations.
 */
export type ClickHouseTableEngine<T extends object> = 'MergeTree()' | `ReplacingMergeTree(${Extract<keyof T, string>})`;
