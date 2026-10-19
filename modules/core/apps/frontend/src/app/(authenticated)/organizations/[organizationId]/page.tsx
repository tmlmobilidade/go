/* * */

import { OrganizationsDetail } from '@/components/organizations/detail/OrganizationsDetail';
import { OrganizationsDetailFormContextProvider } from '@/components/organizations/detail/OrganizationsDetailForm.context';

/* * */

export default async function Page() {
	return (
		<OrganizationsDetailFormContextProvider>
			<OrganizationsDetail />
		</OrganizationsDetailFormContextProvider>
	);
}
