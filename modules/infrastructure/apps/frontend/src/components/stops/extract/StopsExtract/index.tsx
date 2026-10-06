'use client';

import { Divider, Pane } from '@tmlmobilidade/ui';

import { StopsExtractFooter } from '../StopsExtractFooter';
import { StopsExtractFormContextProvider } from '../StopsExtractForm.context';
import { StopsExtractHeader } from '../StopsExtractHeader';
import { StopsExtractProperties } from '../StopsExtractProperties';

/* * */

export function StopsExtract() {
	return (
		<StopsExtractFormContextProvider>
			<Pane header={[<StopsExtractHeader key="header" />]}>
				<StopsExtractProperties />
				<Divider />
				<StopsExtractFooter />
			</Pane>
		</StopsExtractFormContextProvider>
	);
}
