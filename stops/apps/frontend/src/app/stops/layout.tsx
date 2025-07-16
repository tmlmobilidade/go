import { StopsList } from '@/components/Stops/List/StopsList';
import { StopListContextProvider } from '@/contexts/StopList.context';
import { PanesManager } from '@tmlmobilidade/ui';

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<PanesManager
			panes={[
				<StopListContextProvider>
					<StopsList />
				</StopListContextProvider>,
				children,
			]}
		/>

	);
}
