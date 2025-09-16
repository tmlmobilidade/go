/* * */

import { HomePage } from '@/components/home/HomePage';
import { QuickLinksContextProvider } from '@/contexts/QuickLinks';

/* * */

export default function Page() {
	return (
		<QuickLinksContextProvider>
			<HomePage />
		</QuickLinksContextProvider>
	);
}
