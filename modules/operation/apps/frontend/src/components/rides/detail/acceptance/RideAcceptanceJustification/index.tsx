'use client';

import { RideAcceptanceJustificationEditable } from '@/components/rides/detail/acceptance/RideAcceptanceJustificationEditable';
import { RideAcceptanceJustificationReadOnly } from '@/components/rides/detail/acceptance/RideAcceptanceJustificationReadOnly';
import { RideAcceptanceStatus } from '@/components/rides/detail/acceptance/RideAcceptanceStatus';
import { useRideAcceptanceData } from '@/components/rides/detail/acceptance/use-ride-acceptance-data';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AlertCause, type RideAcceptance, RideAcceptanceStatusSchema } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, HasPermission, Label, Section, useHandleAction } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useRidesDetailRideId } from '../../shared/use-rides-detail-ride-id';

/* * */

interface JustifyRideAcceptanceBody {
	justification_cause: AlertCause
	manual_trip_id?: string
	pto_message: string
}

/* * */

export function RideAcceptanceJustification() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { rideId } = useRidesDetailRideId();
	const { data: acceptance, mutate } = useRideAcceptanceData();

	const [message, setMessage] = useState(acceptance?.justification?.pto_message ?? '');
	const [cause, setCause] = useState<AlertCause | undefined>(acceptance?.justification?.justification_cause);
	const [manualTripId, setManualTripId] = useState(acceptance?.justification?.manual_trip_id ?? '');

	//
	// B. Handle actions

	const { action: handleJustify, isLoading: isJustifying } = useHandleAction<RideAcceptance, JustifyRideAcceptanceBody>({
		fetchFn: async body => await fetchApiData<RideAcceptance, JustifyRideAcceptanceBody>({
			body,
			method: 'PUT',
			url: API_ROUTES.operation.RIDE_ACCEPTANCES_JUSTIFY(rideId),
		}),
		onSuccess: () => {
			mutate();
		},
	});

	const handleSubmit = () => {
		if (!cause) return;
		handleJustify({
			justification_cause: cause,
			manual_trip_id: manualTripId || undefined,
			pto_message: message,
		});
	};

	//
	// C. Transform data

	const fallback = useMemo(() => (
		<RideAcceptanceJustificationReadOnly
			cause={cause}
			manualTripId={manualTripId}
			message={message}
		/>
	), [cause, manualTripId, message]);

	//
	// D. Render components

	if (!acceptance) return null;

	return (
		<Section gap="md" width="100%">
			<Label size="lg" caps>{t('default:rides.acceptance.RideAcceptanceJustification.title')}</Label>
			<RideAcceptanceStatus grade={acceptance.acceptance_status} />
			<HasPermission
				action={acceptance.acceptance_status !== RideAcceptanceStatusSchema.Values.justification_required ? 'NONE' : PermissionCatalog.all.rides.actions.acceptance_justify}
				fallback={fallback}
				scope={PermissionCatalog.all.rides.scope}
			>
				<RideAcceptanceJustificationEditable
					cause={cause}
					isSubmitting={isJustifying}
					manualTripId={manualTripId}
					message={message}
					onSubmit={handleSubmit}
					setCause={setCause}
					setManualTripId={setManualTripId}
					setMessage={setMessage}
				/>
			</HasPermission>
		</Section>
	);

	//
}
