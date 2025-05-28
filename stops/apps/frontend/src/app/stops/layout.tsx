import { Navigation } from '@/components/Navigation';
import { SearchbarContextProvider } from '@/contexts/Searchbar.context';
import { StopsListContextProvider } from '@/contexts/StopsList.context';
import { PanesManager } from '@tmlmobilidade/ui';

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<PanesManager
			panes={[
				<StopsListContextProvider>
					<SearchbarContextProvider>
						<Navigation />
					</SearchbarContextProvider>
				</StopsListContextProvider>,
				children,
			]}
		/>
	);
}
