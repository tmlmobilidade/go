/* * */

import { HolidaysDetail } from '@/components/holidays/detail/HolidaysDetail';
import { HolidaysDetailFormContextProvider } from '@/components/holidays/detail/HolidaysDetailForm.context';

/* * */

export default async function Page() {
	return (
		<HolidaysDetailFormContextProvider>
			<HolidaysDetail />
		</HolidaysDetailFormContextProvider>
	);
}
