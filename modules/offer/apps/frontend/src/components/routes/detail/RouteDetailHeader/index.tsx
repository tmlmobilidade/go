'use client';

import { OfferBreadcrumbs } from '@/components/common/OfferBreadcrumbs';
/* * */

import { useRouteDetailContext } from '@/components/routes/detail/RouteDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, CloseButton, DeleteButton, keepUrlParams, LockButton, Toolbar } from '@tmlmobilidade/ui';
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
		router.push(keepUrlParams(PAGE_ROUTES.offer.LINES_DETAIL(routeDetailContext.data.route.line_id)));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleGoBack} type="back" />

			<div style={{ width: '100%' }}>
				<OfferBreadcrumbs
					items={{
						lineId: routeDetailContext.data.route.line_id,
						routeId: routeDetailContext.data.id,
					}}
				/>
			</div>

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
