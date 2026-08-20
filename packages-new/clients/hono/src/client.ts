/* * */

import { serve as honoServe } from '@hono/node-server';
import { Hono } from 'hono';

/* * */

export { type Context, type Handler, type MiddlewareHandler, type Next } from 'hono';

export type App = Hono;
export type Router = Hono;

export const createApp = (): App => {
	return new Hono();
};

export const createRouter = (): Router => {
	return new Hono();
};

export const serve = honoServe;
