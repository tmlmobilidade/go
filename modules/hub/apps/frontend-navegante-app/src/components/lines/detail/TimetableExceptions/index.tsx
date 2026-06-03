/* * */

import type { Timetable } from '@/types/timetables.types';

import { TimetableExceptionsLink } from '@/components/lines/detail/TimetableExceptionsLink';

import styles from './styles.module.css';

/* * */

interface Props {
	selectedExceptionIds: string[]
	setSelectedExceptionIds: (values: string[]) => void
	timetableData: Timetable
}

/* * */

export function TimetableExceptions({ selectedExceptionIds, setSelectedExceptionIds, timetableData }: Props) {
	//

	if (!timetableData.exceptions.length) {
		return null;
	}

	return (
		<div className={styles.container}>
			{timetableData.exceptions.map(exceptionData => (
				<TimetableExceptionsLink key={exceptionData.exception_id} exceptionData={exceptionData} selectedExceptionIds={selectedExceptionIds} setSelectedExceptionIds={setSelectedExceptionIds} />
			))}
		</div>
	);

	//
}
