/* * */

import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { HttpResponse } from '@tmlmobilidade/utils';
import { type FastifyInstance as FastifyInstanceType, type FastifyReply as FastifyReplyType, type FastifyServerOptions } from 'fastify';
import { type ContextConfigDefault, type FastifyBaseLogger, type FastifySchema, type FastifyTypeProviderDefault, type RawReplyDefaultExpression, type RawRequestDefaultExpression, type RawServerBase, type RawServerDefault, type RouteGenericInterface } from 'fastify';

/* * */

export type FastifyReply<T> = FastifyReplyType<RouteGenericInterface, RawServerBase, RawRequestDefaultExpression<RawServerBase>, RawReplyDefaultExpression<RawServerBase>, ContextConfigDefault, FastifySchema, FastifyTypeProviderDefault, ApiResponse<T> | HttpResponse<T> | ReadableStream>;
export type FastifyResponse<T> = FastifyReplyType<RouteGenericInterface & { Reply: ApiResponse<T> | HttpResponse<T> }, RawServerBase, RawRequestDefaultExpression<RawServerBase>, RawReplyDefaultExpression<RawServerBase>, ContextConfigDefault, FastifySchema, FastifyTypeProviderDefault, ApiResponse<T> | HttpResponse<T>>;
export type FastifyInstance = FastifyInstanceType<RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, FastifyBaseLogger, FastifyTypeProviderDefault>;
export type { FastifyRequest } from 'fastify';

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

export const defaultFastifyServiceOptions: FastifyServiceOptions = {
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
