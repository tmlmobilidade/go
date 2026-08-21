/* * */

import { z } from 'zod';

import { PermissionSchema } from '../permissions.js';

/**
 * The request option schema for a given permission schema.
 * Helper type to infer the actions from the permission schema type.
 * @param T The permission schema.
 */
type ScopeActionsType<T extends z.ZodDiscriminatedUnionOption<'scope'>> = z.ZodObject<{
	actions: z.ZodOptional<z.ZodArray<T['shape']['action']>>
	scope: T['shape']['scope']
}>;

/**
 * Helper function to map the permission schemas to the request options.
 * @param options The permission schemas.
 * @returns The request options.
 */
function mapDiscriminatedUnionOptions<T extends readonly z.ZodDiscriminatedUnionOption<'scope'>[]>(options: T): {
	[K in keyof T]: ScopeActionsType<T[K]>;
} {
	return options.map(schema => z.object({
		actions: z.array(schema.shape.action).optional(),
		scope: schema.shape.scope,
	})) as {
		[K in keyof T]: ScopeActionsType<T[K]>;
	};
}

/**
 * The scope actions schema.
 * Use to validate the available actions for a given scope,
 * based on the permission schema.
 */
export const ScopeActionsSchema = z.discriminatedUnion('scope',
	mapDiscriminatedUnionOptions(PermissionSchema.options),
);

/**
 * The scope actions schema.
 * Use to infer the available actions for a given scope,
 * based on the permission schema.
 */
export type ScopeActions = z.infer<typeof ScopeActionsSchema>;
