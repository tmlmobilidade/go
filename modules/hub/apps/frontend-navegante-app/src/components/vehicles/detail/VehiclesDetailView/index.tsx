'use client';

import { useVehiclesDetailContext } from '@/components/vehicles/detail/VehiclesDetail.context';
import { Section } from '@tmlmobilidade/ui';

/* * */

export function VehiclesDetailView() {
	//

	//
	// A. Setup variables

	const vehiclesDetailContext = useVehiclesDetailContext();

	//
	// B. Render componentss

	return (
		<Section flexDirection="column" padding="none">
			<p>vehicle_id: {vehiclesDetailContext.data.vehicle?.vehicle_id}</p>
			<p>agency_id: {vehiclesDetailContext.data.vehicle?.agency_id}</p>
			<p>trip_id: {vehiclesDetailContext.data.vehicle?.trip_id}</p>
			<p>stop_id: {vehiclesDetailContext.data.vehicle?.stop_id}</p>
			<p>received_at: {vehiclesDetailContext.data.vehicle?.received_at}</p>
			<p>created_at: {vehiclesDetailContext.data.vehicle?.created_at}</p>
			<p>line_id: {vehiclesDetailContext.data.vehicle?.line_id}</p>
			<p>pattern_id: {vehiclesDetailContext.data.vehicle?.pattern_id}</p>
			<p>ride_id: {vehiclesDetailContext.data.vehicle?.ride_id}</p>
		</Section>
	);
}
