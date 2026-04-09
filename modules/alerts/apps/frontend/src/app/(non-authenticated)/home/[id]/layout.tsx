/* * */

import { AlertPublicDetailContextProvider } from '@/contexts/AlertPublicDetail.context';
import { AlertsPublicListContextProvider } from '@/contexts/AlertsPublicList.context';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children, params }: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
	//

	//
	// A. Setup variables

	const { id } = await params;

	//
	// B. Render components

	return (
		<AlertsPublicListContextProvider>
			<AlertPublicDetailContextProvider alertId={id}>
				{children}
			</AlertPublicDetailContextProvider>
		</AlertsPublicListContextProvider>
	);
}
