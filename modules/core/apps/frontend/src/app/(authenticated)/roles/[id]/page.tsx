/* * */

import { RoleDetail } from '@/components/roles/detail/RoleDetail';
import { RoleDetailContextProvider } from '@/components/roles/detail/RoleDetail.context';

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
