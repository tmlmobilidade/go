/* * */

import { TypologyDetail } from '@/components/typologies/detail/TypologyDetail';
import { TypologyDetailContextProvider } from '@/components/typologies/detail/TypologyDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<TypologyDetailContextProvider typologyId={id}>
			<TypologyDetail />
		</TypologyDetailContextProvider>
	);
}
