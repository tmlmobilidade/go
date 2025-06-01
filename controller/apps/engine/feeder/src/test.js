import { OPERATIONAL_DATE_FORMAT } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';
import { DateTime } from 'luxon';

// const result1 = Dates
// 	.fromFormat('20250501', OPERATIONAL_DATE_FORMAT)
// 	.setZone('Asia/Choibalsan', { keepLocalTime: true })
// 	.set({ hour: 4 });
// 	// .setZone('Asia/Choibalsan');

const finalResult = Dates
	.fromOperationalDate('20250501')
	.set({ hour: 4 })
	.setZone('Asia/Choibalsan');

// const result = DateTime
// 	.fromISO(result1.iso)
// 	.set({ hour: 4 });

console.log('finalResult', finalResult);
// console.log('result', result);

// console.log({
// 	iso: result.iso,
// 	unix_timestamp: result.unix_timestamp,
// });
