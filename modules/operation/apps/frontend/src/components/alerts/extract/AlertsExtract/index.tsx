'use client';

import { Divider, Pane } from '@tmlmobilidade/ui';

import { AlertsExtractFooter } from '../AlertsExtractFooter';
import { AlertsExtractFormContextProvider } from '../AlertsExtractForm.context';
import { AlertsExtractHeader } from '../AlertsExtractHeader';
import { AlertsExtractProperties } from '../AlertsExtractProperties';

/* * */

export function AlertsExtract() {
	return (
		<AlertsExtractFormContextProvider>
			<Pane header={[<AlertsExtractHeader key="header" />]}>
				<AlertsExtractProperties />
				<Divider />
				<AlertsExtractFooter />
			</Pane>
		</AlertsExtractFormContextProvider>
	);
}
