'use client';

import { RideAcceptance } from '@/components/rides/detail/acceptance/RideAcceptance';
import { RideAnalysis } from '@/components/rides/detail/analysis/RideAnalysis';
import { RideAnalysisAudit } from '@/components/rides/detail/audit';
import { RidesDetailHeader } from '@/components/rides/detail/shared/RidesDetailHeader';
import { useRidesDetailCurrentView } from '@/components/rides/detail/shared/use-rides-detail-current-view';
import { useRidesDetailRideData } from '@/components/rides/detail/shared/use-rides-detail-ride-data';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useRidesDetailApexBankingTapsData } from '../use-rides-detail-apex-banking-taps-data';
import { useRidesDetailApexRefundsData } from '../use-rides-detail-apex-refunds-data';
import { useRidesDetailApexSalesData } from '../use-rides-detail-apex-sales-data';
import { useRidesDetailApexValidationsData } from '../use-rides-detail-apex-validations-data';
import { useRidesDetailHashedTripData } from '../use-rides-detail-hashed-trip-data';
import { useRidesDetailRideAnalysesData } from '../use-rides-detail-ride-analyses-data';

/* * */

export function RidesDetail() {
	//

	//
	// A. Setup variables

	const { currentView } = useRidesDetailCurrentView();

	const { error: rideError, isLoading: rideIsLoading } = useRidesDetailRideData();
	const { error: rideAnalysesError, isLoading: rideAnalysesIsLoading } = useRidesDetailRideAnalysesData();
	const { error: hashedTripError, isLoading: hashedTripIsLoading } = useRidesDetailHashedTripData();
	const { error: simplifiedApexBankingTapsError, isLoading: simplifiedApexBankingTapsIsLoading } = useRidesDetailApexBankingTapsData();
	const { error: simplifiedApexValidationsError, isLoading: simplifiedApexValidationsIsLoading } = useRidesDetailApexValidationsData();
	const { error: simplifiedApexSalesError, isLoading: simplifiedApexSalesIsLoading } = useRidesDetailApexSalesData();
	const { error: simplifiedApexRefundsError, isLoading: simplifiedApexRefundsIsLoading } = useRidesDetailApexRefundsData();

	//
	// B. Transform data

	const isLoading = useMemo(() => {
		if (rideIsLoading) return true;
		if (rideAnalysesIsLoading) return true;
		if (hashedTripIsLoading) return true;
		if (simplifiedApexBankingTapsIsLoading) return true;
		if (simplifiedApexValidationsIsLoading) return true;
		if (simplifiedApexSalesIsLoading) return true;
		if (simplifiedApexRefundsIsLoading) return true;
		return false;
	}, [rideIsLoading, rideAnalysesIsLoading, hashedTripIsLoading, simplifiedApexBankingTapsIsLoading, simplifiedApexValidationsIsLoading, simplifiedApexSalesIsLoading, simplifiedApexRefundsIsLoading]);

	const isError = useMemo(() => {
		if (rideError) return rideError;
		if (rideAnalysesError) return rideAnalysesError;
		if (hashedTripError) return hashedTripError;
		if (simplifiedApexBankingTapsError) return simplifiedApexBankingTapsError;
		if (simplifiedApexValidationsError) return simplifiedApexValidationsError;
		if (simplifiedApexSalesError) return simplifiedApexSalesError;
		if (simplifiedApexRefundsError) return simplifiedApexRefundsError;
		return null;
	}, [rideError, rideAnalysesError, hashedTripError, simplifiedApexBankingTapsError, simplifiedApexValidationsError, simplifiedApexSalesError, simplifiedApexRefundsError]);

	//
	// C. Render components

	if (isLoading) {
		return <LoadingOverlay />;
	}

	return (
		<Pane header={[<RidesDetailHeader key="header" />]}>
			{isError && <ErrorDisplay message={isError} />}
			{currentView === 'analysis' && <RideAnalysis />}
			{currentView === 'audit' && <RideAnalysisAudit />}
			{currentView === 'acceptance' && <RideAcceptance />}
		</Pane>
	);
}
