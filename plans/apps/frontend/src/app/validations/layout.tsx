import { ValidationList } from '@/components/validations/list/ValidationsList';
import { ValidationListContextProvider } from '@/contexts/ValidationList.context';
import { PanesManager } from '@tmlmobilidade/ui';

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<PanesManager
			panes={[
				<ValidationListContextProvider>
					<ValidationList />
				</ValidationListContextProvider>,
				children,
			]}
		/>
	);
}
