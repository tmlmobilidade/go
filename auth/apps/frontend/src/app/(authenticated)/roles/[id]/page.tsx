/* * */

import { RoleDetail } from '@/components/roles/detail/RoleDetail';
import { RoleDetailContextProvider } from '@/contexts/RoleDetail.context';

/* * */

interface Props {
	params: Promise<{ id: string }>
}

/* * */

export default async function Page({ params }: Props) {
	const { id } = await params;
	return (
		<RoleDetailContextProvider role_id={id}>
			<RoleDetail />
		</RoleDetailContextProvider>
	);
}
