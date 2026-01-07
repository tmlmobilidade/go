'use client';

/* * */

import { useRouteDetailContext } from '@/components/routes/detail/RouteDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, CloseButton, DeleteButton, keepUrlParams, LockButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function RouteDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const routeDetailContext = useRouteDetailContext();

	//
	// B. Handle actions

	const handleGoBack = () => {
		router.push(keepUrlParams(PAGE_ROUTES.offer.LINES_DETAIL(routeDetailContext.data.lineId)));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleGoBack} type="back" />

			<Tag label={routeDetailContext.data.route._id} variant="secondary" />

			<Spacer />

			<LockButton
				isDisabled={!routeDetailContext.flags.canLock}
				isLocked={routeDetailContext.data.route.is_locked}
				onClick={routeDetailContext.actions.lock}
			/>

			<Button
				disabled={!routeDetailContext.flags.canSave}
				icon={<IconUpload size={28} />}
				label="Guardar"
				loading={routeDetailContext.flags.isSaving}
				onClick={routeDetailContext.actions.save}
				variant="primary"
			/>

			<DeleteButton
				confirmMessage="Tem a certeza que deseja apagar esta rota? Esta ação não pode ser revertida."
				confirmTitle="Apagar Rota"
				isDisabled={!routeDetailContext.flags.canDelete}
				onDelete={routeDetailContext.actions.delete}
				showConfirmation
			/>

		</Toolbar>
	);

	//
}
