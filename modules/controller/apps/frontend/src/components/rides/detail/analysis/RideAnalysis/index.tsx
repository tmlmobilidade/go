'use client';

import { RideAnalysisApexLocations } from '@/components/rides/detail/analysis/RideAnalysisApexLocations';
import { RideAnalysisApexOnBoardRefunds } from '@/components/rides/detail/analysis/RideAnalysisApexOnBoardRefunds';
import { RideAnalysisApexOnBoardSales } from '@/components/rides/detail/analysis/RideAnalysisApexOnBoardSales';
import { RideAnalysisApexValidations } from '@/components/rides/detail/analysis/RideAnalysisApexValidations';
import { RideAnalysisMap } from '@/components/rides/detail/analysis/RideAnalysisMap';
import { RideAnalysisMetadata } from '@/components/rides/detail/analysis/RideAnalysisMetadata';
import { RideAnalysisAnalysisResult } from '@/components/rides/detail/analysis/RideAnalysisResult';
import { RideAnalysisVehicleEvents } from '@/components/rides/detail/analysis/RideAnalysisVehicleEvents';
import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { type Ride } from '@tmlmobilidade/go-types-operation';
import { useMemo } from 'react';

/* * */

export function RideAnalysisAnalysis() {
	//
	// A. Setup variables

	const rideAnalysisContext = useRideAnalysisContext();

	//
	// B. Transform data

	const analysisItems = useMemo(() => {
		return [];
		// Skip if no analysis data is available
		// if (!rideAnalysisContext.data.ride?.analysis) return [];
		// Transform the analysis data into an array of items
		// return Object.entries(rideAnalysisContext.data.ride.analysis).map(([id, item]) => ({ id: id as keyof Ride['analysis'], ...(item as RideAnalysis) }));
	}, []);

	//
	// C. Render components

	return (
		<>
			<RideAnalysisMap />
			<RideAnalysisMetadata />
			<RideAnalysisAnalysisResult items={analysisItems} />
			<RideAnalysisVehicleEvents />
			<RideAnalysisApexValidations />
			<RideAnalysisApexOnBoardSales />
			<RideAnalysisApexOnBoardRefunds />
			<RideAnalysisApexLocations />
		</>
	);
}
