'use client';

import { useRouteCreateContext } from '@/components/routes/create/RouteCreate.context';
import { closeCreateRouteModal } from '@/components/routes/create/RouteCreate.modal';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, CreateButton, HasPermission, Label, Spacer, Tag, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';

/* * */

export function RouteCreateHeader() {
	//

	//
	// A. Setup variables

	const routeCreateContext = useRouteCreateContext();
	const routeCreateContextValues = useStandardFormWatch({ control: routeCreateContext.form.control });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateRouteModal} type="close" />
			<Tag label="Nova Rota" variant="muted" />
			<Label size="lg" singleLine>{routeCreateContextValues.code}</Label>
			<Spacer />
			<HasPermission action={PermissionCatalog.all.lines.actions.create} scope={PermissionCatalog.all.lines.scope}>
				<CreateButton
					isDisabled={!routeCreateContext.capabilities.createEnabled}
					isLoading={routeCreateContext.status.isCreating}
					onClick={routeCreateContext.actions.create}
				/>
			</HasPermission>
		</Toolbar>
	);

	//
}
