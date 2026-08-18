/* * */

import { type OperatorSelectGroup } from './types';

/* * */

/**
 * Temporary hardcoded operator hierarchies until the backend exposes them.
 * Members are matched against agency short_name / code / public_name / id.
 */
export const DEFAULT_OPERATOR_SELECT_GROUPS: readonly OperatorSelectGroup[] = [
	{
		id: 'carris-metropolitana',
		label: 'Carris Metropolitana',
		short_names: ['VA', 'RL', 'ALSA', 'TST'],
	},
	{
		codes: ['UT1', 'UT2', 'UT3', 'UT4', 'UT5', 'UT6'],
		id: 'unir',
		label: 'Unir',
	},
	{
		id: 'transportes-alto-alentejo',
		label: 'Transportes Alto Alentejo',
		public_names: ['Transportes Alto Alentejo'],
	},
];
