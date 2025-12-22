'use client';

/* * */

import { useAnnotationsDetailContext } from '@/contexts/AnnotationsDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, CloseButton, DeleteButton, HasPermission, LockButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function AnnotationsDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const annotationsDetailContext = useAnnotationsDetailContext();

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

			<HasPermission
				action={PermissionCatalog.all.plans.actions.lock}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.plans.scope}
				value={annotationsDetailContext.data.annotation.agency_ids}
			>
				<LockButton
					isLocked={annotationsDetailContext.data.annotation.is_locked}
					onClick={annotationsDetailContext.actions.toggleLock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.dates.actions.update_annotations}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.dates.scope}
				value={annotationsDetailContext.data.annotation.agency_ids}
			>
				<Button
					disabled={annotationsDetailContext.flags.read_only || annotationsDetailContext.flags.saving || !annotationsDetailContext.data.form.isDirty()}
					icon={<IconUpload size={28} />}
					label="Guardar"
					loading={annotationsDetailContext.flags.saving}
					onClick={annotationsDetailContext.actions.saveAnnotation}
					variant="primary"
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.dates.actions.delete_annotations}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.dates.scope}
				value={annotationsDetailContext.data.annotation.agency_ids}
			>
				<DeleteButton
					confirmMessage="Tem a certeza que deseja apagar esta ocorrência? Esta ação não pode ser revertida."
					confirmTitle="Apagar Anotação"
					onDelete={annotationsDetailContext.actions.deleteAnnotation}
					showConfirmation
				/>
			</HasPermission>

		</Toolbar>
	);

	//
}
