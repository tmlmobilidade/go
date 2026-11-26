/* * */

import { GtfsValidationsDetail } from '@/components/validations/detail/GtfsValidationsDetail';
import { ValidationsDetailContextProvider } from '@/components/validations/detail/ValidationsDetailForm.context';

/* * */

export default function Page() {
	return (
		<ValidationsDetailContextProvider>
			<GtfsValidationsDetail />
		</ValidationsDetailContextProvider>
	);
}
