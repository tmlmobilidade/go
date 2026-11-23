'use client';

import { LineTag } from '@/components/common/LineTag';
import { useLineDetailContext } from '@/components/lines/detail/LineDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, LockButton, Section, Toolbar, UpdateButton } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function LineDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const router = useRouter();
	const lineDetailContext = useLineDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.offer.LINES_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />

			<Section padding="none">
				<LineTag line_id={lineDetailContext.data.line._id} />
			</Section>

			<HasPermission
				action={PermissionCatalog.all.lines.actions.lock}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.lines.scope}
				value={lineDetailContext.data.line.agency_id}
			>
				<LockButton
					isDisabled={!lineDetailContext.capabilities.lockEnabled}
					isLocked={lineDetailContext.data.line.is_locked}
					onClick={lineDetailContext.actions.lock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.lines.actions.update}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.lines.scope}
				value={lineDetailContext.data.line.agency_id}
			>
				<UpdateButton
					isDisabled={!lineDetailContext.capabilities.updateEnabled}
					isLoading={lineDetailContext.status.isUpdating}
					onClick={lineDetailContext.actions.update}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.lines.actions.delete}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.lines.scope}
				value={lineDetailContext.data.line.agency_id}
			>
				<DeleteButton
					confirmMessage={t('lines:detail.LineDetailHeader.delete_line_message')}
					confirmTitle={t('lines:detail.LineDetailHeader.delete_line')}
					isDisabled={!lineDetailContext.capabilities.deleteEnabled}
					onDelete={lineDetailContext.actions.delete}
					showConfirmation
				/>
			</HasPermission>

		</Toolbar>
	);

	//
}
