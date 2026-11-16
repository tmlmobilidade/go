'use client';

import { useRouteCreateContext } from '@/components/routes/create/RouteCreate.context';
import { closeCreateRouteModal } from '@/components/routes/create/RouteCreate.modal';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, CreateButton, HasPermission, Label, Spacer, Tag, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RouteCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const routeCreateContext = useRouteCreateContext();
	const routeCreateContextValues = useStandardFormWatch({ control: routeCreateContext.form.control });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateRouteModal} type="close" />
			<Tag label={t('routes:create.RouteCreateHeader.new_route')} variant="muted" />
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
