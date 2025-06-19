/* * */

import { AgencyList } from '@/components/agencies/list/AgencyList';
import { PanesManager } from '@tmlmobilidade/ui';

/* * */

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<PanesManager
			panes={[
				<AgencyList />,
				children,
			]}
		/>
	);
}
