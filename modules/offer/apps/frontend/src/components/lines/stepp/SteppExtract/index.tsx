/* * */

import { SteppExtractBody } from '@/components/lines/stepp/SteppExtractBody';
import { SteppExtractHeader } from '@/components/lines/stepp/SteppExtractHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function SteppExtract() {
	//

	//
	// A. Render components

	return (
		<Pane header={[<SteppExtractHeader key="header" />]}>
			<SteppExtractBody />
		</Pane>
	);
}
