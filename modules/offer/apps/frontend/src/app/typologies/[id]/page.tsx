/* * */

import { TypologiesDetailFormContextProvider } from '@/components/typologies/detail/TypologiesDetailForm.context';
import { TypologyDetail } from '@/components/typologies/detail/TypologyDetail';

/* * */

export default async function Page() {
	return (
		<TypologiesDetailFormContextProvider>
			<TypologyDetail />
		</TypologiesDetailFormContextProvider>
	);
}
