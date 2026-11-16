'use client';

import { Divider } from '@tmlmobilidade/ui';

import { RidesExtractV1Footer } from '../RidesExtractV1Footer';
import { RidesExtractV1FormContextProvider } from '../RidesExtractV1Form.context';
import { RidesExtractV1Properties } from '../RidesExtractV1Properties';

/* * */

export function RidesExtractV1() {
	return (
		<RidesExtractV1FormContextProvider>
			<RidesExtractV1Properties />
			<Divider />
			<RidesExtractV1Footer />
		</RidesExtractV1FormContextProvider>
	);
}
