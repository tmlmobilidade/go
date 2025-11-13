/* * */

import '@fastify/cookie';
import '@fastify/cors';

/* * */

import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { HttpResponse, WithPagination } from '@tmlmobilidade/utils';

/* * */

import fastify from 'fastify';
import { type FastifyReply as _FastifyReply, type FastifyInstance as FastifyInstanceType } from 'fastify';
import { type ContextConfigDefault, type FastifyBaseLogger, type FastifySchema, type FastifyServerOptions, type FastifyTypeProviderDefault, type RawReplyDefaultExpression, type RawRequestDefaultExpression, type RawServerBase, type RawServerDefault, type RouteGenericInterface } from 'fastify';

export { type FastifyRequest } from 'fastify';

export type FastifyReply<T> = _FastifyReply<RouteGenericInterface, RawServerBase, RawRequestDefaultExpression<RawServerBase>, RawReplyDefaultExpression<RawServerBase>, ContextConfigDefault, FastifySchema, FastifyTypeProviderDefault, HttpResponse<T> | ReadableStream | WithPagination<HttpResponse<T>>>;
export type FastifyResponse<T> = _FastifyReply<RouteGenericInterface & { Reply: HttpResponse<T> | WithPagination<HttpResponse<T>> }, RawServerBase, RawRequestDefaultExpression<RawServerBase>, RawReplyDefaultExpression<RawServerBase>, ContextConfigDefault, FastifySchema, FastifyTypeProviderDefault, HttpResponse<T> | WithPagination<HttpResponse<T>>>;
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
	private readonly host: FastifyServiceOptions['host'];
	private readonly origin: FastifyServiceOptions['origin'];
	private readonly port: FastifyServiceOptions['port'];

	/**
	 * Creates an instance of FastifyService.
	 * @param options The options for the Fastify server.
	 */
	private constructor(options: FastifyServiceOptions) {
		this.server = fastify(options);
		this.origin = options.origin ?? true;
		this.port = options.port ?? 5050;
		this.host = options.host ?? '0.0.0.0';
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
	async start(): Promise<string> {
		try {
			const serverUrl = await this.server.listen({ host: this.host, port: this.port });
			this.server.log.info(`Server is running at ${serverUrl}`);
			this.server.log.info(`CORS enabled for origin: ${this.origin}`);
			this.server.log.info(`Listening on ${this.host}:${this.port}`);
			return serverUrl;
		}
		catch (error) {
			this.server.log.error({ error, message: 'Error starting server.' });
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
		}
		catch (error) {
			this.server.log.error(error);
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
	}

	/**
	 * Sets up hooks for the Fastify server including error handling and response processing.
	 */
	private _setupHooks() {
		/**
		 * Sets a global error handler for the Fastify server instance.
		 * This handler checks if the error is an instance of HttpException.
		 * If so, it sends a response with the appropriate status code and error message.
		 * This ensures consistent error responses for HTTP exceptions throughout the application.
		 */
		this.server.setErrorHandler((error, _, reply) => {
			this.server.log.error(error);

			if (error instanceof HttpException) {
				reply.status(error.statusCode).send({
					data: undefined,
					error: error.message,
					statusCode: error.statusCode,
				});
			}
			else {
				reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
					data: undefined,
					error: 'Internal server error',
					statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				});
			}
		});

		/**
		 * Adds an 'onSend' hook to the Fastify server instance.
		 * This hook intercepts every outgoing response before it is sent.
		 * It parses the payload as a JSON object (assuming it matches the HttpResponse<T> structure),
		 * and sets the HTTP status code of the reply to the value of 'statusCode' in the payload,
		 * defaulting to HttpStatus.OK if not present.
		 * This ensures that the HTTP status code in the response matches the statusCode property
		 * in the application's response payload, providing consistent status handling.
		 */
		this.server.addHook('onSend', (_, reply, payload, done) => {
			try {
				const payloadJson = JSON.parse(payload as string) as HttpResponse<unknown>;
				reply.code(payloadJson.statusCode ?? HttpStatus.OK);
			}
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			catch (error) {
				// Do nothing
			}
			finally {
				done();
			}
		});
	}

	/**
	 * Sets up the plugins for the Fastify server.
	 * @return A promise that resolves when the plugins are set up.
	 */
	private async _setupPlugins() {
		//

		await this.server.register(cors, {
			credentials: true,
			methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE'],
			origin: this.origin,
		});
		await this.server.register(cookie);
	}

	//
}
