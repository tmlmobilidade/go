/* * */

import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { useTypologiesContext } from '@/contexts/Typologies.context';
import { LineDisplay } from '@tmlmobilidade/ui';

/* * */

interface LineTagProps {
	color?: string
	line_id: string
	longName?: string
	onClick?: () => void
	shortName?: string
	textColor?: string
	withLabel?: boolean
}

/* * */

export function LineTag(props: LineTagProps) {
	if (props.shortName || props.longName || props.color || props.textColor) {
		return <LineTagDisplay {...props} />;
	}

	return <LineTagFromContext {...props} />;
}

function LineTagFromContext({ line_id, onClick, withLabel = true }: LineTagProps) {
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

function LineTagDisplay({ color, line_id, longName, onClick, shortName, textColor, withLabel = true }: LineTagProps) {
	return (
		<div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
			<LineDisplay
				color={color || 'var(--color-system-text-200)'}
				longName={withLabel ? longName : undefined}
				shortName={shortName || line_id}
				textColor={textColor || 'var(--color-system-background-100)'}
			/>
		</div>
	);
}
