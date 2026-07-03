/* eslint-disable @typescript-eslint/naming-convention */
/* * */

import '@fastify/cors';
import '@fastify/cookie';
import '@fastify/multipart';

/* * */

import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import oneLineLogger from '@fastify/one-line-logger';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger';
import { HttpResponse, WithPagination } from '@tmlmobilidade/utils';
import fastify, { FastifyLoggerOptions } from 'fastify';
import { type FastifyInstance as FastifyInstanceType, type FastifyReply as FastifyReplyType } from 'fastify';
import { type ContextConfigDefault, type FastifyBaseLogger, type FastifySchema, type FastifyServerOptions, type FastifyTypeProviderDefault, type RawReplyDefaultExpression, type RawRequestDefaultExpression, type RawServerBase, type RawServerDefault, type RouteGenericInterface } from 'fastify';

/* * */

export { type FastifyRequest } from 'fastify';

export type FastifyReply<T> = FastifyReplyType<RouteGenericInterface, RawServerBase, RawRequestDefaultExpression<RawServerBase>, RawReplyDefaultExpression<RawServerBase>, ContextConfigDefault, FastifySchema, FastifyTypeProviderDefault, HttpResponse<T> | ReadableStream | WithPagination<HttpResponse<T>>>;
export type FastifyResponse<T> = FastifyReplyType<RouteGenericInterface & { Reply: HttpResponse<T> | WithPagination<HttpResponse<T>> }, RawServerBase, RawRequestDefaultExpression<RawServerBase>, RawReplyDefaultExpression<RawServerBase>, ContextConfigDefault, FastifySchema, FastifyTypeProviderDefault, HttpResponse<T> | WithPagination<HttpResponse<T>>>;
export type FastifyInstance = FastifyInstanceType<RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, FastifyBaseLogger, FastifyTypeProviderDefault>;

/**
 * FastifyServiceOptions interface defines the options for the Fastify server.
 * It extends FastifyServerOptions and adds optional properties for origin and port.
 */
export interface FastifyServiceOptions extends FastifyServerOptions {
	/**
	 * The host on which the Fastify server will listen.
	 * If not provided, it defaults to '0.0.0.0'.
	 * @default '0.0.0.0'
	 */
	host?: string

	/**
	 * The module name for the Fastify server.
	 * @default 'fastify'
	 */
	module?: string

	/**
	 * The origin for CORS requests.
	 * Defaults to `true` if not provided.
	 * @default true
	 * @example 'https://example.com'
	 */
	origin?: RegExp | string | true

	/**
	 * The port on which the Fastify server will listen.
	 * If not provided, it defaults to 5050.
	 * @default 5050
	 */
	port?: number

}

const defaultFastifyServiceOptions: FastifyServiceOptions = {
	bodyLimit: 1024 * 1024 * 10, // 10MB
	host: '0.0.0.0',
	logger: true,
	module: 'fastify',
	origin: true,
	port: 5050,
	routerOptions: {
		ignoreTrailingSlash: true,
	},
};

const createLoggerOptions = (getModuleName: () => string): FastifyLoggerOptions<RawServerDefault> & { module?: string } => ({
	level: 'debug',
	module: getModuleName(),
	stream: oneLineLogger({
		colorize: true, // nice colors,
		colorizeObjects: true,
		messageFormat(log, messageKey, _, extras) {
			const c = extras.colors;
			const moduleName = getModuleName();

			const palette = {
				error: c.redBright,
				highlight: c.yellowBright, // URLs / routes
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

			// Extract error information
			// Pino serializes errors, so log.err is an object with type, message, stack, etc.
			const errorObj = log.err || log.error;
			let errorMessage = safe(log[messageKey]);
			let errorStack: string | undefined;

			if (errorObj) {
				// Pino serialized error object
				errorMessage = (errorObj as Error).message || errorMessage;
				errorStack = (errorObj as Error).stack;
			} else if (log[messageKey] instanceof Error) {
				// Direct Error instance (shouldn't happen with Pino, but just in case)
				errorMessage = (log[messageKey] as unknown as Error).message || errorMessage;
				errorStack = (log[messageKey] as Error).stack;
			}

			const message = palette.message(colorize(errorMessage));
			// Add stack trace on new lines, indented for readability
			const stackTrace = errorStack ? `\n${palette.stack(errorStack.split('\n').map(line => `  ${line}`).join('\n'))}` : '';

			const parts = [
				palette.timestamp(timestamp),
				palette.reqIdLabel(`reqId: ${palette.reqId(reqId)}`),
				palette.statusLabel(`statusCode: ${palette.status(statusCode)}`),
				palette.methodLabel(`Method: ${palette.method(method)}`),
				palette.pathLabel(`Path: ${palette.path(path)}`),
				message,
			];

			const logMessage = palette.pipe(parts.join(' | ')) + stackTrace;
			const shouldSendToSentry = message !== 'incoming request' && message !== 'request completed';

			if (shouldSendToSentry) {
				Logger.startNodeLogs({
					app: 'api',
					message: message,
					method: method,
					module: moduleName,
					path: path,
					reqId: reqId,
					severity: 'info',
					status: statusCode,
				});
			}

			return logMessage;
		},
	}),
});

/**
 * FastifyService is a singleton class that provides a Fastify server instance.
 * It allows for setting up routes, plugins, and starting/stopping the server.
 * This class is designed to be used as a service in a Node.js application.
 * It uses the Fastify framework for building web applications and APIs.
 */
export class FastifyService {
	//

	private static _instance: FastifyService;

	public readonly server: FastifyInstance;

	private readonly options: FastifyServiceOptions;

	/**
	 * Creates an instance of FastifyService.
	 * @param options The options for the Fastify server.
	 */
	private constructor(options: FastifyServiceOptions) {
		const mergedOptions = { ...defaultFastifyServiceOptions, ...options };
		this.options = mergedOptions;
		this.server = fastify({ ...mergedOptions, logger: createLoggerOptions(() => this.options.module ?? 'fastify') });
		this._setupDefaultRoutes();
		this._setupPlugins();
	}

	/**
	 * Gets the singleton instance of FastifyService.
	 * @param options The options for the Fastify server.
	 * @return The singleton instance of FastifyService.
	 */
	public static getInstance(options?: FastifyServiceOptions) {
		if (!FastifyService._instance) {
			// Create a new instance if it doesn't exist yet
			FastifyService._instance = new FastifyService(options || {});
			FastifyService._instance._setupHooks();
		}
		// Return the existing instance
		return FastifyService._instance;
	}

	/**
	 * Starts the Fastify server.
	 * @return A promise that resolves to the URL of the Fastify server.
	 * @throws Will throw an error if the server fails to start.
	 */
	async start(moduleName?: string): Promise<string> {
		if (moduleName) this.options.module = moduleName;

		try {
			await initSentryNode();
		} catch (error) {
			this.server.log.error({ err: error }, 'Error sending startup log to Sentry.');
		}

		try {
			const serverUrl = await this.server.listen({
				host: this.options.host,
				port: this.options.port,
			});

			this.server.log.info(`Server is running at ${serverUrl}`);

			return serverUrl;
		} catch (error) {
			this.server.log.error({ err: error }, 'Error starting server.');
			process.exit(1);
		}
	}

	/**
	 * Stops the Fastify server.
	 * @return A promise that resolves when the server is stopped.
	 */
	async stop() {
		try {
			await this.server.close();
			console.log('Fastify server stopped.');
		} catch (error) {
			this.server.log.error({ err: error }, error instanceof Error ? error.message : 'Error stopping server');
			process.exit(1);
		}
	}

	/**
	 * Sets the URL of the Fastify server.
	 * @return The URL of the Fastify server.
	 */
	private _setupDefaultRoutes() {
		this.server.get('/', (req, res) => {
			res.send('Jusi was here!');
		});

		this.server.get('/health', (_, res) => {
			res.status(HTTP_STATUS.OK).send({ status: 'ok' });
		});
	}

	/**
	 * Sets up hooks for the Fastify server including error handling and response processing.
	 */
	private _setupHooks() {
		/**
		 * Decodes URI-encoded `id` path params so encoded slashes (e.g. `%2F`) are
		 * available as literal characters in route handlers.
		 */
		this.server.addHook('preHandler', (request, _, done) => {
			const params = request.params as { id?: string };
			if (params.id !== undefined) {
				try {
					params.id = decodeURIComponent(params.id);
				} catch {
					// Malformed URI sequence — keep original value
				}
			}
			done();
		});

		/**
		 * Sets a global error handler for the Fastify server instance.
		 * This handler checks if the error is an instance of HttpException.
		 * If so, it sends a response with the appropriate status code and error message.
		 * This ensures consistent error responses for HTTP exceptions throughout the application.
		 */
		this.server.setErrorHandler((error, request, reply) => {
			// Log the error with full stack trace
			const errorMessage = error instanceof Error ? error.message : 'Unhandled error';
			this.server.log.error({ err: error }, errorMessage);
			// Handle HttpException errors
			if (error instanceof HttpException) {
				if (error.statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
					Logger.issue({ context: { action: 'errorHandler', feature: this.options.module, request, value: request.body }, level: 'error', messageOrError: error });
				}
				reply
					.status(error.statusCode)
					.send({
						data: undefined,
						error: error.message,
						statusCode: error.statusCode,
					});
			} else {
				Logger.issue({ context: { action: 'errorHandler', feature: this.options.module, request, value: request.body }, level: 'error', messageOrError: 'Internal server error' });
				reply
					.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
					.send({
						data: undefined,
						error: 'Internal server error',
						statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
					});
			}
		});

		/**
		 * Adds an 'onSend' hook to the Fastify server instance.
		 * This hook intercepts every outgoing response before it is sent.
		 * It parses the payload as a JSON object (assuming it matches the HttpResponse<T> structure),
		 * and sets the HTTP status code of the reply to the value of 'statusCode' in the payload,
		 * defaulting to HTTP_STATUS.OK if not present.
		 * This ensures that the HTTP status code in the response matches the statusCode property
		 * in the application's response payload, providing consistent status handling.
		 */
		this.server.addHook('onSend', (_, reply, payload, done) => {
			try {
				const payloadJson = JSON.parse(payload as string) as HttpResponse<unknown>;
				reply.code(payloadJson.statusCode ?? HTTP_STATUS.OK);
			} catch {
				// Do nothing
			} finally {
				done();
			}
		});
	}

	/**
	 * Sets up the plugins for the Fastify server.
	 * @return A promise that resolves when the plugins are set up.
	 */
	private async _setupPlugins() {
		// CORS plugin
		await this.server.register(fastifyCors, {
			credentials: true,
			methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE'],
			origin: this.options.origin,
		});
		// Cookie plugin
		await this.server.register(fastifyCookie);
		// Multipart plugin
		// await this.server.register(fastifyMultipart, {
		// 	limits: { fileSize: this.options.bodyLimit },
		// });
	}

	//
}
