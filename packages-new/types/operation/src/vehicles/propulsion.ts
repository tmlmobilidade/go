/* * */

import { z } from 'zod';

/* * */

export const VehiclePropulsionValues = [
	'0', // Não aplicável
	'1', // Gasolina
	'2', // Gasóleo
	'3', // GPL Auto
	'4', // Mistura
	'5', // Eletricidade
	'6', // Elétrico a bateria
	'7', // Híbrido
	'8', // Hidrogénio
	'9', // Biocombustível
	'10', // Biocombustível / Biodiesel
	'101', // Gás natural
	'102', // Gás natural - GNC
	'103', // Gás natural - GNL
	'104', // Combustível para aviação
	'105', // Combustível marítimo
	'106', // Outro
] as const;

export const VehiclePropulsionSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(VehiclePropulsionValues));

export type VehiclePropulsion = z.infer<typeof VehiclePropulsionSchema>;
