import { z } from 'zod';

type OptionalShape<Shape extends Record<string, z.ZodType>> = {
	[Key in keyof Shape]: z.ZodOptional<z.ZodPreprocess<Shape[Key], z.input<Shape[Key]>>>
};

/** Makes fields optional for a patch so absent values leave stored fields intact. */
export function partialWithoutDefaults<Shape extends Record<string, z.ZodType>>(schema: z.ZodObject<Shape>) {
	const shape = Object.fromEntries(Object.entries(schema.shape).map(([key, field]) => [
		key,
		// Preprocessing keeps the optional wrapper from forwarding undefined to a default.
		z.preprocess(value => value, field).optional(),
	])) as OptionalShape<Shape>;

	return schema.extend(shape);
}
