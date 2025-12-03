/* * */

import { UsersDetail } from '@/components/users/detail/UsersDetail';
import { UserDetailContextProvider } from '@/contexts/UserDetail.context';

/* * */

interface Props {
	params: Promise<{ id: string }>
}

/* * */

export default async function Page({ params }: Props) {
	const { id } = await params;
	return (
		<UserDetailContextProvider userId={id}>
			<UsersDetail />
		</UserDetailContextProvider>
	);
}
