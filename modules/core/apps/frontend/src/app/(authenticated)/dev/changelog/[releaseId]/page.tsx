/* * */

import { ChangelogDetail } from '@/components/dev/changelog/detail/ChangelogDetail';
import { ChangelogDetailFormContextProvider } from '@/components/dev/changelog/detail/ChangelogDetailForm.context';

/* * */

export default async function Page() {
	return (
		<ChangelogDetailFormContextProvider>
			<ChangelogDetail />
		</ChangelogDetailFormContextProvider>
	);
}
