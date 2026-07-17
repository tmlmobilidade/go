/* * */

import type { Db, MongoClient } from '@tmlmobilidade/go-clients-mongo';

import { MongoInterfaceTemplate } from '@/interface.template.js';
import { CreateGtfsValidationDto, CreateGtfsValidationSchema, CreatePlanDto, CreatePlanSchema, CreateRideAcceptanceDto, CreateRideAcceptanceSchema, CreateRideDto, CreateRideSchema, CreateSamDto, CreateSamSchema, CreateVehicleDto, CreateVehicleSchema, DocumentSchema, GtfsValidation, HashedPattern, HashedPatternSchema, HashedShape, HashedTrip, HashedTripSchema, Plan, Ride, RideAcceptance, Sam, UpdateGtfsValidationDto, UpdateGtfsValidationSchema, UpdatePlanDto, UpdatePlanSchema, UpdateRideAcceptanceDto, UpdateRideAcceptanceSchema, UpdateRideDto, UpdateRideSchema, UpdateSamDto, UpdateSamSchema, UpdateVehicleDto, UpdateVehicleSchema, Vehicle } from '@tmlmobilidade/types';

/* * */

export class OperationDatabase {
	//

	//
	// Collections
	public readonly gtfsValidations: MongoInterfaceTemplate<GtfsValidation, CreateGtfsValidationDto, UpdateGtfsValidationDto>;
	public readonly hashedPatterns: MongoInterfaceTemplate<HashedPattern, HashedPattern, HashedPattern>;
	public readonly hashedShapes: MongoInterfaceTemplate<HashedShape, HashedShape, HashedShape>;
	public readonly hashedTrips: MongoInterfaceTemplate<HashedTrip, HashedTrip, HashedTrip>;
	public readonly plans: MongoInterfaceTemplate<Plan, CreatePlanDto, UpdatePlanDto>;
	public readonly rideAcceptances: MongoInterfaceTemplate<RideAcceptance, CreateRideAcceptanceDto, UpdateRideAcceptanceDto>;
	public readonly rides: MongoInterfaceTemplate<Ride, CreateRideDto, UpdateRideDto>;
	public readonly sams: MongoInterfaceTemplate<Sam, CreateSamDto, UpdateSamDto>;
	public readonly vehicles: MongoInterfaceTemplate<Vehicle, CreateVehicleDto, UpdateVehicleDto>;

	//
	private readonly database: Db;
	private readonly databaseName = 'operation';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);

		// Create collection interfaces
		this.gtfsValidations = new MongoInterfaceTemplate<GtfsValidation, CreateGtfsValidationDto, UpdateGtfsValidationDto>('gtfsValidations', this.database, CreateGtfsValidationSchema, UpdateGtfsValidationSchema);
		this.hashedPatterns = new MongoInterfaceTemplate<HashedPattern, HashedPattern, HashedPattern>('hashedPatterns', this.database, HashedPatternSchema, HashedPatternSchema);
		this.hashedShapes = new MongoInterfaceTemplate<HashedShape, HashedShape, HashedShape>('hashedShapes', this.database, DocumentSchema, DocumentSchema);
		this.hashedTrips = new MongoInterfaceTemplate<HashedTrip, HashedTrip, HashedTrip>('hashedTrips', this.database, HashedTripSchema, HashedTripSchema);
		this.plans = new MongoInterfaceTemplate<Plan, CreatePlanDto, UpdatePlanDto>('plans', this.database, CreatePlanSchema, UpdatePlanSchema);
		this.rideAcceptances = new MongoInterfaceTemplate<RideAcceptance, CreateRideAcceptanceDto, UpdateRideAcceptanceDto>('rideAcceptances', this.database, CreateRideAcceptanceSchema, UpdateRideAcceptanceSchema);
		this.rides = new MongoInterfaceTemplate<Ride, CreateRideDto, UpdateRideDto>('rides', this.database, CreateRideSchema, UpdateRideSchema);
		this.sams = new MongoInterfaceTemplate<Sam, CreateSamDto, UpdateSamDto>('sams', this.database, CreateSamSchema, UpdateSamSchema);
		this.vehicles = new MongoInterfaceTemplate<Vehicle, CreateVehicleDto, UpdateVehicleDto>('vehicles', this.database, CreateVehicleSchema, UpdateVehicleSchema);
	}
}
