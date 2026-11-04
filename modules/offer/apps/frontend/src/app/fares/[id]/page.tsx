/* * */

import { FareDetail } from '@/components/fares/detail/FareDetail';
import { FaresDetailFormContextProvider } from '@/components/fares/detail/FaresDetailForm.context';

/* * */

export default async function Page() {
	return (
		<FaresDetailFormContextProvider>
			<FareDetail />
		</FaresDetailFormContextProvider>
	);
}
