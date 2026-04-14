/* * */

import { SamsDetailContextProvider } from '@/contexts/SamsDetail.context';

/* * */

export default async function Layout({ children, params }) {
	const { id } = await params;
	return (
		<SamsDetailContextProvider samId={decodeURIComponent(id)}>
			{children}
		</SamsDetailContextProvider>
	);
}
