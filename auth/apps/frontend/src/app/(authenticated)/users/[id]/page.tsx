/* * */

import { UsersDetail } from '@/components/users/UsersDetail';
import { UsersDetailContextProvider } from '@/contexts/UsersDetail.context';

/* * */

interface Props {
	params: Promise<{ id: string }>
}

/* * */

export default async function Page({ params }: Props) {
	const { id } = await params;
	return (
		<UsersDetailContextProvider user_id={id}>
			<UsersDetail />
		</UsersDetailContextProvider>
	);
}
