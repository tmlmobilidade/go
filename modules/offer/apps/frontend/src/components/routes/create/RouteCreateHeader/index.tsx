'use client';

import { useRouteCreateContext } from '@/components/routes/create/RouteCreate.context';
import { closeCreateRouteModal } from '@/components/routes/create/RouteCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function RouteCreateHeader() {
	//

	//
	// A. Setup variables

	const routeCreateContext = useRouteCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateRouteModal} type="close" />
			<Tag label="Nova Rota" variant="muted" />
			<Label size="lg" singleLine>{routeCreateContext.data.form.values.code}</Label>
			<Spacer />
			<Button
				disabled={!routeCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Publicar"
				loading={routeCreateContext.flags.isSaving}
				onClick={routeCreateContext.actions.create}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
