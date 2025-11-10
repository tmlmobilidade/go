/* * */

import { RecordCard } from '@/components/layout/RecordCard';
import { AGENCIES, AgencyType } from '@/constants';
import { useDatesContext } from '@/contexts/Dates.context';
import { Routes } from '@/routes';
import { TopDemandByAgencyByDayType } from '@tmlmobilidade/types';
import { BarChart, Combobox, Grid, MetricsSkeleton, Section, Skeleton, Surface } from '@tmlmobilidade/ui';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

export default function RecordDemandByDayType() {
	//

	// A. Setup variables

	const t = useTranslations();
	const { utils } = useDatesContext();
	const { data: recordDemandByDayType, isLoading } = useSWR<TopDemandByAgencyByDayType[]>(Routes.TOP_DEMAND_BY_AGENCY_BY_DAY_TYPE);
	const [selectedAgency, setSelectedAgency] = useState<AgencyType>(AGENCIES.ALL);

	//
	// B. Transform data

	const transformedRecordData: Record<string, { date: string, qty: number }[]> = useMemo(() => {
		if (!recordDemandByDayType) return {};

		const data = recordDemandByDayType[0].data;

		const agencyData = selectedAgency === AGENCIES.ALL
			? data.total
			: data.operators?.[selectedAgency];

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
	}, [recordDemandByDayType, selectedAgency, utils]);

	const agenciesData = useMemo(() =>
		Object.values(AGENCIES)
			.map(value => ({
				label: t(`agencies.${value}`),
				value,
			})),
	[t]);

	// C. Utils - extract this to a helper later

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

	// D. Render components

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
						<Combobox data={agenciesData} onChange={value => setSelectedAgency(value as AgencyType)} value={selectedAgency} />
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
