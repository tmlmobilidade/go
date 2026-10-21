/* * */

import { Pane } from '@tmlmobilidade/ui';

import { PlansSteppExtractBody } from '../PlansSteppExtractBody';
import { PlansSteppExtractHeader } from '../PlansSteppExtractHeader';

/* * */

export function PlansSteppExtract() {
	return (
		<Pane header={[<PlansSteppExtractHeader key="header" />]}>
			<PlansSteppExtractBody />
		</Pane>
	);
}
