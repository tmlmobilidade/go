'use client';

import { RideAnalysisApexLocations } from '@/components/rides/analysis/RideAnalysisApexLocations';
import { RideAnalysisApexOnBoardRefunds } from '@/components/rides/analysis/RideAnalysisApexOnBoardRefunds';
import { RideAnalysisApexOnBoardSales } from '@/components/rides/analysis/RideAnalysisApexOnBoardSales';
import { RideAnalysisApexValidations } from '@/components/rides/analysis/RideAnalysisApexValidations';
import { RideAnalysisMap } from '@/components/rides/analysis/RideAnalysisMap';
import { RideAnalysisMetadata } from '@/components/rides/analysis/RideAnalysisMetadata';
import { RideAnalysisAnalysisResult } from '@/components/rides/analysis/RideAnalysisResult';
import { RideAnalysisVehicleEvents } from '@/components/rides/analysis/RideAnalysisVehicleEvents';
import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { type Ride, type RideAnalysis } from '@tmlmobilidade/types';
import { useMemo } from 'react';

/* * */

export function RideAnalysisAnalysis() {
	//
	// A. Setup variables

	const rideAnalysisContext = useRideAnalysisContext();

	//
	// B. Transform data

	const analysisItems = useMemo(() => {
		// Skip if no analysis data is available
		if (!rideAnalysisContext.data.ride?.analysis) return [];
		// Transform the analysis data into an array of items
		return Object.entries(rideAnalysisContext.data.ride.analysis).map(([id, item]) => ({ id: id as keyof Ride['analysis'], ...(item as RideAnalysis) }));
	}, [rideAnalysisContext.data.ride?.analysis]);

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
