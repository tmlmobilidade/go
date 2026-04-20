/* * */

import { AlertPublicDetailContextProvider } from '@/features/alerts-public/contexts/AlertPublicDetail.context';
import { AlertsPublicListContextProvider } from '@/features/alerts-public/contexts/AlertsPublicList.context';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children, params }: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
	const { id } = await params;
	return (
		<AlertsPublicListContextProvider>
			<AlertPublicDetailContextProvider alertId={id}>
				{children}
			</AlertPublicDetailContextProvider>
		</AlertsPublicListContextProvider>
	);
}
