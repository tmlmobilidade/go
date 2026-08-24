/* * */

import { UsersDetail } from '@/components/users/detail/UsersDetail';
import { UsersDetailFormContextProvider } from '@/components/users/detail/UsersDetailForm.context';

/* * */

export default async function Page() {
	return (
		<UsersDetailFormContextProvider>
			<UsersDetail />
		</UsersDetailFormContextProvider>
	);
}
