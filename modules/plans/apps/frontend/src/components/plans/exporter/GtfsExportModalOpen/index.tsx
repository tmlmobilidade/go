import { GtfsExportModalContextProvider } from '@/contexts/GtfsExport.context';
import { ExportsContextProvider, MeContextProvider, openModal } from '@tmlmobilidade/ui';

import { PlansListContextProvider } from '../../list/PlansList.context';
import { GtfsExportModal } from '../GtfsExportModal';
import { GTFS_EXPORT_MODAL_ID } from '../GtfsExportModal/constants';

export { GTFS_EXPORT_MODAL_ID } from '../GtfsExportModal/constants';

/* * */

export const openGtfsExportModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<ExportsContextProvider>
					<PlansListContextProvider>
						<GtfsExportModalContextProvider>
							<GtfsExportModal />
						</GtfsExportModalContextProvider>
					</PlansListContextProvider>
				</ExportsContextProvider>
			</MeContextProvider>
		),
		closeOnClickOutside: false,
		modalId: GTFS_EXPORT_MODAL_ID,
		padding: 0,
		size: 'xl',
		styles: { content: { overflow: 'scroll' } },
		withCloseButton: false,
	});
};
