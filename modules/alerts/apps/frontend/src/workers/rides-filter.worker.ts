/* * */

import { type RidesData } from '@/hooks/Rides.context';
import { Line, Stop } from '@carrismetropolitana/api-types/network';

/* * */

self.addEventListener('message', async (event) => {
	const { availableLines, availableStops, ridesData } = event.data as { availableLines: Line[], availableStops: Stop[], ridesData: RidesData[] };

	const filteredLines = availableLines.filter(line => ridesData.some(ride => ride.line_id.toString() === line.id));
	const filteredStops = availableStops.filter(stop => ridesData.some(ride => ride.stop_ids.includes(stop.id)));

	self.postMessage({ lines: filteredLines, stops: filteredStops });
});
