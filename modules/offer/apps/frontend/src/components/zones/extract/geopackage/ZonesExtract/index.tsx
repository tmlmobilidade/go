import { Pane } from '@tmlmobilidade/ui';

import { ZonesExtractBody } from '../ZonesExtractBody';
import { ZonesExtractHeader } from '../ZonesExtractHeader';

export function ZonesExtract() {
	return (
		<Pane header={[
			<ZonesExtractHeader key="header" />,
		]}
		>
			<ZonesExtractBody />
		</Pane>
	);
}
