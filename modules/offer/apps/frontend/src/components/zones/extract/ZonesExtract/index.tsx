'use client';

import { Divider, Pane } from '@tmlmobilidade/ui';

import { ZonesExtractFooter } from '../ZonesExtractFooter';
import { ZonesExtractFormContextProvider } from '../ZonesExtractForm.context';
import { ZonesExtractHeader } from '../ZonesExtractHeader';
import { ZonesExtractProperties } from '../ZonesExtractProperties';

/* * */

export function ZonesExtract() {
	return (
		<ZonesExtractFormContextProvider>
			<Pane header={[<ZonesExtractHeader key="header" />]}>
				<ZonesExtractProperties />
				<Divider />
				<ZonesExtractFooter />
			</Pane>
		</ZonesExtractFormContextProvider>
	);
}
