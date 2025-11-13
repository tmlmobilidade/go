/* * */

import { z } from 'zod';

/* * */

export function isEmail(email: string): boolean {
	return z.string().email().safeParse(email).success;
}

export function isUrl(url: string): boolean {
	return z.string().url().safeParse(url).success;
}
