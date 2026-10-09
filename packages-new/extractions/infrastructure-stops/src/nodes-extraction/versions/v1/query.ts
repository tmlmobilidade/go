/* * */

import { type InfrastructureNodesV1QueryRow } from './types.js';

/* * */

/** The stop fields required by the v1 nodes extraction. */
export const infrastructureNodesV1ExtractionQuery = {
	projection: {
		_id: 1,
		created_at: 1,
		flags: 1,
		latitude: 1,
		location: 1,
		longitude: 1,
		name: 1,
	},
} satisfies { projection: Record<keyof InfrastructureNodesV1QueryRow, 1> };
