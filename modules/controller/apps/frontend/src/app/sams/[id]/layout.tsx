/* * */

import { SamsList } from '@/components/sams/list/SamsList';
import { SamsAnalysisContextProvider } from '@/contexts/SamsAnalysis.context';
import { SamsListContextProvider } from '@/contexts/SamsList.context';
import { PanesManager } from '@tmlmobilidade/ui';

/* * */

export default async function Layout({ children, params }) {
	const { id } = await params;
	return (
		<PanesManager
			id="sams"
			panes={[
				<SamsListContextProvider key="sams-list">
					<SamsList />
				</SamsListContextProvider>,

				<SamsAnalysisContextProvider key="sams-analysis" samId={Number(id)}>
					{children}
				</SamsAnalysisContextProvider>,
			]}
		/>
	);
}
