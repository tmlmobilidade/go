'use client';

import { AcceptanceStatusTag } from '@/components/common/AcceptanceStatusTag';
import { useRideAcceptanceData } from '@/components/rides/detail/acceptance/use-ride-acceptance-data';
import { IconCheck, IconEdit } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type RideAcceptance, RideAcceptanceStatusSchema } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, HasPermission, IconButton, Section, Select, useHandleAction } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useRidesDetailRideId } from '../../shared/use-rides-detail-ride-id';

/* * */

export function RideAcceptanceStatus({ grade }: { grade: RideAcceptance['acceptance_status'] }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { rideId } = useRidesDetailRideId();
	const { mutate } = useRideAcceptanceData();

	const [isEditing, setIsEditing] = useState(false);
	const [status, setStatus] = useState<RideAcceptance['acceptance_status']>(grade);

	//
	// B. Handle actions

	const { action: handleChangeStatus, isLoading: isChangingStatus } = useHandleAction<RideAcceptance, RideAcceptance['acceptance_status']>({
		fetchFn: async acceptance_status => await fetchApiData<RideAcceptance, { acceptance_status: RideAcceptance['acceptance_status'] }>({
			body: { acceptance_status },
			method: 'PUT',
			url: API_ROUTES.operation.RIDE_ACCEPTANCES_CHANGE_STATUS(rideId),
		}),
		onSuccess: () => {
			mutate();
			setIsEditing(false);
		},
	});

	//
	// C. Render components

	if (isEditing) {
		return (
			<Section alignItems="center" flexDirection="row" gap="xs" padding="none">
				<Select
					clearable={false}
					disabled={isChangingStatus}
					onChange={value => setStatus(value as RideAcceptance['acceptance_status'])}
					value={status}
					w="100%"
					data={RideAcceptanceStatusSchema.options.map(option => ({
						label: t(`ride_status:acceptance_status.${option}`),
						value: option,
					}))}
				/>
				<IconButton
					aria-label={t('default:rides.acceptance.RideAcceptanceStatus.confirm.aria_label')}
					icon={<IconCheck />}
					isDisabled={isChangingStatus}
					onClick={() => handleChangeStatus(status)}
					variant="subtle"
				/>
			</Section>
		);
	}

	return (
		<Section alignItems="center" flexDirection="row" gap="xs" padding="none">
			<AcceptanceStatusTag grade={grade} />
			<HasPermission
				action={PermissionCatalog.all.rides.actions.acceptance_change_status}
				scope={PermissionCatalog.all.rides.scope}
			>
				<IconButton
					aria-label={t('default:rides.acceptance.RideAcceptanceStatus.edit.aria_label')}
					icon={<IconEdit />}
					onClick={() => setIsEditing(true)}
					variant="subtle"
				/>
			</HasPermission>
		</Section>
	);

	//
}
