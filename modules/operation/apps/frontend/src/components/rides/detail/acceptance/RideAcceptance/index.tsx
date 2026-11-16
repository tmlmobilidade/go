'use client';

import { IconLock, IconLockOpen } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type RideAcceptance as RideAcceptanceData } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { ErrorDisplay, fetchApiData, Grid, HasPermission, LoadingOverlay, LockButton, Section, Text, useHandleAction } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useRidesDetailRideData } from '../../shared/use-rides-detail-ride-data';
import { useRidesDetailRideId } from '../../shared/use-rides-detail-ride-id';
import { RideAcceptanceChecks } from '../RideAcceptanceChecks';
import { RideAcceptanceCommentList } from '../RideAcceptanceCommentList';
import { RideAcceptanceJustification } from '../RideAcceptanceJustification';
import { RideAcceptanceStatus } from '../RideAcceptanceStatus';
import { useRideAcceptanceData } from '../use-ride-acceptance-data';

/* * */

export function RideAcceptance() {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation();
	const { rideId } = useRidesDetailRideId();
	const { data: ride } = useRidesDetailRideData();
	const { data: acceptance, error, isLoading, mutate } = useRideAcceptanceData();

	//
	// B. Transform data

	const dateFormat = ride && new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', timeZone: ride.timezone, year: 'numeric' });
	const timeFormat = ride && new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', hourCycle: 'h23', minute: '2-digit', timeZone: ride.timezone });

	//
	// C. Handle actions

	const { action: setLock, isLoading: isLocking } = useHandleAction<RideAcceptanceData, boolean>({
		fetchFn: isLocked => fetchApiData<RideAcceptanceData, Pick<RideAcceptanceData, 'is_locked'>>({
			body: { is_locked: isLocked },
			method: 'PUT',
			url: API_ROUTES.operation.RIDE_ACCEPTANCES_LOCK(rideId),
		}),
		onSuccess: response => mutate(response),
	});

	//
	// D. Render components

	if (isLoading) return <LoadingOverlay />;
	if (error) return <ErrorDisplay message={error} />;
	if (!ride || !acceptance) return null;

	return (
		<Section gap="md">
			<Section flexDirection="row" padding="none">
				<Section flexDirection="column" padding="none">
					<h1 className={styles.title}>{t('default:rides.acceptance.RideAcceptance.title')}</h1>
					<Text c="var(--color-system-text-200)">
						{t('default:rides.acceptance.RideAcceptance.line')} {ride.route_short_name}
						{' · '}{dateFormat.format(Dates.fromOperationalDateInt(ride.operational_date, ride.timezone).unix_milliseconds)}
						{' · '}{timeFormat.format(ride.start_time_scheduled)}–{timeFormat.format(ride.end_time_scheduled)}
					</Text>
				</Section>
				<Section alignItems="center" flexDirection="row" flexWrap="wrap" gap="sm" padding="none" width="auto">
					<div className={styles.lock}>
						<HasPermission
							action={PermissionCatalog.all.rides.actions.acceptance_lock}
							fallback={acceptance.is_locked ? <IconLock size={21} aria-hidden /> : <IconLockOpen size={21} aria-hidden />}
							scope={PermissionCatalog.all.rides.scope}
						>
							<LockButton
								isLoading={isLocking}
								isLocked={acceptance.is_locked}
								onClick={() => void setLock(!acceptance.is_locked)}
								tooltip={t(`default:rides.acceptance.RideAcceptance.${acceptance.is_locked ? 'unlock' : 'lock'}`)}
							/>
						</HasPermission>
						{t(`default:rides.acceptance.RideAcceptance.${acceptance.is_locked ? 'locked' : 'unlocked'}`)}
					</div>
					<RideAcceptanceStatus key={acceptance._id} grade={acceptance.acceptance_status} />
				</Section>
			</Section>
			<Grid columns="aab" gap="md">
				<Section className={styles.main} gap="md" padding="none">
					<RideAcceptanceChecks summary={acceptance.analysis_summary} />
					<RideAcceptanceJustification key={acceptance._id} acceptance={acceptance} />
				</Section>
				<RideAcceptanceCommentList key={acceptance._id} acceptance={acceptance} ride={ride} />
			</Grid>
		</Section>
	);

	//
}
