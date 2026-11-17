import { Pane } from '@tmlmobilidade/ui';

import { VehiclesImportBody } from '../VehiclesImportbody';
import { VehiclesImportHeader } from '../VehiclesImportHeader';

/* * */

export function VehicleImport() {
	//

	//
	// A. Render components

	return (
		<Pane header={[
			<VehiclesImportHeader key="header" />,
		]}
		>
			<VehiclesImportBody />
		</Pane>
	);
}
