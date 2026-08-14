'use client';

import { RideAnalysisAnalysesItem } from '@/components/rides/detail/analysis/RideAnalysisAnalysesItem';
import { useRidesDetailRideAnalysesData } from '@/components/rides/detail/shared/use-rides-detail-ride-analyses-data';
import { type RideAnalysesRegistry } from '@tmlmobilidade/go-types-operation';
import { Collapsible, Grid, Label, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisAnalyses() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data: rideAnalysesData } = useRidesDetailRideAnalysesData();

	//
	// B. Transform data

	const rideAnalysesList = useMemo(() => {
		if (!rideAnalysesData) return [];
		return (Object.entries(rideAnalysesData) as [keyof RideAnalysesRegistry, RideAnalysesRegistry[keyof RideAnalysesRegistry]][])
			.sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
			.map(([key, value]) => [key, value] as const);
	}, [rideAnalysesData]);

	//
	// C. Render components

	return (
		<Collapsible description={t('default:rides.analysis.RideAnalysisResult.description')} title={t('default:rides.analysis.RideAnalysisResult.title')} defaultOpen>
			<Section>
				{!rideAnalysesList.length ? (
					<Label size="lg" caps>{t('default:rides.analysis.RideAnalysisResult.no_data')}</Label>
				) : (
					<Grid columns="abc" gap="md">
						{rideAnalysesList.map(item => (
							<RideAnalysisAnalysesItem
								key={item[0]}
								grade={item[1].grade_status}
								id={item[0]}
							/>
						))}
					</Grid>
				)}
			</Section>
		</Collapsible>
	);

	//
}
