'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, Spacer, Toolbar, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useTypologiesDetailFormContext } from '../TypologiesDetailForm.context';
import { useTypologiesDetailTypologyId } from '../use-typologies-detail-typology-id';

/* * */

export function TypologyDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, capabilities, form, status } = useTypologiesDetailFormContext();
	const title = useStandardFormWatch({ control: form.control, name: 'name' });
	const router = useRouter();
	const { typologyId } = useTypologiesDetailTypologyId();
	const close = () => router.push(keepUrlParams(PAGE_ROUTES.offer.TYPOLOGIES_LIST));

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={close} type="close" />
			<IdTag id={typologyId} copyOnClick />
			<Label size="lg" singleLine>{title}</Label>
			<Spacer />
			<HasPermission action={PermissionCatalog.all.typologies.actions.lock} scope={PermissionCatalog.all.typologies.scope}>
				<LockButton isDisabled={!capabilities.lockEnabled} isLoading={status.isLocking} isLocked={!!status.isLocked} onClick={actions.lock} />
			</HasPermission>
			<HasPermission action={PermissionCatalog.all.typologies.actions.update} scope={PermissionCatalog.all.typologies.scope}>
				<UpdateButton isDisabled={!capabilities.updateEnabled} isLoading={status.isUpdating} onClick={actions.update} />
			</HasPermission>
			<HasPermission action={PermissionCatalog.all.typologies.actions.delete} scope={PermissionCatalog.all.typologies.scope}>
				<DeleteButton cancelLabel={t('default:typologies.detail.cancel')} confirmLabel={t('default:typologies.detail.confirm')} confirmMessage={t('default:typologies.detail.confirmMessage')} confirmTitle={t('default:typologies.detail.confirmTitle')} isDisabled={!capabilities.deleteEnabled} isLoading={status.isDeleting} onDelete={actions.delete} showConfirmation />
			</HasPermission>
		</Toolbar>
	);

	//
}
