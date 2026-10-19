/* * */

import { type InfrastructureStopsV1QueryRow } from './types.js';

/* * */

/** The stop fields required by the v1 stops extraction. */
export const infrastructureStopsV1ExtractionQuery = {
	projection: {
		_id: 1,
		connections: 1,
		facilities: 1,
		jurisdiction: 1,
		latitude: 1,
		legacy_id: 1,
		legacy_ids: 1,
		lifecycle_status: 1,
		location: 1,
		longitude: 1,
		name: 1,
		new_name: 1,
		observations: 1,
		previous_go_id: 1,
		shelter: 1,
		short_name: 1,
		tts_name: 1,
	},
} satisfies { projection: Record<keyof InfrastructureStopsV1QueryRow, 1> };
