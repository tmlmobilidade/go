'use client';

import { RideAnalysisAnalysesItem } from '@/components/rides/detail/analysis/RideAnalysisAnalysesItem';
import { useRidesDetailRideAnalysesData } from '@/components/rides/detail/shared/use-rides-detail-ride-analyses-data';
import { type RideAnalysesRegistry } from '@tmlmobilidade/go-types-operation';
import { Collapsible, DataTable, DataTableColumn, GradeStatusDisplay, Grid, Label, Section, Table, TableData, Text } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisAnalyses() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data: rideAnalysesData } = useRidesDetailRideAnalysesData();

	const columns: DataTableColumn<[keyof RideAnalysesRegistry, RideAnalysesRegistry[keyof RideAnalysesRegistry]]>[] = [
		{
			accessor: 'id',
			render: item => (
				<Section flexDirection="column" gap="xs" padding="none">
					<Label size="sm">{item[0]}</Label>
					<Label>{t(`ride_analysis:${item[0]}.label`)}</Label>
					<Text size="sm">{t(`ride_analysis:${item[0]}.description`)}</Text>
				</Section>
			),
			title: t('default:rides.analysis.RideAnalysisApexLocations.Table.columns.created_at.label'),
			width: 500,
		},
		{
			accessor: 'grade_status',
			render: item => <GradeStatusDisplay tooltip={item[1].remarks} value={item[1].grade_status} />,
			title: t('default:rides.analysis.RideAnalysisApexLocations.Table.columns.stop_id.label'),
			width: 100,
		},
		{
			accessor: 'reason',
			render: item => <Label>{item[1].reason}</Label>,
			title: t('default:rides.analysis.RideAnalysisApexLocations.Table.columns.vehicle_id.label'),
			width: 500,
		},
	];

	//
	// B. Transform data

	const rideAnalysesList: [keyof RideAnalysesRegistry, RideAnalysesRegistry[keyof RideAnalysesRegistry]][] = useMemo(() => {
		if (!rideAnalysesData) return [];
		return (Object.entries(rideAnalysesData) as [keyof RideAnalysesRegistry, RideAnalysesRegistry[keyof RideAnalysesRegistry]][])
			.sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
			.map(([key, value]) => [key, value] as const);
	}, [rideAnalysesData]);

	//
	// C. Render components

	return (
		<Collapsible description={t('default:rides.analysis.RideAnalysisResult.description')} title={t('default:rides.analysis.RideAnalysisResult.title')} defaultOpen>
			<DataTable
				columns={columns}
				records={rideAnalysesList}
				rowIdAccessor="0"
			/>
		</Collapsible>
	);
}
