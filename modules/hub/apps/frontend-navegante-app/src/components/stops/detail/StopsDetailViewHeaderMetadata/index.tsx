'use client';

import { CopyBadge } from '@/components/common/display/CopyBadge';
import { ScrollChips } from '@/components/common/lists/ScrollChips';
import { StopDisplayLocation } from '@/components/stops/common/StopDisplayLocation';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';

/* * */

export function StopsDetailViewHeaderMetadata() {
	//

	//
	// A. Setup variables

	const stopsDetailContext = useStopsDetailContext();

	//
	// B. Render componentss

	return (
		<ScrollChips>
			<StopDisplayLocation
				localityName={stopsDetailContext.data.stop.locality_name}
				municipalityName={stopsDetailContext.data.stop.municipality_name}
				size="lg"
			/>
			<CopyBadge
				label={stopsDetailContext.data.stop._id}
				value={stopsDetailContext.data.stop._id}
				withBorder
			/>
			<CopyBadge
				label={`${stopsDetailContext.data.stop.latitude} ${stopsDetailContext.data.stop.longitude}`}
				value={`${stopsDetailContext.data.stop.latitude}, ${stopsDetailContext.data.stop.longitude}`}
			/>
		</ScrollChips>
	);
}
