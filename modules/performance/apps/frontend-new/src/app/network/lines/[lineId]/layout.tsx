/* * */

import { LineScopeContextProvider } from '@/contexts/LineScope.context';
import { type PropsWithChildren } from 'react';

/* * */

interface LayoutProps extends PropsWithChildren {
	params: Promise<{ lineId: string }>
}

/* * */

export default async function Layout({ children, params }: LayoutProps) {
	const { lineId } = await params;

	return (
		<LineScopeContextProvider lineId={lineId}>
			{children}
		</LineScopeContextProvider>
	);
}
