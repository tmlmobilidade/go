'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, Spacer, Toolbar, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { usePeriodsDetailFormContext } from '../PeriodsDetailForm.context';
import { usePeriodsDetailYearPeriodId } from '../use-periods-detail-year-period-id';

/* * */

export function PeriodsDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, capabilities, form, status } = usePeriodsDetailFormContext();
	const title = useStandardFormWatch({ control: form.control, name: 'name' });
	const router = useRouter();
	const { yearPeriodId } = usePeriodsDetailYearPeriodId();
	const close = () => router.push(keepUrlParams(PAGE_ROUTES.offer.YEAR_PERIODS_LIST));

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={close} type="close" />
			<IdTag id={yearPeriodId} copyOnClick />
			<Label size="lg" singleLine>{title}</Label>
			<Spacer />
			<HasPermission action={PermissionCatalog.all.year_periods.actions.lock} scope={PermissionCatalog.all.year_periods.scope}>
				<LockButton isDisabled={!capabilities.lockEnabled} isLoading={status.isLocking} isLocked={!!status.isLocked} onClick={actions.lock} />
			</HasPermission>
			<HasPermission action={PermissionCatalog.all.year_periods.actions.update} scope={PermissionCatalog.all.year_periods.scope}>
				<UpdateButton isDisabled={!capabilities.updateEnabled} isLoading={status.isUpdating} onClick={actions.update} />
			</HasPermission>
			<HasPermission action={PermissionCatalog.all.year_periods.actions.delete} scope={PermissionCatalog.all.year_periods.scope}>
				<DeleteButton cancelLabel={t('default:periods.detail.cancel')} confirmLabel={t('default:periods.detail.confirm')} confirmMessage={t('default:periods.detail.confirmMessage')} confirmTitle={t('default:periods.detail.confirmTitle')} isDisabled={!capabilities.deleteEnabled} isLoading={status.isDeleting} onDelete={actions.delete} showConfirmation />
			</HasPermission>
		</Toolbar>
	);

	//
}
