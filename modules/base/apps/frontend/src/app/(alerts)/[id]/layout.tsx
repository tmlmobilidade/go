/* * */

import { AlertPublicDetailContextProvider } from '@/contexts/AlertPublicDetail.context';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children, params }: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
	const { id } = await params;
	return (
		<AlertPublicDetailContextProvider alertId={id}>
			{children}
		</AlertPublicDetailContextProvider>
	);
}
