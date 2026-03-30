/* eslint-disable react/jsx-key */
/* * */

import { SamsAnalysisBasicInfos } from '@/components/sams/analysis/SamsAnalysisBasicInfos';
import { SamsAnalysisHeader } from '@/components/sams/analysis/SamsAnalysisHeader';
import { Pane } from '@tmlmobilidade/ui';

export function SamsAnalysis() {
	return (
		<Pane header={[
			<SamsAnalysisHeader />,
		]}
		>
			<SamsAnalysisBasicInfos />
		</Pane>
	);
}

/* * */
