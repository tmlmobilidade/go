'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, Spacer, Toolbar, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useHolidaysDetailFormContext } from '../HolidaysDetailForm.context';
import { useHolidaysDetailHolidayId } from '../use-holidays-detail-holiday-id';

/* * */

export function HolidaysDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, capabilities, form, status } = useHolidaysDetailFormContext();
	const title = useStandardFormWatch({ control: form.control, name: 'title' });
	const router = useRouter();
	const { holidayId } = useHolidaysDetailHolidayId();
	const close = () => router.push(keepUrlParams(PAGE_ROUTES.dates.HOLIDAYS_LIST));

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={close} type="close" />
			<IdTag id={holidayId} copyOnClick />
			<Label size="lg" singleLine>{title}</Label>
			<Spacer />
			<HasPermission action={PermissionCatalog.all.holidays.actions.lock} scope={PermissionCatalog.all.holidays.scope}>
				<LockButton isDisabled={!capabilities.lockEnabled} isLoading={status.isLocking} isLocked={!!status.isLocked} onClick={actions.lock} />
			</HasPermission>
			<HasPermission action={PermissionCatalog.all.holidays.actions.update} scope={PermissionCatalog.all.holidays.scope}>
				<UpdateButton isDisabled={!capabilities.updateEnabled} isLoading={status.isUpdating} onClick={actions.update} />
			</HasPermission>
			<HasPermission action={PermissionCatalog.all.holidays.actions.delete} scope={PermissionCatalog.all.holidays.scope}>
				<DeleteButton cancelLabel={t('default:holidays.detail.cancel')} confirmLabel={t('default:holidays.detail.confirm')} confirmMessage={t('default:holidays.detail.confirmMessage')} confirmTitle={t('default:holidays.detail.confirmTitle')} isDisabled={!capabilities.deleteEnabled} isLoading={status.isDeleting} onDelete={actions.delete} showConfirmation />
			</HasPermission>
		</Toolbar>
	);

	//
}
