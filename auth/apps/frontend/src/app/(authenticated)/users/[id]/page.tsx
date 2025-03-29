/* * */

import UserForm from '@/components/UserDetail/UserForm';
import { UserDetailContextProvider } from '@/contexts/UserDetail.context';

/* * */

interface Props {
	params: Promise<{ id: string }>
}

/* * */

export default async function Page({ params }: Props) {
	const { id } = await params;
	return (
		<UserDetailContextProvider user_id={id}>
			<UserForm />
		</UserDetailContextProvider>
	);
}
