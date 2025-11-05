/* * */

import { type Stop } from '@tmlmobilidade/go-types';

/* * */

export interface WorkerMessage {
	error: Error | null
	stop: {
		stop_district_id: Stop['district_id']
		stop_lat: Stop['latitude']
		stop_lon: Stop['longitude']
		stop_municipality_id: Stop['municipality_id']
		stop_name: Stop['name']
		stop_parish_id: Stop['parish_id']
		stop_short_name: Stop['short_name']
		stop_tts_name: Stop['tts_name']
	}

}
