/* * */

import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { LineDisplay } from '@tmlmobilidade/ui';

/* * */

interface LinesListCellCodeProps {
	code: string
	typology_id: string
}

/* * */

export function LinesListCellCode({ code, typology_id }: LinesListCellCodeProps) {
	//

	//
	// A. Setup variables

	const linesList = useLinesListContext();
	const typologyData = linesList.data.typologyData.find(typology => typology._id === typology_id);

	//
	// B. Render components

	return (
		<LineDisplay
			color={typologyData?.color || 'var(--color-system-text-200)'}
			shortName={code}
			textColor={typologyData?.text_color || 'var(--color-system-background-100)'}
		/>
	);
}
