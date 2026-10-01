/* eslint-disable @typescript-eslint/naming-convention */
/* * */

import '@fastify/cors';
import '@fastify/cookie';
import '@fastify/multipart';

/* * */

import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import fastify from 'fastify';

import { setupHooks } from './hooks/index.js';
import { createFastifyLoggerOptions } from './logger/index.js';
import { defaultFastifyServiceOptions, type FastifyInstance, type FastifyServiceOptions } from './types.js';

/* * */

export { type FastifyInstance, type FastifyReply, type FastifyRequest, type FastifyResponse, type FastifyServiceOptions } from './types.js';

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
		this.server = fastify({
			...mergedOptions,
			logger: createFastifyLoggerOptions(() => this.options.module ?? 'fastify'),
		});
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
			FastifyService._instance = new FastifyService(options || {});
			FastifyService._instance._setupHooks();
		}
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
			const serverUrl = await this.server.listen({
				host: this.options.host,
				port: this.options.port,
			});

			Logger.info({ attributes: { module: this.options.module }, message: `Server is running at ${serverUrl}` });

			return serverUrl;
		} catch (error) {
			Logger.error({
				attributes: { module: this.options.module },
				error: error instanceof Error ? error : undefined,
				message: 'Error starting server.',
			});
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
			Logger.info({ attributes: { module: this.options.module }, message: 'Fastify server stopped.' });
		} catch (error) {
			Logger.error({
				attributes: { module: this.options.module },
				error: error instanceof Error ? error : undefined,
				message: error instanceof Error ? error.message : 'Error stopping server',
			});
			process.exit(1);
		}
	}

	/**
	 * Registers default routes (`/` and `/health`).
	 */
	private _setupDefaultRoutes() {
		this.server.get('/', (_req, res) => {
			res.send('Jusi was here!');
		});

		this.server.get('/health', (_, res) => {
			res.status(HTTP_STATUS.OK).send({ status: 'ok' });
		});
	}

	/**
	 * Sets up hooks for the Fastify server including error handling and request logging.
	 */
	private _setupHooks() {
		setupHooks(this.server, () => this.options.module);
	}

	/**
	 * Sets up the plugins for the Fastify server.
	 */
	private async _setupPlugins() {
		await this.server.register(fastifyCors, {
			credentials: true,
			methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE'],
			origin: this.options.origin,
		});
		await this.server.register(fastifyCookie);
	}

	//
}
