/* * */

/**
 * Formats a Fastify/Pino log line for local development.
 * Colored one-line output with reqId, status, method, path and message.
 */
export function formatDevMessage(
	log: Record<string, unknown>,
	messageKey: string,
	colors: {
		blueBright: (text: string) => string
		cyanBright: (text: string) => string
		gray: (text: string) => string
		greenBright: (text: string) => string
		red: (text: string) => string
		redBright: (text: string) => string
		whiteBright: (text: string) => string
		yellowBright: (text: string) => string
	},
): string {
	const c = colors;

	const palette = {
		error: c.redBright,
		highlight: c.yellowBright,
		message: c.whiteBright,
		method: c.greenBright,
		methodLabel: c.gray,
		path: c.blueBright,
		pathLabel: c.gray,
		pipe: c.cyanBright,
		reqId: c.cyanBright,
		reqIdLabel: c.gray,
		stack: c.red,
		status: c.yellowBright,
		statusLabel: c.gray,
		timestamp: c.cyanBright,
	};

	const colorize = (text: string) => {
		const urlPattern = /(https?:\/\/[^\s]+)/g;
		const routePattern = /Route "(.+?)"/g;
		const pathPattern = /([A-Z]+):\/[^\s]+/g;

		return text
			.replace(urlPattern, palette.highlight('$&'))
			.replace(routePattern, (_, r) => palette.highlight(`Route "${r}"`))
			.replace(pathPattern, palette.highlight('$&'));
	};

	const safe = (val: unknown, fallback = '') =>
		typeof val === 'string' || typeof val === 'number' ? String(val) : fallback;

	const formatMethod = (method?: string) => {
		if (!method) return '-----';
		if (method === 'GET' || method === 'PUT') return `${method}  `;
		return method.padEnd(5, '-');
	};

	const timestamp = new Date(log.time as string).toLocaleString('pt-PT', {
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		month: '2-digit',
		second: '2-digit',
		year: 'numeric',
	});

	const reqId = log.reqId ? safe(log.reqId).padEnd(10, ' ') : Array(10).fill('-').join('');

	const statusCode = typeof log.res === 'object' && log.res && 'statusCode' in log.res ? safe(log.res.statusCode).padEnd(3, '-') : '---';

	const method = typeof log.req === 'object' && log.req && 'method' in log.req ? formatMethod((log.req.method as string) ?? '') : '-----';

	const path = typeof log.req === 'object' && log.req && 'url' in log.req ? safe(log.req.url).padEnd(10, ' ') : '-----';

	// Pino serializes errors, so log.err is an object with type, message, stack, etc.
	const errorObj = log.err || log.error;
	let errorMessage = safe(log[messageKey]);
	let errorStack: string | undefined;

	if (errorObj) {
		errorMessage = (errorObj as Error).message || errorMessage;
		errorStack = (errorObj as Error).stack;
	} else if (log[messageKey] instanceof Error) {
		errorMessage = (log[messageKey] as unknown as Error).message || errorMessage;
		errorStack = (log[messageKey] as Error).stack;
	}

	const message = palette.message(colorize(errorMessage));
	const stackTrace = errorStack ? `\n${palette.stack(errorStack.split('\n').map(line => `  ${line}`).join('\n'))}` : '';

	const parts = [
		palette.timestamp(timestamp),
		palette.reqIdLabel(`reqId: ${palette.reqId(reqId)}`),
		palette.statusLabel(`statusCode: ${palette.status(statusCode)}`),
		palette.methodLabel(`Method: ${palette.method(method)}`),
		palette.pathLabel(`Path: ${palette.path(path)}`),
		message,
	];

	return palette.pipe(parts.join(' | ')) + stackTrace;
}
