import { PlanPostersExportModal } from '@/components/plans/posters/PlanPostersModal';
import { PLAN_POSTERS_EXPORT_MODAL_ID } from '@/components/plans/posters/PlanPostersModal/constants';
import { PlansExportPdfsModalContextProvider } from '@/contexts/PlansExportPdfs.context';
import { MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

export const openPlanPostersExportModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<PlansExportPdfsModalContextProvider>
					<PlanPostersExportModal />
				</PlansExportPdfsModalContextProvider>
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
