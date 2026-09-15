/* * */

import { SamsDetailContextProvider } from '@/contexts/SamDetail.context';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children, params }: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
	const { id } = await params;
	return (
		<SamsDetailContextProvider samId={decodeURIComponent(id)}>
			{children}
		</SamsDetailContextProvider>
	);
}
