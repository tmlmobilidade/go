'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, Spacer, Toolbar, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import { useAnnotationsDetailFormContext } from '../AnnotationsDetailForm.context';
import { useAnnotationsDetailAnnotationId } from '../use-annotations-detail-annotation-id';

/* * */

export function AnnotationsDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { annotationId } = useAnnotationsDetailAnnotationId();

	const { actions, capabilities, form, status } = useAnnotationsDetailFormContext();

	const titleValue = useStandardFormWatch({ control: form.control, name: 'title' });

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
			<IdTag id={annotationId} copyOnClick />
			<Label size="lg" singleLine>{titleValue}</Label>

			<Spacer />

			<HasPermission action={PermissionCatalog.all.annotations.actions.update} scope={PermissionCatalog.all.annotations.scope}>
				<UpdateButton
					isDisabled={!capabilities.updateEnabled}
					isLoading={status.isUpdating}
					onClick={actions.update}
				/>
			</HasPermission>

			<HasPermission action={PermissionCatalog.all.annotations.actions.lock} scope={PermissionCatalog.all.annotations.scope}>
				<LockButton
					isDisabled={!capabilities.lockEnabled}
					isLoading={status.isLocking}
					isLocked={status.isLocked ?? false}
					onClick={actions.lock}
				/>
			</HasPermission>

			<HasPermission action={PermissionCatalog.all.annotations.actions.delete} scope={PermissionCatalog.all.annotations.scope}>
				<DeleteButton
					confirmMessage="Tem a certeza que deseja apagar esta anotação? Esta ação não pode ser revertida."
					confirmTitle="Apagar Anotação"
					isDisabled={!capabilities.deleteEnabled}
					isLoading={status.isDeleting}
					onDelete={actions.delete}
					showConfirmation
				/>
			</HasPermission>

		</Toolbar>
	);
}
