'use client';

/* * */

import { useAnnotationsDetailContext } from '@/components/annotations/detail/AnnotationsDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, CloseButton, DeleteButton, LockButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function AnnotationsDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const annotationsDetailContext = useAnnotationsDetailContext();
	const { t } = useTranslation('dates');

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.dates.ANNOTATIONS_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />

			<Tag label={annotationsDetailContext.data.annotation._id} variant="secondary" />

			<Spacer />

			<LockButton
				isDisabled={!annotationsDetailContext.flags.canLock}
				isLocked={annotationsDetailContext.data.annotation.is_locked}
				onClick={annotationsDetailContext.actions.lock}
			/>

			<Button
				disabled={!annotationsDetailContext.flags.canSave}
				icon={<IconUpload size={28} />}
				label={t('annotations.detail.Header.SaveButton.label')}
				loading={annotationsDetailContext.flags.isSaving}
				onClick={annotationsDetailContext.actions.save}
				variant="primary"
			/>

			<DeleteButton
				confirmMessage={t('annotations.detail.Header.DeleteButton.confirm.message')}
				confirmTitle={t('annotations.detail.Header.DeleteButton.confirm.title')}
				isDisabled={!annotationsDetailContext.flags.canDelete}
				onDelete={annotationsDetailContext.actions.delete}
				showConfirmation
			/>

		</Toolbar>
	);

	//
}
