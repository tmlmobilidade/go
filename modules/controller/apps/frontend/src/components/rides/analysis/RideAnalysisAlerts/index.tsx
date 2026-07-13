'use client';

import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert } from '@tmlmobilidade/types';
import { Collapsible, Grid, NoDataLabel, Section, ValueDisplay } from '@tmlmobilidade/ui';
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
			}),
		);
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
			<Section gap="md">
				{rideAlerts.map(alert => (
					<Grid key={alert._id}>
						<ValueDisplay label={t('default:rides.analysis.RideAnalysisAlerts.Table.columns.alert_id.label')} value={alert._id} />
						<ValueDisplay label={t('default:rides.analysis.RideAnalysisAlerts.Table.columns.created_at.label')} value={alert.created_at} />
						<ValueDisplay label={t('default:rides.analysis.RideAnalysisAlerts.Table.columns.title.label')} value={alert.title} />
						<ValueDisplay label={t('default:rides.analysis.RideAnalysisAlerts.Table.columns.description.label')} value={alert.description} />
					</Grid>
				))}
			</Section>
		</Collapsible>
	);

	//
}
