'use client';

/* * */

import { RidesDetailAnalysisResult } from '@/components/rides/detail/analysis/RidesDetailAnalysisResult';
import { RidesDetailApexLocations } from '@/components/rides/detail/analysis/RidesDetailApexLocations';
import { RidesDetailApexOnBoardRefunds } from '@/components/rides/detail/analysis/RidesDetailApexOnBoardRefunds';
import { RidesDetailApexOnBoardSales } from '@/components/rides/detail/analysis/RidesDetailApexOnBoardSales';
import { RidesDetailApexValidations } from '@/components/rides/detail/analysis/RidesDetailApexValidations';
import { RidesDetailMap } from '@/components/rides/detail/RidesDetail/RidesDetailMap';
import { RidesDetailMetadata } from '@/components/rides/detail/RidesDetail/RidesDetailMetadata';
import { RidesDetailVehicleEvents } from '@/components/rides/detail/RidesDetail/RidesDetailVehicleEvents';

/* * */

export function RidesDetailAnalysis() {
	return (
		<>
			<RidesDetailMap />
			<RidesDetailMetadata />
			<RidesDetailAnalysisResult />
			<RidesDetailVehicleEvents />
			<RidesDetailApexValidations />
			<RidesDetailApexOnBoardSales />
			<RidesDetailApexOnBoardRefunds />
			<RidesDetailApexLocations />
		</>
	);
}
