'use client';

import { SchoolCreateSectionAddress } from '../sections/SchoolCreateSectionAddress';
import { SchoolCreateSectionAdministrative } from '../sections/SchoolCreateSectionAdministrative';
import { SchoolCreateSectionGeneral } from '../sections/SchoolCreateSectionGeneral';
import { SchoolCreateSectionOrganization } from '../sections/SchoolCreateSectionOrganization';
import { type UseSchoolCreateFormReturnType } from '../use-schools-create-form';

/* * */

interface SchoolCreateFormProps {
	form: UseSchoolCreateFormReturnType['form']
}

/* * */

export function SchoolCreateForm({ form }: SchoolCreateFormProps) {
	//

	//
	// A. Render components

	return (
		<>
			<SchoolCreateSectionGeneral form={form} />
			<SchoolCreateSectionOrganization form={form} />
			<SchoolCreateSectionAddress form={form} />
			<SchoolCreateSectionAdministrative form={form} />
		</>
	);
}
