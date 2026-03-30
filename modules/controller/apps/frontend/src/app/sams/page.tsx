/* * */

import { SamsList } from '@/components/sams/list/SamsList';
import { SamsListContextProvider } from '@/contexts/SamsList.context';

/* * */

export default function Page() {
	return (
		<SamsListContextProvider>
			<SamsList />
		</SamsListContextProvider>
	);
}
