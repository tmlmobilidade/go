'use client';

/* * */

import { RidesDetailApexLocations } from '@/components/rides/detail/analysis/RidesDetailApexLocations';
import { RidesDetailApexOnBoardRefunds } from '@/components/rides/detail/analysis/RidesDetailApexOnBoardRefunds';
import { RidesDetailApexOnBoardSales } from '@/components/rides/detail/analysis/RidesDetailApexOnBoardSales';
import { RidesDetailApexValidations } from '@/components/rides/detail/analysis/RidesDetailApexValidations';
import { RidesDetailMap } from '@/components/rides/detail/RidesDetail/RidesDetailMap';
import { RidesDetailMetadata } from '@/components/rides/detail/RidesDetail/RidesDetailMetadata';
import { RidesDetailVehicleEvents } from '@/components/rides/detail/RidesDetail/RidesDetailVehicleEvents';
import { RidesDetailAnalysisResult } from '@/components/rides/detail/RidesDetailAnalysisResult';
import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { useMemo } from 'react';

/* * */

export function RidesDetailAnalysis() {
	//
	// A. Setup variables

	const ridesDetailContext = useRidesDetailContext();

	//
	// B. Transform data

	const analysisItems = useMemo(() => {
		// Skip if no analysis data is available
		if (!ridesDetailContext.data.ride?.analysis) return [];
		// Transform the analysis data into an array of items
		return Object.entries(ridesDetailContext.data.ride.analysis).map(([id, item]) => ({ id, ...item }));
	}, [ridesDetailContext.data.ride?.analysis]);

	//
	// C. Render components

	return (
		<>
			<RidesDetailMap />
			<RidesDetailMetadata />
			<RidesDetailAnalysisResult items={analysisItems} />
			<RidesDetailVehicleEvents />
			<RidesDetailApexValidations />
			<RidesDetailApexOnBoardSales />
			<RidesDetailApexOnBoardRefunds />
			<RidesDetailApexLocations />
		</>
	);
}
