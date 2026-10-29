'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { ChangelogSchema } from '@tmlmobilidade/go-types-core';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, openChangelogPreviewModal, PublishStatusDisplay, Spacer, Toolbar, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { usePublicationToggle } from '../../../shared/use-publication-toggle';
import { useChangelogDetailFormContext } from '../ChangelogDetailForm.context';

/* * */

export function ChangelogDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const router = useRouter();
	const { actions, capabilities, data, form, isDirty, publication, status } = useChangelogDetailFormContext();
	const values = useStandardFormWatch({ control: form.control });
	const preview = ChangelogSchema.safeParse({
		...data,
		...values,
		publish_status: 'published',
	});
	const catalog = PermissionCatalog.all.changelogs;
	const handleStatusChange = usePublicationToggle({ canPublishContent: preview.success, kind: 'changelog', onAction: publication.change, status: data?.publish_status });

	//
	// B. Handle actions

	const handleClose = () => router.push(keepUrlParams(PAGE_ROUTES.core.DEV_CHANGELOGS_LIST));

	const handlePreview = () => {
		if (!preview.success) return;
		openChangelogPreviewModal({ release: { ...preview.data, is_seen: false }, title: t('default:dev.actions.preview') });
	};

	//
	// C. Render components

	if (!data) return null;

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={data._id} copyOnClick />
			<PublishStatusDisplay
				disabled={!publication.can_publish || isDirty || publication.is_busy || !!data.is_locked}
				onChange={handleStatusChange}
				value={data.publish_status}
			/>
			<Spacer />
			<Button disabled={!preview.success} label={t('default:dev.actions.preview')} onClick={handlePreview} variant="secondary" />
			<HasPermission action={catalog.actions.update} scope={catalog.scope}>
				<UpdateButton isDisabled={!capabilities.updateEnabled} isLoading={status.isUpdating} onClick={actions.update} />
			</HasPermission>
			<HasPermission action={catalog.actions.delete} scope={catalog.scope}>
				<DeleteButton
					cancelLabel={t('default:dev.actions.cancel')}
					confirmLabel={t('default:dev.actions.delete')}
					confirmMessage={t('default:dev.changelog.detail.ChangelogDetailHeader.deleteConfirmationMessage')}
					confirmTitle={t('default:dev.changelog.detail.ChangelogDetailHeader.deleteConfirmationTitle')}
					isDisabled={!capabilities.deleteEnabled}
					isLoading={status.isDeleting}
					onDelete={actions.delete}
					showConfirmation
				/>
			</HasPermission>
		</Toolbar>
	);
}
