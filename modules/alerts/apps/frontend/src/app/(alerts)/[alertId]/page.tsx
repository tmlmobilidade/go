/* * */

import { AlertsDetail } from '@/components/detail/AlertsDetail';
import { AlertsDetailFormContextProvider } from '@/components/detail/AlertsDetailForm.context';

/* * */

export default async function Page() {
	return (
		<AlertsDetailFormContextProvider>
			<AlertsDetail />
		</AlertsDetailFormContextProvider>
	);
}
