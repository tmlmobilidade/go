'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, LockButton, Spacer, Tag, Toolbar, UpdateButton } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useStopsDetailFormContext } from '../StopsDetailForm.context';
import { useStopsDetailData } from '../use-stops-detail-data';
import { useStopsDetailStopId } from '../use-stops-detail-stop-id';

/* * */

export function StopsDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const router = useRouter();

	const { stopId } = useStopsDetailStopId();

	const { data } = useStopsDetailData();

	const { actions, capabilities, status } = useStopsDetailFormContext();

	//
	// B. Handle actions

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

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.stops.actions.update}
				resourceKey="municipality_ids"
				scope={PermissionCatalog.all.stops.scope}
				value={data?.municipality_id}
			>
				<UpdateButton
					isDisabled={!capabilities.updateEnabled}
					isLoading={status.isUpdating}
					onClick={actions.update}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.stops.actions.lock}
				resourceKey="municipality_ids"
				scope={PermissionCatalog.all.stops.scope}
				value={data?.municipality_id}
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
				resourceKey="municipality_ids"
				scope={PermissionCatalog.all.stops.scope}
				value={data?.municipality_id}
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
