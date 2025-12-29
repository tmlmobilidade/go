/* * */

import { RecordCard } from '@/components/layout/RecordCard';
import { AgencyType } from '@/constants';
import { useAgenciesContext } from '@/contexts/Agencies.context';
import { filterDataByAgencies } from '@/utils/metrics/handlers/ChartTransformers';
import { buildMetricUrl } from '@/utils/metrics/handlers/MetricRouteResolver';
import { RawMetricData } from '@/utils/metrics/types/metricData';
import { Dates } from '@tmlmobilidade/dates';
import { Grid, Section, Skeleton, Surface } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Filters {
	agencyIds?: AgencyType[]
	dateRange?: {
		endDate: Dates
		startDate: Dates
	}
	lineIds?: string[]
	patternIds?: string[]
}

export default function RecordSupply({ filters, timeView }: { filters: Filters, timeView: 'annual' | 'daily' | 'monthly' }) {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();

	//
	// B. Fetch data

	const metricUrl = useMemo(() => {
		const baseConfig = {
			groupBy: 'agency' as const,
			metricType: 'supply' as const,
			timeView,
		};

		const metricFilters = {
			endDate: filters?.dateRange?.endDate.js_date,
			startDate: filters?.dateRange?.startDate.js_date,
		};

		return buildMetricUrl(baseConfig, metricFilters);
	}, [timeView, filters]);

	const { data, isLoading } = useSWR<RawMetricData[]>(metricUrl);

	//
	// C. Transform data

	const transformedRecordData = useMemo(() => {
		const agencyData = filterDataByAgencies(data || [], filters?.agencyIds as string[]);

		let accomplishedRides = 0;
		let scheduledRides = 0;
		let vkmsObserved = 0;
		let vmksScheduled = 0;

		agencyData.forEach((agency) => {
			Object.values(agency.data).forEach((date) => {
				accomplishedRides += date.accomplished_rides as number || 0;
				scheduledRides += date.scheduled_rides as number || 0;
				vkmsObserved += date.vkms_observed as number || 0;
				vmksScheduled += date.vkms_scheduled as number || 0;
			});
		});

		return {
			accomplishedRides: Number(accomplishedRides.toFixed(0)),
			scheduledRides: Number(scheduledRides.toFixed(0)),
			vkmsObserved: Number((vkmsObserved / 1000).toFixed(0)),
			vmksScheduled: Number((vmksScheduled / 1000).toFixed(0)),
		};
	}, [data, filters]);

	const vkmsContracted = useMemo(() => {
		const selectedAgencies = filters?.agencyIds?.includes('all' as AgencyType) || !filters?.agencyIds
			? agenciesContext.data.agencies
			: agenciesContext.data.agencies.filter(agency => filters.agencyIds?.includes(agency.id));

		return selectedAgencies.reduce((total, agency) => {
			const contractedVkms = agency.financials?.vkm_per_month?.reduce((sum, vkms) => sum + vkms, 0) || 0;
			return total + contractedVkms;
		}, 0);
	}, [agenciesContext.data.agencies, filters?.agencyIds]);

	//
	// E. Render components

	if (isLoading) {
		return (
			<Surface overflow="visible">
				<Section gap="lg">
					<Section alignItems="center" flexDirection="row" justifyContent="space-between" padding="none">
						<h3>Operação</h3>
					</Section>
					<Grid columns="abc" gap="lg">
						{[1, 2, 3].map(index => (
							<Section key={index} flexDirection="column" gap="lg" padding="none">
								<Skeleton height={120} radius="md" />
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
					<h3>Operação</h3>
				</Section>
				<Grid columns="abc" gap="lg">
					<RecordCard
						description="no período selecionado"
						title="Vkms referência"
						value={vkmsContracted}
					/>
					<RecordCard
						description={`de ${transformedRecordData.scheduledRides.toLocaleString('pt-PT')} viagens`}
						title="Vkms planeados"
						totalValue={vkmsContracted}
						value={transformedRecordData.vmksScheduled}
					/>
					<RecordCard
						description={`de ${transformedRecordData.accomplishedRides.toLocaleString('pt-PT')} viagens`}
						title="Vkms executados"
						totalValue={vkmsContracted}
						value={transformedRecordData.vkmsObserved}
					/>
				</Grid>
			</Section>
		</Surface>
	);
}

//
