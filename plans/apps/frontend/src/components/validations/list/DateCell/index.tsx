import { IconArrowRight } from '@tabler/icons-react';
import { OperationalDate } from '@tmlmobilidade/types';
import { Section, Tag } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

export default function DateCell({ date, endDate }: { date: OperationalDate, endDate: OperationalDate }) {
	//

	//
	// A. Render
	return (
		<Section alignItems="center" flexDirection="row" gap="sm">
			<Tag
				label={Dates.fromOperationalDate(date, 'local').toLocaleString(Dates.FORMATS.DATE_SHORT)}
				variant="muted"
			/>
			<IconArrowRight size={16} />
			<Tag
				label={Dates.fromOperationalDate(endDate, 'local').toLocaleString(Dates.FORMATS.DATE_SHORT)}
				variant="muted"
			/>
		</Section>
	);
}
