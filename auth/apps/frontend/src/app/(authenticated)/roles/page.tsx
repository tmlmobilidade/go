import RoleList from '@/components/RoleList';
import { RoleListContextProvider } from '@/contexts/RoleList.context';

export default function RoleListPage() {
	return (
		<RoleListContextProvider>
			<RoleList />
		</RoleListContextProvider>
	);
}
