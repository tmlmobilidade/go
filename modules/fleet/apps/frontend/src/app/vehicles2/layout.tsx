/* * */

import { VehiclesList } from '@/components/Vehicles/list/VehiclesList';
import { VehiclesListContextProvider } from '@/components/Vehicles/list/VehiclesList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="vehicles"
			panes={[
				<VehiclesListContextProvider>
					<VehiclesList />
				</VehiclesListContextProvider>,
				children,
			]}
		/>
	);
}
