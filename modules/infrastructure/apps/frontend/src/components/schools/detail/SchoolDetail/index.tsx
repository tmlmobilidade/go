'use client';

import { SchoolDetailSectionAddress } from '@/components/schools/detail/sections/SchoolDetailSectionAddress';
import { SchoolDetailSectionAdministrative } from '@/components/schools/detail/sections/SchoolDetailSectionAdministrative';
import { SchoolDetailSectionEducation } from '@/components/schools/detail/sections/SchoolDetailSectionEducation';
import { SchoolDetailSectionGeneral } from '@/components/schools/detail/sections/SchoolDetailSectionGeneral';
import { SchoolDetailSectionOperations } from '@/components/schools/detail/sections/SchoolDetailSectionOperations';
import { SchoolDetailSectionOrganization } from '@/components/schools/detail/sections/SchoolDetailSectionOrganization';
import { SchoolDetailFootnote } from '@/components/schools/detail/SchoolDetailFootnote';
import { SchoolDetailHeader } from '@/components/schools/detail/SchoolDetailHeader';
import { useSchoolsDetailFormContext } from '@/components/schools/detail/SchoolsDetailForm.context';
import { useSchoolsDetailSchoolData } from '@/components/schools/detail/use-schools-detail-school-data';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function SchoolDetail() {
	//

	//
	// A. Setup variables

	const { status } = useSchoolsDetailFormContext();

	const { error } = useSchoolsDetailSchoolData();

	//
	// B. Render components

	if (status.isLoading) {
		return <LoadingOverlay />;
	}

	if (error) {
		return <ErrorDisplay message={error} />;
	}

	return (
		<Pane header={[<SchoolDetailHeader key="header" />]}>
			<SchoolDetailSectionGeneral />
			<SchoolDetailSectionOrganization />
			<SchoolDetailSectionAddress />
			<SchoolDetailSectionAdministrative />
			<SchoolDetailSectionEducation />
			<SchoolDetailSectionOperations />
			<SchoolDetailFootnote />
		</Pane>
	);
}
