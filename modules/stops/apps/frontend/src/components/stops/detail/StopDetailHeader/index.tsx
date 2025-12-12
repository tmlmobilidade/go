'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { BackButton, Button, DeleteButton, HasPermission, keepUrlParams, LockButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function StopDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const stopDetailContext = useStopDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.stops.STOPS_LIST, window.location.search));
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={handleClose} type="close" />
			<Tag label={stopDetailContext.data.stop?._id} variant="secondary" />
			<Spacer />
			<Button
				disabled={!stopDetailContext.data.form.isDirty() || !stopDetailContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Guardar"
				loading={stopDetailContext.flags.isSaving}
				onClick={stopDetailContext.actions.save}
				variant="primary"
			/>
			<HasPermission action={PermissionCatalog.all.stops.actions.lock} scope={PermissionCatalog.all.stops.scope}>
				<LockButton
					isLocked={stopDetailContext.data.stop?.is_locked}
					onClick={stopDetailContext.actions.lock}
				/>
			</HasPermission>
			<DeleteButton
				confirmMessage="Tem a certeza que pretende arquivar esta paragem? A paragem ficará indisponível para utilização futura."
				confirmTitle="Arquivar Paragem"
				onDelete={stopDetailContext.actions.archive}
				showConfirmation={true}
			/>
		</Toolbar>
	);

	//
}
