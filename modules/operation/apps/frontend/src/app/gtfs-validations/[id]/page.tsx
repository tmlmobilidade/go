/* * */

import { ValidationsDetail } from '@/components/validations/detail/ValidationsDetail';
import { ValidationsDetailContextProvider } from '@/components/validations/detail/ValidationsDetailForm.context';

/* * */

export default function Page() {
	return (
		<ValidationsDetailContextProvider>
			<ValidationsDetail />
		</ValidationsDetailContextProvider>
	);
}
