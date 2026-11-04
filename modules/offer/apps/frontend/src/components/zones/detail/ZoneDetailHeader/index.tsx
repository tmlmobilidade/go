'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, Spacer, Toolbar, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useZonesDetailZoneId } from '../use-zones-detail-zone-id';
import { useZonesDetailFormContext } from '../ZonesDetailForm.context';

/* * */

export function ZoneDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, capabilities, form, status } = useZonesDetailFormContext();
	const title = useStandardFormWatch({ control: form.control, name: 'name' });
	const router = useRouter();
	const { zoneId } = useZonesDetailZoneId();
	const close = () => router.push(keepUrlParams(PAGE_ROUTES.offer.ZONES_LIST));

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={close} type="close" />
			<IdTag id={zoneId} copyOnClick />
			<Label size="lg" singleLine>{title}</Label>
			<Spacer />
			<HasPermission action={PermissionCatalog.all.zones.actions.lock} scope={PermissionCatalog.all.zones.scope}>
				<LockButton isDisabled={!capabilities.lockEnabled} isLoading={status.isLocking} isLocked={!!status.isLocked} onClick={actions.lock} />
			</HasPermission>
			<HasPermission action={PermissionCatalog.all.zones.actions.update} scope={PermissionCatalog.all.zones.scope}>
				<UpdateButton isDisabled={!capabilities.updateEnabled} isLoading={status.isUpdating} onClick={actions.update} />
			</HasPermission>
			<HasPermission action={PermissionCatalog.all.zones.actions.delete} scope={PermissionCatalog.all.zones.scope}>
				<DeleteButton cancelLabel={t('default:zones.detail.cancel')} confirmLabel={t('default:zones.detail.confirm')} confirmMessage={t('default:zones.detail.confirmMessage')} confirmTitle={t('default:zones.detail.confirmTitle')} isDisabled={!capabilities.deleteEnabled} isLoading={status.isDeleting} onDelete={actions.delete} showConfirmation />
			</HasPermission>
		</Toolbar>
	);

	//
}
