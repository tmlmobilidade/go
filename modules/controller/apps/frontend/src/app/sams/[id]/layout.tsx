/* * */

import { SamsList } from '@/components/sams/list/SamsList';
import { SamsDetailContextProvider } from '@/contexts/SamsDetail.context';
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

				<SamsDetailContextProvider key="sams-detail" samId={id}>
					{children}
				</SamsDetailContextProvider>,
			]}
		/>
	);
}
