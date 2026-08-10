/* * */

import { LinesOverview } from '@/components/lines/overview/LinesOverview';
import { LinesOverviewContextProvider } from '@/components/lines/overview/LinesOverview.context';

/* * */

export default async function LinesOverviewPage() {
	return (
		<LinesOverviewContextProvider>
			<LinesOverview />
		</LinesOverviewContextProvider>
	);
}
