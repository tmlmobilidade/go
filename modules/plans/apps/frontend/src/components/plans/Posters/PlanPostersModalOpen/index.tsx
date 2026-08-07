import { PlansListContextProvider } from '@/components/plans/list/PlansList.context';
import { PlanPostersExportModal } from '@/components/plans/Posters/PlanPostersModal';
import { PLAN_POSTERS_EXPORT_MODAL_ID } from '@/components/plans/Posters/PlanPostersModal/constants';
import { PlansExportPdfsModalContextProvider } from '@/contexts/PlansExportPdfs.context';
import { ExportsContextProvider, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

export const openPlanPostersExportModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<ExportsContextProvider>
					<PlansListContextProvider>
						<PlansExportPdfsModalContextProvider>
							<PlanPostersExportModal />
						</PlansExportPdfsModalContextProvider>
					</PlansListContextProvider>
				</ExportsContextProvider>
			</MeContextProvider>
		),
		closeOnClickOutside: false,
		modalId: PLAN_POSTERS_EXPORT_MODAL_ID,
		padding: 0,
		size: 'xl',
		styles: { content: { overflow: 'scroll' } },
		withCloseButton: false,
	});
};
