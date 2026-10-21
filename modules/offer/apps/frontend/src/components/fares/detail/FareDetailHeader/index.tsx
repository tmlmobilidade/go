'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, Spacer, Toolbar, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useFaresDetailFormContext } from '../FaresDetailForm.context';
import { useFaresDetailFareId } from '../use-fares-detail-fare-id';

/* * */

export function FareDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, capabilities, form, status } = useFaresDetailFormContext();
	const title = useStandardFormWatch({ control: form.control, name: 'name' });
	const router = useRouter();
	const { fareId } = useFaresDetailFareId();
	const close = () => router.push(keepUrlParams(PAGE_ROUTES.offer.FARES_LIST));

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={close} type="close" />
			<IdTag id={fareId} copyOnClick />
			<Label size="lg" singleLine>{title}</Label>
			<Spacer />
			<HasPermission action={PermissionCatalog.all.fares.actions.lock} scope={PermissionCatalog.all.fares.scope}>
				<LockButton isDisabled={!capabilities.lockEnabled} isLoading={status.isLocking} isLocked={!!status.isLocked} onClick={actions.lock} />
			</HasPermission>
			<HasPermission action={PermissionCatalog.all.fares.actions.update} scope={PermissionCatalog.all.fares.scope}>
				<UpdateButton isDisabled={!capabilities.updateEnabled} isLoading={status.isUpdating} onClick={actions.update} />
			</HasPermission>
			<HasPermission action={PermissionCatalog.all.fares.actions.delete} scope={PermissionCatalog.all.fares.scope}>
				<DeleteButton cancelLabel={t('default:fares.detail.cancel')} confirmLabel={t('default:fares.detail.confirm')} confirmMessage={t('default:fares.detail.confirmMessage')} confirmTitle={t('default:fares.detail.confirmTitle')} isDisabled={!capabilities.deleteEnabled} isLoading={status.isDeleting} onDelete={actions.delete} showConfirmation />
			</HasPermission>
		</Toolbar>
	);

	//
}
