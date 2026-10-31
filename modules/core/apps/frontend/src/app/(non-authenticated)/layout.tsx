/* * */

import { NonAuthenticatedWrapper } from '@/components/background/NonAuthenticatedWrapper';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	return (
		<NonAuthenticatedWrapper>
			{children}
		</NonAuthenticatedWrapper>
	);
}
