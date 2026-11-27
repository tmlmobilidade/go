import { Pane } from '@tmlmobilidade/ui';

import { ZonesExportBody } from '../ZonesExportBody';
import { ZonesExportHeader } from '../ZonesExportHeader';

export function ZonesExport() {
	return (
		<Pane header={[
			<ZonesExportHeader key="header" />,
		]}
		>
			<ZonesExportBody />
		</Pane>
	);
}
