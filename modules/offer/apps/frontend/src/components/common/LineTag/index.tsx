/* * */

import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { useTypologiesContext } from '@/contexts/Typologies.context';
import { LineDisplay } from '@tmlmobilidade/ui';

/* * */

export function LineTag({ line_id, onClick, withLabel = true }: { line_id: string, onClick?: () => void, withLabel?: boolean }) {
	//

	//
	// A. Setup variables

	const linesList = useLinesListContext();
	const typologiesContext = useTypologiesContext();

	const line = linesList.data.raw.find(line => line._id === line_id);
	const typologyData = typologiesContext.data.raw.find(typology => typology._id === line?.typology);

	//
	// B. Render components

	return (
		<div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
			<LineDisplay
				color={typologyData?.color || 'var(--color-system-text-200)'}
				longName={withLabel ? line?.name : undefined}
				shortName={line?.code}
				textColor={typologyData?.text_color || 'var(--color-system-background-100)'}
			/>
		</div>
	);
}
