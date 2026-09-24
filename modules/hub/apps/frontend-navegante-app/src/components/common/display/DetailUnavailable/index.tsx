'use client';

import { NoDataLabel } from '@/components/common/display/NoDataLabel';
import { useTranslation } from 'react-i18next';

/* * */

interface DetailUnavailableProps {
	reason: 'error' | 'not-found'
}

/* * */

export function DetailUnavailable({ reason }: DetailUnavailableProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<NoDataLabel
			text={t(`default:common.DetailUnavailable.${reason === 'error' ? 'error' : 'not_found'}`)}
			withMinHeight
		/>
	);

	//
}
