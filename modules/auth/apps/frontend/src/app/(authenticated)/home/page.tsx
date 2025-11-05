'use client';

/* * */

import { HomePage } from '@/components/home/HomePage';
import { OrganizationsDetailContextProvider } from '@/contexts/OrganizationDetail.context';
import { useMeContext } from '@go/ui';

/* * */

export default function Page() {
	//

	//
	// A. Setup variables
	const me = useMeContext();

	//
	// B. Render Components
	return (
		<OrganizationsDetailContextProvider organization_id={me.data.user.organization_id}>
			<HomePage />
		</OrganizationsDetailContextProvider>
	);
}
