/* * */

import { divider } from './logs/divider.js';
import { error } from './logs/error.js';
import { info } from './logs/info.js';
import { init } from './logs/init.js';
import { issue } from './logs/issue.js';
import { progress } from './logs/progress.js';
import { spacer } from './logs/spacer.js';
import { startLogsNextjs } from './logs/start-logs-nextjs.js';
import { startNodeLogs } from './logs/start-node-logs.js';
import { success } from './logs/success.js';
import { terminate } from './logs/terminate.js';
import { title } from './logs/title.js';

/* * */

class LoggerClass {
	//

	divider: typeof divider = divider;
	error: typeof error = error;
	info: typeof info = info;
	init: typeof init = init;
	issue: typeof issue = issue;
	progress: typeof progress = progress;
	spacer: typeof spacer = spacer;
	startLogsNextjs: typeof startLogsNextjs = startLogsNextjs;
	startNodeLogs: typeof startNodeLogs = startNodeLogs;
	success: typeof success = success;
	terminate: typeof terminate = terminate;
	title: typeof title = title;

	//
}

/* * */

export const Logger = new LoggerClass();
