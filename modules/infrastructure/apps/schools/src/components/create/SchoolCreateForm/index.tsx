'use client';

import { Divider } from '@tmlmobilidade/ui';

import { SchoolCreateSectionAdministrative } from '../sections/SchoolCreateSectionAdministrative';
import { SchoolCreateSectionAddress } from '../sections/SchoolCreateSectionAddress';
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
			<Divider />
			<SchoolCreateSectionOrganization form={form} />
			<Divider />
			<SchoolCreateSectionAddress form={form} />
			<Divider />
			<SchoolCreateSectionAdministrative form={form} />
		</>
	);
}
