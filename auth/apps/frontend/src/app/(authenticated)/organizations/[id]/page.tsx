/* * */

import { OrganizationDetail } from '@/components/organizations/detail/OrganizationDetail';
import { OrganizationsDetailContextProvider } from '@/contexts/OrganizationDetail.context';
import { QuickLinksContextProvider } from '@/contexts/QuickLinks';

/* * */

interface Props {
	params: Promise<{ id: string }>
}

/* * */

export default async function Page({ params }: Props) {
	const { id } = await params;
	return (
		<OrganizationsDetailContextProvider organization_id={id}>
			<QuickLinksContextProvider>
				<OrganizationDetail />
			</QuickLinksContextProvider>
		</OrganizationsDetailContextProvider>
	);
}
