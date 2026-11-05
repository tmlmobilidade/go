/* * */

import { BannersDetail } from '@/components/dev/banners/detail/BannersDetail';
import { BannersDetailFormContextProvider } from '@/components/dev/banners/detail/BannersDetailForm.context';

/* * */

export default async function Page() {
	return (
		<BannersDetailFormContextProvider>
			<BannersDetail />
		</BannersDetailFormContextProvider>
	);
}
