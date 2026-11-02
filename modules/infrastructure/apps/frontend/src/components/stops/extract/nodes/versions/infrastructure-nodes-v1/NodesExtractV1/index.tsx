'use client';

import { Divider } from '@tmlmobilidade/ui';

import { NodesExtractV1Footer } from '../NodesExtractV1Footer';
import { NodesExtractV1FormContextProvider } from '../NodesExtractV1Form.context';
import { NodesExtractV1Properties } from '../NodesExtractV1Properties';

/* * */

export function NodesExtractV1() {
	return (
		<NodesExtractV1FormContextProvider>
			<NodesExtractV1Properties />
			<Divider />
			<NodesExtractV1Footer />
		</NodesExtractV1FormContextProvider>
	);
}
