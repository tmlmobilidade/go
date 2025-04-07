/* * */

import { AlertList } from '@/components/list/AlertsList';
import { AlertListContextProvider } from '@/contexts/AlertList.context';

/* * */

export default function Page() {
	return (
		<AlertListContextProvider>
			<AlertList />
		</AlertListContextProvider>
	);
}
