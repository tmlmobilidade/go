/* * */

import { PeriodsDetail } from '@/components/year-periods/detail/PeriodsDetail';
import { PeriodsDetailFormContextProvider } from '@/components/year-periods/detail/PeriodsDetailForm.context';

/* * */

export default async function Page() {
	return (
		<PeriodsDetailFormContextProvider>
			<PeriodsDetail />
		</PeriodsDetailFormContextProvider>
	);
}
