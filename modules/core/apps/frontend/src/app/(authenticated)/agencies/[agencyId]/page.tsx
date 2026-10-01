/* * */

import { AgenciesDetail } from '@/components/agencies/detail/AgenciesDetail';
import { AgenciesDetailFormContextProvider } from '@/components/agencies/detail/AgenciesDetailForm.context';

/* * */

export default async function Page() {
	return (
		<AgenciesDetailFormContextProvider>
			<AgenciesDetail />
		</AgenciesDetailFormContextProvider>
	);
}
