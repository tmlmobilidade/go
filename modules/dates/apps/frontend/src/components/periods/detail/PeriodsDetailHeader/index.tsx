'use client';

/* * */

import { usePeriodsDetailContext } from '@/components/periods/detail/PeriodsDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, CloseButton, DeleteButton, LockButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function PeriodsDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const periodsDetailContext = usePeriodsDetailContext();
	const { t } = useTranslation('dates');

	//
	// B. Handle actions

	const handleClose = () => {
		const destUrl = keepUrlParams(PAGE_ROUTES.dates.PERIODS_LIST);
		router.push(destUrl);
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />

			<Tag label={periodsDetailContext.data.period._id} variant="secondary" />

			<Spacer />

			<LockButton
				isDisabled={!periodsDetailContext.flags.canLock}
				isLoading={periodsDetailContext.flags.isLocking}
				isLocked={periodsDetailContext.data.period.is_locked}
				onClick={periodsDetailContext.actions.lock}
			/>

			<Button
				disabled={!periodsDetailContext.flags.canSave}
				icon={<IconUpload size={28} />}
				label={t('periods.detail.Header.SaveButton.label')}
				loading={periodsDetailContext.flags.isSaving}
				onClick={periodsDetailContext.actions.save}
				variant="primary"
			/>

			<DeleteButton
				confirmMessage={t('periods.detail.Header.DeleteButton.confirm.message')}
				confirmTitle={t('periods.detail.Header.DeleteButton.confirm.title')}
				isDisabled={!periodsDetailContext.flags.canDelete}
				isLoading={periodsDetailContext.flags.isDeleting}
				onDelete={periodsDetailContext.actions.delete}
				showConfirmation
			/>

		</Toolbar>
	);

	//
}
