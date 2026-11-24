'use client';

import { AcceptanceStatusTag } from '@/components/common/AcceptanceStatusTag';
import { useRideAcceptanceData } from '@/components/rides/detail/acceptance/use-ride-acceptance-data';
import { IconCheck, IconClock, IconEdit } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type RideAcceptance, RideAcceptanceStatusSchema } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, IconButton, Section, Select, Tag, useHandleAction, useMeUser } from '@tmlmobilidade/ui';
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
	const { data: me } = useMeUser();

	const [isEditing, setIsEditing] = useState(false);
	const [status, setStatus] = useState<RideAcceptance['acceptance_status']>(grade);

	//
	// B. Transform data

	const { actions, scope } = PermissionCatalog.all.rides;
	const canChangeStatus = PermissionCatalog.hasPermission(me?.permissions, scope, actions.acceptance_change_status);
	const canReopen = grade === 'under_review' && PermissionCatalog.hasPermission(me?.permissions, scope, actions.acceptance_justify);
	const canEdit = canChangeStatus || canReopen;
	const statusOptions: readonly RideAcceptance['acceptance_status'][] = canChangeStatus ? RideAcceptanceStatusSchema.options : ['justification_required'];
	const selectedStatus = canChangeStatus ? status : 'justification_required';

	//
	// C. Handle actions

	const { action: handleChangeStatus, isLoading: isChangingStatus } = useHandleAction<RideAcceptance, RideAcceptance['acceptance_status']>({
		fetchFn: async acceptance_status => await fetchApiData<RideAcceptance, { acceptance_status: RideAcceptance['acceptance_status'] }>({
			body: { acceptance_status },
			method: 'PUT',
			url: API_ROUTES.operation.RIDE_ACCEPTANCES_CHANGE_STATUS(rideId),
		}),
		onSuccess: (response) => {
			mutate(response);
			setIsEditing(false);
		},
	});

	//
	// D. Render components

	if (isEditing && canEdit) {
		return (
			<Section alignItems="center" flexDirection="row" gap="xs" padding="none" width="auto">
				<Select
					clearable={false}
					disabled={isChangingStatus}
					onChange={value => setStatus(value as RideAcceptance['acceptance_status'])}
					value={selectedStatus}
					w="100%"
					data={statusOptions.map(option => ({
						label: t(`ride_status:acceptance_status.${option}`),
						value: option,
					}))}
				/>
				<IconButton
					icon={<IconCheck />}
					isDisabled={isChangingStatus}
					onClick={() => handleChangeStatus(selectedStatus)}
					tooltip={t('default:rides.acceptance.RideAcceptanceStatus.confirm.aria_label')}
					variant="subtle"
				/>
			</Section>
		);
	}

	return (
		<Section alignItems="center" flexDirection="row" gap="xs" padding="none" width="auto">
			{grade === 'under_review'
				? <Tag icon={<IconClock />} label={t('ride_status:acceptance_status.under_review')} variant="warning" />
				: <AcceptanceStatusTag grade={grade} />}
			{canEdit && (
				<IconButton
					icon={<IconEdit />}
					tooltip={t('default:rides.acceptance.RideAcceptanceStatus.edit.aria_label')}
					variant="subtle"
					onClick={() => {
						setStatus(grade);
						setIsEditing(true);
					}}
				/>
			)}
		</Section>
	);

	//
}
