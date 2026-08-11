import { PeriodDatesEditor } from '@/components/year-periods/date-management/PeriodDatesEditor';
import { PeriodDatesEditorContextProvider } from '@/components/year-periods/date-management/PeriodDatesEditor.context';
import { PeriodsDetailContextProvider } from '@/components/year-periods/detail/PeriodsDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	return (
		<PeriodsDetailContextProvider yearPeriodId={id}>
			<PeriodDatesEditorContextProvider>
				<PeriodDatesEditor />
			</PeriodDatesEditorContextProvider>
		</PeriodsDetailContextProvider>
	);
}
