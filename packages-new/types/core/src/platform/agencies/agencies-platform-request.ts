/* * */

import { PermissionSchema } from '@tmlmobilidade/go-types-permissions';
import { z } from 'zod';

/**
 * The request option schema for a given permission schema.
 * Helper type to infer the actions from the permission schema type.
 * @param T The permission schema.
 */
type RequestOption<T extends z.ZodDiscriminatedUnionOption<'scope'>> = z.ZodObject<{
	actions: z.ZodOptional<z.ZodArray<T['shape']['action']>>
	scope: T['shape']['scope']
}>;

/**
 * Helper function to map the permission schemas to the request options.
 * @param options The permission schemas.
 * @returns The request options.
 */
function mapDiscriminatedUnionOptions<T extends readonly z.ZodDiscriminatedUnionOption<'scope'>[]>(options: T): {
	[K in keyof T]: RequestOption<T[K]>;
} {
	return options.map(schema => z.object({
		actions: z.array(schema.shape.action).optional(),
		scope: schema.shape.scope,
	})) as {
		[K in keyof T]: RequestOption<T[K]>;
	};
}

export const AgenciesPlatformRequestSchema = z.discriminatedUnion('scope',
	mapDiscriminatedUnionOptions(PermissionSchema.options),
);

/**
 * The request schema for getting agencies platform data.
 */
export type AgenciesPlatformRequest = z.infer<typeof AgenciesPlatformRequestSchema>;

const request: AgenciesPlatformRequest = {
	actions: ['read'],
	scope: 'agencies',
};
