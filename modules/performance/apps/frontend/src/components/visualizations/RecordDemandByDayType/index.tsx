/* * */

import { AgenciesSelector } from '@/components/layout/AgenciesSelector';
import { RecordCard } from '@/components/layout/RecordCard';
import { AgencyType } from '@/constants';
import { useAgenciesContext } from '@/contexts/Agencies.context';
import { useDatesContext } from '@/contexts/Dates.context';
import { Routes } from '@/routes';
import { TopDemandByAgencyByDayType } from '@tmlmobilidade/types';
import { BarChart, Grid, MetricsSkeleton, Section, Skeleton, Surface } from '@tmlmobilidade/ui';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

export default function RecordDemandByDayType() {
	//

	// A. Setup variables

	const t = useTranslations();
	const { utils } = useDatesContext();
	const { data: { agencies } } = useAgenciesContext();
	const [selectedAgencies, setSelectedAgencies] = useState<AgencyType[]>([]);

	//
	// B. Fetch data

	const { data: recordDemandByDayType, isLoading } = useSWR<TopDemandByAgencyByDayType[]>(Routes.TOP_DEMAND_BY_AGENCY_BY_DAY_TYPE);

	//
	// C. Transform data

	const transformedRecordData: Record<string, { date: string, qty: number }[]> = useMemo(() => {
		if (!recordDemandByDayType) return {};

		const data = recordDemandByDayType[0].data;

		// If all agencies are selected or "all" is in selection, use total data
		const isAllSelected = selectedAgencies.length === 0 || selectedAgencies.length === agencies.length;

		const agencyData = isAllSelected
			? data.total
			: selectedAgencies.length === 1
				? data.agencies?.[selectedAgencies[0]]
				: data.total; // Fallback to total for multiple specific agencies

		if (!agencyData) return {};

		const result = {};

		Object.entries(agencyData).forEach(([dayTypeKey, values]) => {
			const points = Object.entries(values).map(([date, qty]) => ({
				date,
				detailed_date: utils.getDayLabel(date),
				qty,
			})).sort((a, b) => b.qty - a.qty);

			result[dayTypeKey] = points;
		});

		return result;
	}, [recordDemandByDayType, selectedAgencies, agencies, utils]);

	// D. Utils - extract this to a helper later

	const getDomain = (points) => {
		const ys = points.map(p => p.qty ?? p.y);
		const min = Math.min(...ys);
		const max = Math.max(...ys);

		if (min === max) return [min - 1000, max + 1000]; // edge case

		const range = max - min;
		const padding = Math.max(range * 0.3, 5000); // add more gap

		// Shift the window to center around mean but ensure the min bar is visible
		const lower = Math.floor((min - padding) / 1000) * 1000;
		const upper = Math.ceil((max + padding / 2) / 1000) * 1000;

		return [lower, upper];
	};

	// E. Render components

	if (isLoading) {
		return (
			<Surface overflow="visible">
				<Section gap="lg">
					<Section alignItems="center" flexDirection="row" justifyContent="space-between" padding="none">
						<h3>Recordes por dia tipo</h3>
						<div style={{ width: 150 }}>
							<Skeleton height={60} radius="sm" />
						</div>
					</Section>
					<Grid columns="abc" gap="lg">
						{[1, 2, 3].map(index => (
							<Section key={index} flexDirection="column" gap="lg" padding="none">
								<Skeleton height={120} radius="md" />
								<MetricsSkeleton key={index} height={100} />
							</Section>
						))}
					</Grid>
				</Section>
			</Surface>
		);
	}

	if (!transformedRecordData || Object.keys(transformedRecordData).length === 0) {
		return null;
	}

	return (
		<Surface overflow="visible">
			<Section gap="lg">
				<Section alignItems="center" flexDirection="row" justifyContent="space-between" padding="none">
					<h3>Recordes por dia tipo</h3>
					<div style={{ width: 150 }}>
						<AgenciesSelector
							isMultiple={false}
							onChange={values => setSelectedAgencies(values as AgencyType[])}
							selectedAgencies={selectedAgencies}
						/>
					</div>
				</Section>
				<Grid columns="abc" gap="lg">
					{['day_type_1', 'day_type_2', 'day_type_3'].map((dayTypeKey) => {
						const points = transformedRecordData[dayTypeKey];
						if (!points || points.length === 0) return null;

						const topDay = points[0];
						return (
							<Section key={dayTypeKey} flexDirection="column" gap="lg" padding="none">
								<RecordCard
									description={utils.getDayLabel(topDay.date, false)}
									title={t(`dates.day_types.${dayTypeKey}`)}
									value={topDay.qty}
								/>

								<BarChart
									data={points}
									dataKey="detailed_date"
									h={100}
									tooltipProps={{ position: { x: 0, y: 75 } }}
									withYAxis={false}
									xAxisProps={{ tickFormatter: value => utils.getShortLabelFromDetailed(value) }}
									series={[
										{
											color: 'var(--color-primary)',
											label: 'Nº de passageiros',
											name: 'qty',
										},
									]}
									yAxisProps={{
										domain: getDomain(points),
									}}
								/>
							</Section>
						);
					})}
				</Grid>
			</Section>
		</Surface>
	);
}

//
