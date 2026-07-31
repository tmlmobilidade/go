/* * */

export const VIDEOWALL_DATA_SOURCES = ['live', 'mock'] as const;
export const VIDEOWALL_MOCK_SCENARIOS = ['excellent', 'regular', 'bad', 'unavailable'] as const;
export const VIDEOWALL_MOCK_STATES = ['ready', 'loading', 'validating', 'error'] as const;

export type VideowallDataSource = typeof VIDEOWALL_DATA_SOURCES[number];
export type VideowallMockScenario = typeof VIDEOWALL_MOCK_SCENARIOS[number];
export type VideowallMockState = typeof VIDEOWALL_MOCK_STATES[number];

export interface VideowallDataConfig {
	data_source: VideowallDataSource
	mock_scenario: VideowallMockScenario
	mock_state: VideowallMockState
}

/* * */

/**
 * Development-only data selection for the videowall.
 *
 * Change `data_source` to `mock`, then select one of the typed scenarios and
 * UI states above. TypeScript and editor autocomplete reject unknown values.
 */
export const VIDEOWALL_DATA_CONFIG: VideowallDataConfig = {
	data_source: 'live',
	mock_scenario: 'regular',
	mock_state: 'ready',
};
