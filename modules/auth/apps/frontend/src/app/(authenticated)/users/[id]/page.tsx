/* * */

import { UserDetail } from '@/components/users/detail/UserDetail';
import { UserDetailContextProvider } from '@/components/users/detail/UserDetail.context';

/* * */

interface Props {
	params: Promise<{ id: string }>
}

/* * */

export default async function Page({ params }: Props) {
	const { id } = await params;
	return (
		<UserDetailContextProvider userId={id}>
			<UserDetail />
		</UserDetailContextProvider>
	);
}
