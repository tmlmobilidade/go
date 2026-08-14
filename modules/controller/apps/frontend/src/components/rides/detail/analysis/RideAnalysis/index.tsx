'use client';

import { RideAnalysisAnalyses } from '@/components/rides/detail/analysis/RideAnalysisAnalyses';
import { RideAnalysisApexLocations } from '@/components/rides/detail/analysis/RideAnalysisApexLocations';
import { RideAnalysisApexRefunds } from '@/components/rides/detail/analysis/RideAnalysisApexRefunds';
import { RideAnalysisApexSales } from '@/components/rides/detail/analysis/RideAnalysisApexSales';
import { RideAnalysisApexValidations } from '@/components/rides/detail/analysis/RideAnalysisApexValidations';
import { RideAnalysisMap } from '@/components/rides/detail/analysis/RideAnalysisMap';
import { RideAnalysisMetadata } from '@/components/rides/detail/analysis/RideAnalysisMetadata';
import { RideAnalysisVehicleEvents } from '@/components/rides/detail/analysis/RideAnalysisVehicleEvents';

/* * */

export function RideAnalysis() {
	return (
		<>
			<RideAnalysisMap />
			<RideAnalysisMetadata />
			<RideAnalysisAnalyses />
			<RideAnalysisVehicleEvents />
			<RideAnalysisApexValidations />
			<RideAnalysisApexSales />
			<RideAnalysisApexRefunds />
			<RideAnalysisApexLocations />
		</>
	);
}
