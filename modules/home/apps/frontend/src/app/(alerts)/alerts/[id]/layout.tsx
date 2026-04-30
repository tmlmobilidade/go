/* * */

import { AlertDetailContextProvider } from '@/contexts/AlertDetail.context';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children, params }: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
	const { id } = await params;
	return (
		<AlertDetailContextProvider alertId={id}>
			{children}
		</AlertDetailContextProvider>
	);
}
