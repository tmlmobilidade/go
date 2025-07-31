'use client';

/* * */

import { PlansDetailHeader } from '@/components/plans/detail/PlansDetailHeader';
import { PlansDetailSectionAgency } from '@/components/plans/detail/PlansDetailSectionAgency';
import { PlansDetailSectionController } from '@/components/plans/detail/PlansDetailSectionController';
import { PlansDetailSectionFeedInfo } from '@/components/plans/detail/PlansDetailSectionFeedInfo';
import { PlansDetailSectionFiles } from '@/components/plans/detail/PlansDetailSectionFiles';
import { usePlansDetailContext } from '@/contexts/PlansDetail.context';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function PlansDetail() {
	//

	//
	// A. Setup variables

	const plansContext = usePlansDetailContext();

	//
	// B. Render components

	if (plansContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (plansContext.flags.error) {
		return <ErrorDisplay message={plansContext.flags.error.message} />;
	}

	return (
		<Pane header={[<PlansDetailHeader />]}>
			<PlansDetailSectionAgency />
			<PlansDetailSectionFeedInfo />
			<PlansDetailSectionFiles />
			<PlansDetailSectionController />
		</Pane>
	);

	//
}
