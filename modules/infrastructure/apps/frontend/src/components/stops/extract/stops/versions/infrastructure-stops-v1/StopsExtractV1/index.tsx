'use client';

import { Divider } from '@tmlmobilidade/ui';

import { StopsExtractV1Footer } from '../StopsExtractV1Footer';
import { StopsExtractV1FormContextProvider } from '../StopsExtractV1Form.context';
import { StopsExtractV1Properties } from '../StopsExtractV1Properties';

/* * */

export function StopsExtractV1() {
	return (
		<StopsExtractV1FormContextProvider>
			<StopsExtractV1Properties />
			<Divider />
			<StopsExtractV1Footer />
		</StopsExtractV1FormContextProvider>
	);
}
