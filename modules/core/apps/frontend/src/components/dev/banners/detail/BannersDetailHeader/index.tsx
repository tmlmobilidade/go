'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { OperationalBannerSchema } from '@tmlmobilidade/go-types-core';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, CloseButton, HasPermission, IdTag, keepUrlParams, openModal, OperationalBannerNotice, PublishStatusDisplay, Spacer, Toolbar, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { usePublicationToggle } from '../../../shared/use-publication-toggle';
import { useBannersDetailFormContext } from '../BannersDetailForm.context';

/* * */

export function BannersDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const router = useRouter();
	const { actions, capabilities, data, form, isDirty, publication, status } = useBannersDetailFormContext();
	const values = useStandardFormWatch({ control: form.control });
	const preview = OperationalBannerSchema.safeParse({
		...data,
		...values,
		published_at: data?.published_at ?? Date.now(),
		published_by: data?.created_by,
		status: 'published',
	});
	const catalog = PermissionCatalog.all.banners;
	const handleStatusChange = usePublicationToggle({ canPublishContent: preview.success, kind: 'banners', onAction: publication.change, status: data?.status });

	//
	// B. Handle actions

	const handleClose = () => router.push(keepUrlParams(PAGE_ROUTES.core.DEV_BANNERS_LIST));

	const handlePreview = () => {
		if (!preview.success) return;
		openModal({
			children: <OperationalBannerNotice banner={preview.data} />,
			size: 'xl',
			title: t('default:dev.actions.preview'),
		});
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
				value={data.status}
			/>
			<Spacer />
			<Button disabled={!preview.success} label={t('default:dev.actions.preview')} onClick={handlePreview} variant="secondary" />
			<HasPermission action={catalog.actions.update} scope={catalog.scope}>
				<UpdateButton isDisabled={!capabilities.updateEnabled} isLoading={status.isUpdating} onClick={actions.update} />
			</HasPermission>
		</Toolbar>
	);
}
