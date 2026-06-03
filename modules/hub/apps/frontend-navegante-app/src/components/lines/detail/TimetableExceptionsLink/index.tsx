/* * */

import type { ReactElement } from 'react';

import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { type Exception } from '@/types/timetables.types';
import { IconArrowUpRight } from '@tabler/icons-react';
import { Trans, useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	exceptionData: Exception
	selectedExceptionIds: string[]
	setSelectedExceptionIds: (values: string[]) => void
}

/* * */

export function TimetableExceptionsLink({ exceptionData, selectedExceptionIds, setSelectedExceptionIds }: Props) {
	//

	//
	// A. Setup variables

	const linesDetailContext = useLinesDetailContext();
	const { t } = useTranslation('default');

	//
	// B. Transform data

	const isSelected = selectedExceptionIds.includes(exceptionData.exception_id);

	//
	// C. Handle actions

	const handleMouseOverException = () => {
		setSelectedExceptionIds([exceptionData.exception_id]);
	};

	const handleMouseOutException = () => {
		setSelectedExceptionIds([]);
	};

	const handleExceptionClick = () => {
		linesDetailContext.actions.setActivePattern(exceptionData.pattern_version_id);
	};

	//
	// D. Render components

	return (
		<div
			className={`${styles.container} ${isSelected && styles.isSelected} ${!isSelected && selectedExceptionIds.length > 0 && styles.isOthersSelected}`}
			onMouseOut={handleMouseOutException}
			onMouseOver={handleMouseOverException}
		>
			{exceptionData.type === 'variant' && (
				<Trans
					i18nKey={'lines.TimetableExceptionsLink.variant' as never}
					t={t}
					components={[
						<span key="exception-id" className={styles.exceptionId} />,
						<span key="route-long-name" className={styles.routeLongName} />,
						<span key="pattern-headsign" className={styles.patternHeadsign} onClick={handleExceptionClick}>
							<IconArrowUpRight className={styles.icon} />
						</span>,
					] as ReactElement[]}
					values={{
						exception_id: exceptionData.exception_id,
						pattern_headsign: exceptionData.pattern_headsign,
						route_long_name: exceptionData.route_long_name,
					}}
				/>
			)}
		</div>
	);

	//
}
