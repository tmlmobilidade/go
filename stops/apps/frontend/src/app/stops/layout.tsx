import { List } from '@/components/List';
import { SearchbarContextProvider } from '@/contexts/Searchbar.context';
import { StopsListContextProvider } from '@/contexts/StopsList.context';
import { PanesManager } from '@tmlmobilidade/ui';

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<PanesManager
			panes={[
				<StopsListContextProvider>
					<SearchbarContextProvider>
						<List />
					</SearchbarContextProvider>
				</StopsListContextProvider>,
				children,
			]}
		/>
	);
}
