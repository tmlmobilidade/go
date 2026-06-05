'use client';

/* * */

import { useLinesContext } from '@/components/lines/Lines.context';
import { useVehiclesDetailContext } from '@/components/vehicles/detail/VehiclesDetail.context';
import { LineDisplay, Section } from '@tmlmobilidade/ui'; ;

/* * */

export function VehiclesDetailsContent() {
	//

	//
	// A. Setup variables

	const linesContext = useLinesContext();
	const vehiclesDetailContext = useVehiclesDetailContext();

	//
	// B. Fetch data

	const activeLineData = linesContext.data.lines.find(line => line._id === vehiclesDetailContext.data.selected?.line_id?.trim());

	console.log(vehiclesDetailContext.data.vehicle?.line_id);
	console.log('linesContext.data.lines', linesContext.data.lines);
	console.log(activeLineData);

	//
	// C. Render components

	return (
		<Section padding="md">

			<LineDisplay color={activeLineData?.color} longName={activeLineData?.long_name} shortName={activeLineData?.short_name} textColor={activeLineData?.text_color} />

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

	//
}
