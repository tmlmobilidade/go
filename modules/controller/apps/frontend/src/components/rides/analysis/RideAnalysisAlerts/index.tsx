'use client';

import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type Alert } from '@tmlmobilidade/types';
import { Collapsible, Divider, NoDataLabel, Section, Surface, ValueDisplay } from '@tmlmobilidade/ui';
import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

/* * */

export function RideAnalysisAlerts() {
	//

	//
	// A. Setup variables

	const RideAnalysisContext = useRideAnalysisContext();
	const { t } = useTranslation();

	const formatDatesTimestamp = (timestamp: number) => {
		return timestamp ? Dates.fromUnixTimestamp(timestamp).setZone('Europe/Lisbon', 'offset_only').toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt') : null;
	};

	const ride = RideAnalysisContext.data.ride;
	const { data: alertsData } = useSWR<Alert[]>(API_ROUTES.alerts.ALERTS_LIST);
	const rideAlerts = useMemo(() => {
		if (!ride) return [];
		return (alertsData ?? []).filter(alert =>
			alert.references.some((reference) => {
				if (alert.reference_type === 'lines') {
					return Number(reference.parent_id) === Number(ride.line_id);
				}

				return reference.child_ids.some(
					childId => Number(childId) === Number(ride.line_id),
				);
			}) &&
			ride.start_time_scheduled <= (alert.active_period_end_date ?? Number.MAX_SAFE_INTEGER) &&
			ride.end_time_scheduled >= (alert.active_period_start_date));
	}, [alertsData, ride]);
	//
	// B. Handle No Data
	if (rideAlerts.length === 0) {
		return (
			<Collapsible
				description={t('default:rides.analysis.RideAnalysisAlerts.description')}
				title={t('default:rides.analysis.RideAnalysisAlerts.title')}
			>
				<Section>
					<NoDataLabel text={t('default:rides.analysis.RideAnalysisAlerts.no_data')} />
				</Section>
			</Collapsible>
		);
	}
	//
	// C. Render components
	return (
		<Collapsible
			description={t('default:rides.analysis.RideAnalysisAlerts.description')}
			title={t('default:rides.analysis.RideAnalysisAlerts.title')}
		>

			<Section gap="lg">
				{rideAlerts.map(alert => (
					<Surface key={alert._id} variant="bordered">
						<Section gap="md">
							<ValueDisplay
								label={t('default:rides.analysis.RideAnalysisAlerts.Table.columns.alert_id.label')}
								variant="plain"
								value={(
									<Link href={PAGE_ROUTES.alerts.ALERTS_DETAIL(alert._id)}>
										{alert._id}
									</Link>
								)}
							/>
							<Divider />

							<ValueDisplay label={t('default:rides.analysis.RideAnalysisAlerts.Table.columns.created_at.label')} value={formatDatesTimestamp(alert.created_at)} variant="plain" />
							<ValueDisplay label={t('default:rides.analysis.RideAnalysisAlerts.Table.columns.title.label')} value={alert.title} variant="plain" />
							<ValueDisplay label={t('default:rides.analysis.RideAnalysisAlerts.Table.columns.description.label')} value={alert.description} variant="plain" />
						</Section>
					</Surface>
				))}
			</Section>
		</Collapsible>
	);

	//
}
