/* * */

import { OrganizationDetail } from '@/components/organizations/detail/OrganizationDetail';
import { OrganizationsDetailContextProvider } from '@/components/organizations/detail/OrganizationDetail.context';

/* * */

interface Props {
	params: Promise<{ id: string }>
}

/* * */

export default async function Page({ params }: Props) {
	const { id } = await params;
	return (
		<OrganizationsDetailContextProvider organization_id={id}>
			<OrganizationDetail />
		</OrganizationsDetailContextProvider>
	);
}
