import { FastifyReply, FastifyRequest } from '@tmlmobilidade/connectors';
import { locations } from '@tmlmobilidade/interfaces';
import { HttpException, HttpStatus } from '@tmlmobilidade/lib';

/**
 * This is an example controller that is using the locations interface.
 */
export class LocationsController {
	static async findByCoordinates(request: FastifyRequest, reply: FastifyReply) {
		const { census, lat, lon } = request.query as { census: boolean, lat: number, lon: number };

		try {
			const result = await locations.findLocationByGeo(Number(lat), Number(lon), { census: Boolean(census) });
			return reply.status(HttpStatus.OK).send(result);
		}
		catch (error) {
			if (error instanceof HttpException) {
				return reply.status(error.statusCode).send({ error: error.message });
			}

			return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: 'Internal server error', message: error.message });
		}
	}
}
