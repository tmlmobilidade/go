/* * */

import { NonAuthenticatedWrapper } from '@/components/background/NonAuthenticatedWrapper';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	return (
		<NonAuthenticatedWrapper>
			{children}
		</NonAuthenticatedWrapper>
	);
}
