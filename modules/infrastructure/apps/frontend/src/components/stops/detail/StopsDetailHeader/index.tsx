'use client';

import { useStopsDetailFormContext } from '@/components/stops/detail/StopsDetailForm.context';
import { useStopsDetailData } from '@/components/stops/detail/use-stops-detail-data';
import { useStopsDetailStopId } from '@/components/stops/detail/use-stops-detail-stop-id';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { locationSlotOsmIds } from '@tmlmobilidade/go-types-locations';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type LifecycleStatus } from '@tmlmobilidade/go-types-shared';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, LifecycleStatusDisplay, LockButton, Spacer, Tag, Text, Toolbar, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function StopsDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { t } = useTranslation();
	const { stopId } = useStopsDetailStopId();
	const { data } = useStopsDetailData();
	const { actions, capabilities, form, status } = useStopsDetailFormContext();

	const lifecycleStatus = useStandardFormWatch({ control: form.control, name: 'lifecycle_status' });
	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });

	//
	// B. Handle actions

	const handleUpdateLifecycleStatus = (nextStatus: LifecycleStatus) => {
		form.setValue('lifecycle_status', nextStatus, { shouldDirty: true, shouldValidate: true });
	};

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.infrastructure.STOPS_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={stopId} copyOnClick />

			{data?.is_deleted && <Tag label={t('default:stops.detail.Header.DeletedTag.label')} variant="danger" />}

			<LifecycleStatusDisplay
				disabled={!capabilities.editEnabled}
				onChange={handleUpdateLifecycleStatus}
				value={lifecycleStatus}
			/>

			<Text size="base" weight="semibold">{nameValue}</Text>

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.stops.actions.update}
				resourceKey="location_ids"
				scope={PermissionCatalog.all.stops.scope}
				value={data?.location ? locationSlotOsmIds(data.location) : ''}
			>
				<UpdateButton
					isDisabled={!capabilities.updateEnabled}
					isLoading={status.isUpdating}
					onClick={actions.update}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.stops.actions.lock}
				resourceKey="location_ids"
				scope={PermissionCatalog.all.stops.scope}
				value={data?.location ? locationSlotOsmIds(data.location) : ''}
			>
				<LockButton
					isDisabled={!capabilities.lockEnabled}
					isLoading={status.isLocking}
					isLocked={data?.is_locked}
					onClick={actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.stops.actions.delete}
				resourceKey="location_ids"
				scope={PermissionCatalog.all.stops.scope}
				value={data?.location ? locationSlotOsmIds(data.location) : ''}
			>
				<DeleteButton
					confirmMessage={t('default:stops.detail.Header.DeleteButton.confirm_message')}
					confirmTitle={t('default:stops.detail.Header.DeleteButton.confirm_title')}
					isDeleted={data?.is_deleted}
					isDisabled={!capabilities.deleteEnabled}
					isLoading={status.isDeleting}
					onDelete={actions.delete}
					onRestore={actions.delete}
					showConfirmation
				/>
			</HasPermission>

		</Toolbar>
	);
}
