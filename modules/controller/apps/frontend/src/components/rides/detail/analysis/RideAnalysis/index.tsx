'use client';

import { RideAnalysisApexLocations } from '@/components/rides/detail/analysis/RideAnalysisApexLocations';
import { RideAnalysisApexOnBoardRefunds } from '@/components/rides/detail/analysis/RideAnalysisApexOnBoardRefunds';
import { RideAnalysisApexOnBoardSales } from '@/components/rides/detail/analysis/RideAnalysisApexOnBoardSales';
import { RideAnalysisApexValidations } from '@/components/rides/detail/analysis/RideAnalysisApexValidations';
import { RideAnalysisMap } from '@/components/rides/detail/analysis/RideAnalysisMap';
import { RideAnalysisMetadata } from '@/components/rides/detail/analysis/RideAnalysisMetadata';
import { RideAnalysisResult } from '@/components/rides/detail/analysis/RideAnalysisResult';
import { RideAnalysisVehicleEvents } from '@/components/rides/detail/analysis/RideAnalysisVehicleEvents';

/* * */

export function RideAnalysis() {
	return (
		<>
			<RideAnalysisMap />
			<RideAnalysisMetadata />
			<RideAnalysisResult />
			<RideAnalysisVehicleEvents />
			<RideAnalysisApexValidations />
			<RideAnalysisApexOnBoardSales />
			<RideAnalysisApexOnBoardRefunds />
			<RideAnalysisApexLocations />
		</>
	);
}
