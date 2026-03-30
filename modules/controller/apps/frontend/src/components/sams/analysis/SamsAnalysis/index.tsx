/* eslint-disable react/jsx-key */
/* * */

import { SamsAnalysisHeader } from '@/components/sams/analysis/SamsAnalysisHeader';
import { Pane } from '@tmlmobilidade/ui';

export function SamsAnalysis() {
	return (
		<Pane header={[
			<SamsAnalysisHeader />,
		]}
		>
			<div>SamsAnalysis</div>
		</Pane>
	);
}

/* * */
