/* * */

import { AgenciesDetail } from '@/components/agencies/detail/AgenciesDetail';
import { AgenciesDetailFormContextProvider } from '@/components/agencies/detail/AgenciesDetailForm.context';

/* * */

export default async function Page({ params }: { params: Promise<{ agencyId: string }> }) {
	//

	//
	// A. Get the agency ID
	const { agencyId } = await params;

	//
	// B. Render the page
	return (
		<AgenciesDetailFormContextProvider key={agencyId}>
			<AgenciesDetail />
		</AgenciesDetailFormContextProvider>
	);
}
