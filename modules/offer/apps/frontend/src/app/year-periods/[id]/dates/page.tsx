import { PeriodDatesEditor } from '@/components/year-periods/date-management/PeriodDatesEditor';
import { PeriodDatesEditorContextProvider } from '@/components/year-periods/date-management/PeriodDatesEditor.context';

/* * */

export default async function Page() {
	return (
		<PeriodDatesEditorContextProvider>
			<PeriodDatesEditor />
		</PeriodDatesEditorContextProvider>
	);
}
