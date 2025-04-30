import { ValidationList } from '@/components/validations/list/ValidationsList';
import { ValidationListContextProvider } from '@/contexts/ValidationList.context';

export default function Page() {
	return (
		<ValidationListContextProvider>
			<ValidationList />
		</ValidationListContextProvider>
	);
}
