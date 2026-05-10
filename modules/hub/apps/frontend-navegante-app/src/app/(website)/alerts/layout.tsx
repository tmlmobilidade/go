/* * */

import { AlertsListContextProvider } from '@/contexts/AlertsList.context';
import { type Metadata } from 'next';

/* * */

export const metadata: Metadata = {
	description: 'Todos os alertas de serviço da CMetropolitana.',
	title: 'CMetropolitana | Alertas',
};

/* * */

export default function Layout({ children }) {
	return (
		<AlertsListContextProvider>
			{children}
		</AlertsListContextProvider>
	);
}
