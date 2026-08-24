/* * */

import { ValidationsDetail } from '@/components/validations/detail/ValidationsDetail';
import { ValidationsDetailContextProvider } from '@/contexts/ValidationsDetail.context';

/* * */

export default function Page() {
	return (
		<ValidationsDetailContextProvider>
			<ValidationsDetail />
		</ValidationsDetailContextProvider>
	);
}
