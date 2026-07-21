/* * */

import { info } from './logs/info.js';
import { issue } from './logs/issue.js';
import { startLogs } from './logs/start-logs.js';

/* * */

class LoggerClass {
	//

	info: typeof info = info;
	issue: typeof issue = issue;
	startLogs: typeof startLogs = startLogs;

	//
}

/* * */

export const Logger = new LoggerClass();
