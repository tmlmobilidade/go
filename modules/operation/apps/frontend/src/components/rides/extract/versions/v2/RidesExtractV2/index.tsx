'use client';

import { Divider } from '@tmlmobilidade/ui';

import { RidesExtractV2Footer } from '../RidesExtractV2Footer';
import { RidesExtractV2FormContextProvider } from '../RidesExtractV2Form.context';
import { RidesExtractV2Properties } from '../RidesExtractV2Properties';

/* * */

export function RidesExtractV2() {
	return (
		<RidesExtractV2FormContextProvider>
			<RidesExtractV2Properties />
			<Divider />
			<RidesExtractV2Footer />
		</RidesExtractV2FormContextProvider>
	);
}
