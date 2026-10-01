/* * */

import { RolesDetail } from '@/components/roles/detail/RolesDetail';
import { RolesDetailFormContextProvider } from '@/components/roles/detail/RolesDetailForm.context';

/* * */

export default async function Page() {
	return (
		<RolesDetailFormContextProvider>
			<RolesDetail />
		</RolesDetailFormContextProvider>
	);
}
