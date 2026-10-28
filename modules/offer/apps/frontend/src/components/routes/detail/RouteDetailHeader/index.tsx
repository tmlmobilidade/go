'use client';

import { OfferBreadcrumbs } from '@/components/common/OfferBreadcrumbs';
import { useRouteDetailContext } from '@/components/routes/detail/RouteDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, keepUrlParams, LockButton, Section, Toolbar, UpdateButton } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function RouteDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { t } = useTranslation();
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

			<Section padding="none">
				<OfferBreadcrumbs
					items={{
						lineId: routeDetailContext.data.route.line_id,
						routeId: routeDetailContext.data.id,
					}}
				/>
			</Section>

			<HasPermission
				action={PermissionCatalog.all.lines.actions.lock}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.lines.scope}
				value={routeDetailContext.data.line.agency_id}
			>
				<LockButton
					isDisabled={!routeDetailContext.capabilities.lockEnabled}
					isLocked={routeDetailContext.data.route.is_locked || !!routeDetailContext.isLockedByLine}
					onClick={routeDetailContext.actions.lock}
					tooltip={routeDetailContext.isLockedByLine ? t('default:networkLocks.line') : undefined}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.lines.actions.update}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.lines.scope}
				value={routeDetailContext.data.line.agency_id}
			>
				<UpdateButton
					isDisabled={!routeDetailContext.capabilities.updateEnabled}
					isLoading={routeDetailContext.status.isUpdating}
					onClick={routeDetailContext.actions.update}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.lines.actions.delete}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.lines.scope}
				value={routeDetailContext.data.line.agency_id}
			>
				<DeleteButton
					confirmMessage="Tem a certeza que deseja apagar esta rota? Esta ação não pode ser revertida."
					confirmTitle="Apagar Rota"
					isDisabled={!routeDetailContext.capabilities.deleteEnabled}
					onDelete={routeDetailContext.actions.delete}
					showConfirmation
				/>
			</HasPermission>

		</Toolbar>
	);

	//
}
