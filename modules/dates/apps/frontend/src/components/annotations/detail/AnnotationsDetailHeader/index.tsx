'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, Section, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useAnnotationsDetailFormContext } from '../AnnotationsDetailForm.context';
import { useAnnotationsDetailAnnotationId } from '../use-annotations-detail-annotation-id';

/* * */

export function AnnotationsDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, capabilities, form, status } = useAnnotationsDetailFormContext();
	const title = useStandardFormWatch({ control: form.control, name: 'title' });
	const router = useRouter();
	const { annotationId } = useAnnotationsDetailAnnotationId();
	const close = () => router.push(keepUrlParams(PAGE_ROUTES.dates.ANNOTATIONS_LIST));

	//
	// B. Render components

	return (
		<Section alignItems="center" className={styles.header} flexDirection="row" flexWrap="wrap" gap="md">
			<div className={styles.heading}>
				<CloseButton onClick={close} type="close" />
				<IdTag id={annotationId} copyOnClick />
				<div className={styles.title} title={title}>
					<Label size="lg" overflow singleLine>{title}</Label>
				</div>
			</div>
			<div className={styles.actions}>
				<HasPermission action={PermissionCatalog.all.annotations.actions.lock} scope={PermissionCatalog.all.annotations.scope}>
					<LockButton isDisabled={!capabilities.lockEnabled} isLoading={status.isLocking} isLocked={!!status.isLocked} onClick={actions.lock} />
				</HasPermission>
				<HasPermission action={PermissionCatalog.all.annotations.actions.update} scope={PermissionCatalog.all.annotations.scope}>
					<UpdateButton isDisabled={!capabilities.updateEnabled} isLoading={status.isUpdating} onClick={actions.update} />
				</HasPermission>
				<HasPermission action={PermissionCatalog.all.annotations.actions.delete} scope={PermissionCatalog.all.annotations.scope}>
					<DeleteButton cancelLabel={t('default:annotations.detail.cancel')} confirmLabel={t('default:annotations.detail.confirm')} confirmMessage={t('default:annotations.detail.confirmMessage')} confirmTitle={t('default:annotations.detail.confirmTitle')} isDisabled={!capabilities.deleteEnabled} isLoading={status.isDeleting} onDelete={actions.delete} showConfirmation />
				</HasPermission>
			</div>
		</Section>
	);

	//
}
