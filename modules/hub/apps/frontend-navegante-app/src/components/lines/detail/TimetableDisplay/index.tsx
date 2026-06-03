'use client';

/* * */

import { TimetableExceptions } from '@/components/lines/detail/TimetableExceptions';
import { TimetableSchedules } from '@/components/lines/detail/TimetableSchedules';
import { type Timetable } from '@tmlmobilidade/types';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */

interface Props {
	timetableData: Timetable
}

/* * */

export function TimetableDisplay({ timetableData }: Props) {
	//

	//
	// A. Setup variables

	const [selectedExceptionIds, setSelectedExceptionIds] = useState<string[]>([]);

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<TimetableSchedules selectedExceptionIds={selectedExceptionIds} setSelectedExceptionIds={setSelectedExceptionIds} timetableData={timetableData} />
			<TimetableExceptions selectedExceptionIds={selectedExceptionIds} setSelectedExceptionIds={setSelectedExceptionIds} timetableData={timetableData} />
		</div>
	);

	//
}
