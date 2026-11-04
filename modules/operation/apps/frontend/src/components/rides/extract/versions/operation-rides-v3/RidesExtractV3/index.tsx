'use client';

import { Divider } from '@tmlmobilidade/ui';

import { RidesExtractV3Footer } from '../RidesExtractV3Footer';
import { RidesExtractV3FormContextProvider } from '../RidesExtractV3Form.context';
import { RidesExtractV3Properties } from '../RidesExtractV3Properties';

/* * */

export function RidesExtractV3() {
	return (
		<RidesExtractV3FormContextProvider>
			<RidesExtractV3Properties />
			<Divider />
			<RidesExtractV3Footer />
		</RidesExtractV3FormContextProvider>
	);
}
