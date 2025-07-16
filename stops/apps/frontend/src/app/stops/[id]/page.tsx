/* * */

// import { StopsList } from '@/components/Stops/List/StopsList';
// import { StopListContextProvider } from '@/contexts/StopList.context';

/* * */

interface Props {
	params: Promise<{ id: string }>
}

/* * */

export default async function Page({ params }: Props) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { id } = await params;
	return (
		// <StopListContextProvider>
		// 	<StopsList />
		// </StopListContextProvider>
		<p>nice</p>
	);
}
