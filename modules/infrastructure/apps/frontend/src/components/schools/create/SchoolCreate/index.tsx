'use client';

import { SchoolCreateSectionAddress } from '@/components/schools/create/sections/SchoolCreateSectionAddress';
import { SchoolCreateSectionAdministrative } from '@/components/schools/create/sections/SchoolCreateSectionAdministrative';
import { SchoolCreateSectionEducation } from '@/components/schools/create/sections/SchoolCreateSectionEducation';
import { SchoolCreateSectionGeneral } from '@/components/schools/create/sections/SchoolCreateSectionGeneral';
import { SchoolCreateSectionOperations } from '@/components/schools/create/sections/SchoolCreateSectionOperations';
import { SchoolCreateSectionOrganization } from '@/components/schools/create/sections/SchoolCreateSectionOrganization';
import { SchoolCreateFooter } from '@/components/schools/create/shared/SchoolCreateFooter';
import { SchoolCreateHeader } from '@/components/schools/create/shared/SchoolCreateHeader';
import { SchoolsCreateFormContextProvider } from '@/components/schools/create/shared/SchoolsCreateForm.context';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { NoDataLabel, Pane, Surface, useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function SchoolCreate() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const { t } = useTranslation();

	const hasPermissionCreate = useMemo(() => {
		return meContext?.actions.hasPermission(PermissionCatalog.all.schools.scope, PermissionCatalog.all.schools.actions.create);
	}, [meContext]);

	//
	// B. Render components

	if (!hasPermissionCreate) {
		return (
			<Surface align="center" justify="center" variant="transparent">
				<NoDataLabel text={t('schools:create.SchoolCreate.no_permission')} />
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
				<SchoolCreateSectionEducation />
				<SchoolCreateSectionOperations />
			</Pane>
		</SchoolsCreateFormContextProvider>
	);
}
