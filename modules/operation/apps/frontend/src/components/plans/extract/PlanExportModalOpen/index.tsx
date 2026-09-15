import { PlanExportModalContextProvider } from '@/components/plans/extract/PlanExportForm.context';
import { MeContextProvider, openModal } from '@tmlmobilidade/ui';

import { PlanExportModal } from '../PlanExtractModal';
import { PLAN_EXPORT_MODAL_ID } from '../PlanExtractModal/constants';

export { PLAN_EXPORT_MODAL_ID } from '../PlanExtractModal/constants';

/* * */

export const openPlanExportModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<PlanExportModalContextProvider>
					<PlanExportModal />
				</PlanExportModalContextProvider>
			</MeContextProvider>
		),
		closeOnClickOutside: false,
		modalId: PLAN_EXPORT_MODAL_ID,
		padding: 0,
		size: 'xl',
		styles: { content: { overflow: 'scroll' } },
		withCloseButton: false,
	});
};
