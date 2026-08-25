'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { NoDataLabel, Pane, Surface, useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { SchoolCreateSectionAddress } from '../sections/SchoolCreateSectionAddress';
import { SchoolCreateSectionAdministrative } from '../sections/SchoolCreateSectionAdministrative';
import { SchoolCreateSectionGeneral } from '../sections/SchoolCreateSectionGeneral';
import { SchoolCreateSectionOrganization } from '../sections/SchoolCreateSectionOrganization';
import { SchoolCreateFooter } from '../shared/SchoolCreateFooter';
import { SchoolCreateHeader } from '../shared/SchoolCreateHeader';
import { SchoolsCreateFormContextProvider } from '../shared/SchoolsCreateForm.context';

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
				<NoDataLabel text="Selecione um alerta" />
			</Surface>
		);
	}

	return (
		<SchoolsCreateFormContextProvider>
			<Pane
				footer={[<SchoolCreateFooter key="footer" />]}
				header={[<SchoolCreateHeader key="header" />]}
			>
				<SchoolCreateSectionGeneral />
				<SchoolCreateSectionOrganization />
				<SchoolCreateSectionAddress />
				<SchoolCreateSectionAdministrative />
			</Pane>
		</SchoolsCreateFormContextProvider>
	);
}
