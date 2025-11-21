/* * */

import { UsersDetail } from '@/components/users/detail/UsersDetail';
import { UsersDetailContextProvider } from '@/contexts/UsersDetail.context';

/* * */

interface Props {
	params: Promise<{ id: string }>
}

/* * */

export default async function Page({ params }: Props) {
	const { id } = await params;
	return (
		<UsersDetailContextProvider userId={id}>
			<UsersDetail />
		</UsersDetailContextProvider>
	);
}
