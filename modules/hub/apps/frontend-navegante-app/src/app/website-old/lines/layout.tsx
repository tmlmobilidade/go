/* * */

import { LinesListContextProvider } from '@/contexts/LinesList.context';
import { type Metadata } from 'next';

/* * */

export const metadata: Metadata = {
	description: 'Descubra as linhas de autocarro da CMetropolitana.',
	title: 'CMetropolitana | Linhas',
};

/* * */

export default function Layout({ children }) {
	return (
		<LinesListContextProvider>
			{children}
		</LinesListContextProvider>
	);
}
