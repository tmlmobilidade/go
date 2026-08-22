/* * */

import { RoleDetailContextProvider } from '@/components/roles/detail/RoleDetail.context';
import { RoleDetail } from '@/components/roles/detail/RolesDetail';

/* * */

interface Props {
	params: Promise<{ id: string }>
}

/* * */

export default async function Page({ params }: Props) {
	const { id } = await params;
	return (
		<RoleDetailContextProvider roleId={id}>
			<RoleDetail />
		</RoleDetailContextProvider>
	);
}
