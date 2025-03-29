/* * */

import { RidesListContextProvider } from '@/contexts/RidesList.context';
// import { NavigationProgress } from '@mantine/nprogress';
import { AppWrapper } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	return (
		<AppWrapper>
			<RidesListContextProvider>
				{/* <NavigationProgress size={5} zIndex={10} /> */}
				{children}
			</RidesListContextProvider>
		</AppWrapper>
	);
}
