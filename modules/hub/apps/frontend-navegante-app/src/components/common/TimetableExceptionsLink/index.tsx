/* * */

import { useLinesDetailContext } from '@/contexts/LinesDetail.context';
import { type Exception } from '@/types/timetables.types';
import { IconArrowUpRight } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

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

	const t = useTranslations('common.TimetableExceptionsLink');

	const linesDetailContext = useLinesDetailContext();

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
			{exceptionData.type === 'variant' && t.rich('variant', {
				//
				exception_id: exceptionData.exception_id,
				exceptionId: chunks => (
					<span className={styles.exceptionId}>{chunks}</span>
				),
				//
				pattern_headsign: exceptionData.pattern_headsign,
				patternHeadsign: chunks => (
					<span className={styles.patternHeadsign} onClick={handleExceptionClick}>
						{chunks}
						<IconArrowUpRight className={styles.icon} />
					</span>
				),
				//
				route_long_name: exceptionData.route_long_name,
				routeLongName: chunks => (
					<span className={styles.routeLongName}>{chunks}</span>
				),
				//
			})}
		</div>
	);

	//
}
