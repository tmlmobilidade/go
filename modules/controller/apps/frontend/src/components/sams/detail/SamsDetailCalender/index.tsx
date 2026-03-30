/* * */

import { useSamsDetailContext } from '@/contexts/SamsDetail.context';
import { AnalysisCalender } from '@tmlmobilidade/ui';

/* * */

export function SamsDetailCalender() {
	//

	// A. Setup variables

	const samDetailContext = useSamsDetailContext();

	//
	// B. Render component

	return (
		<AnalysisCalender analyses={samDetailContext.data.sam?.analysis ?? []} />
	);
}
