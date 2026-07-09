/* * */

import { issue } from './logs/issue.js';
import { startLogs } from './logs/start-logs.js';

/* * */

class LoggerClass {
	//

	issue: typeof issue = issue;
	startLogs: typeof startLogs = startLogs;

	//
}

/* * */

export const Logger = new LoggerClass();
