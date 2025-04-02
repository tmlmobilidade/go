/* * */

import { RoleList } from '@/components/roles/RoleList';
import { RoleListContextProvider } from '@/contexts/RoleList.context';

/* * */

export default function RoleListPage() {
	return (
		<RoleListContextProvider>
			<RoleList />
		</RoleListContextProvider>
	);
}
