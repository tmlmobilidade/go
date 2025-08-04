/* * */

import { type Stop } from '@tmlmobilidade/types';

/* * */

export interface WorkerMessage {
	error: Error | null
	stop: {
		stop_lat: Stop['latitude']
		stop_lon: Stop['longitude']
		stop_name: Stop['name']
	}

}
