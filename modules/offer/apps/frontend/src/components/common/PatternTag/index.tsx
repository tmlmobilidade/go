/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { Tag } from '@tmlmobilidade/ui';

/* * */

export function PatternTag({ onClick, pattern_id }: { onClick?: () => void, pattern_id: string }) {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();
	const patternCode = patternDetailContext.data.pattern?._id === pattern_id
		? patternDetailContext.data.pattern.code
		: pattern_id;

	//
	// B. Render components

	return <Tag label={patternCode} onClick={onClick} />;

	//
}
