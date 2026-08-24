'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { NoDataLabel, Pane, Surface, useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { SchoolCreateFooter } from '../SchoolCreateFooter';
import { SchoolCreateForm } from '../SchoolCreateForm';
import { SchoolCreateFormContextProvider } from '../SchoolCreateForm.context';
import { SchoolCreateHeader } from '../SchoolCreateHeader';

/* * */

export function SchoolCreate() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	const hasPermissionCreate = useMemo(() => {
		return meContext?.actions.hasPermission(PermissionCatalog.all.schools.scope, PermissionCatalog.all.schools.actions.create);
	}, [meContext]);

	//
	// B. Render components

	if (!hasPermissionCreate) {
		return (
			<Surface align="center" justify="center" variant="transparent">
				<NoDataLabel text="Sem permissão para criar escola" />
			</Surface>
		);
	}

	return (
		<SchoolCreateFormContextProvider>

			<Pane
				footer={[<SchoolCreateFooter key="footer" />]}
				header={[<SchoolCreateHeader key="header" />]}
			>
				<SchoolCreateForm />
			</Pane>
		</SchoolCreateFormContextProvider>
	);
}
