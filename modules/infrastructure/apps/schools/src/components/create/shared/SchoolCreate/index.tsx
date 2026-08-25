'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { NoDataLabel, Pane, Surface, useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { SchoolCreateFooter } from '../SchoolCreateFooter';
import { SchoolCreateForm } from '../SchoolCreateForm';
import { SchoolCreateHeader } from '../SchoolCreateHeader';
import { useSchoolsCreateForm } from '../use-schools-create-form';

/* * */

export function SchoolCreate() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	const hasPermissionCreate = useMemo(() => {
		return meContext?.actions.hasPermission(PermissionCatalog.all.schools.scope, PermissionCatalog.all.schools.actions.create);
	}, [meContext]);

	const schoolCreateForm = useSchoolsCreateForm();

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
		<Pane
			footer={[<SchoolCreateFooter key="footer" form={schoolCreateForm.form} unblock={schoolCreateForm.unblock} />]}
			header={[<SchoolCreateHeader key="header" />]}
		>
			<SchoolCreateForm form={schoolCreateForm.form} />
		</Pane>
	);
}
