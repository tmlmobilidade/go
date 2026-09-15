/* * */

import { YearPeriodsDetail } from '@/components/year-periods/detail/YearPeriodsDetail';
import { YearPeriodsDetailFormContextProvider } from '@/components/year-periods/detail/YearPeriodsDetailForm.context';

/* * */

export default async function Page() {
	return (
		<YearPeriodsDetailFormContextProvider>
			<YearPeriodsDetail />
		</YearPeriodsDetailFormContextProvider>
	);
}
