'use client';

import { RideAnalysisAnalyses } from '@/components/rides/detail/analysis/RideAnalysisAnalyses';
import { RideAnalysisApexBankingTaps } from '@/components/rides/detail/analysis/RideAnalysisApexBankingTaps';
import { RideAnalysisApexLocations } from '@/components/rides/detail/analysis/RideAnalysisApexLocations';
import { RideAnalysisApexRefunds } from '@/components/rides/detail/analysis/RideAnalysisApexRefunds';
import { RideAnalysisApexSales } from '@/components/rides/detail/analysis/RideAnalysisApexSales';
import { RideAnalysisApexValidations } from '@/components/rides/detail/analysis/RideAnalysisApexValidations';
import { RideAnalysisMap } from '@/components/rides/detail/analysis/RideAnalysisMap';
import { RideAnalysisMetadata } from '@/components/rides/detail/analysis/RideAnalysisMetadata';
import { RideAnalysisPath } from '@/components/rides/detail/analysis/RideAnalysisPath';
import { RideAnalysisVehicleEvents } from '@/components/rides/detail/analysis/RideAnalysisVehicleEvents';

/* * */

export function RideAnalysis() {
	return (
		<>
			<RideAnalysisMap />
			<RideAnalysisMetadata />
			<RideAnalysisAnalyses />
			<RideAnalysisPath />
			<RideAnalysisApexValidations />
			<RideAnalysisApexSales />
			<RideAnalysisApexRefunds />
			<RideAnalysisApexBankingTaps />
			<RideAnalysisApexLocations />
			<RideAnalysisVehicleEvents />
		</>
	);
}
