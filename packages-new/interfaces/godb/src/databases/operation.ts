/* * */

import { MongoInterfaceTemplate } from '@/interface.template.js';
import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type Alert, type CreateAlertDto, CreateAlertSchema, type CreateGtfsValidationDto, CreateGtfsValidationSchema, type CreatePlanDto, CreatePlanSchema, type CreateRideAcceptanceDto, CreateRideAcceptanceSchema, type CreateRideDto, CreateRideSchema, type CreateSamDto, CreateSamSchema, type CreateVehicleDto, CreateVehicleSchema, DocumentSchema, type GtfsValidation, type HashedPattern, HashedPatternSchema, type HashedShape, type HashedTrip, HashedTripSchema, type Plan, type Ride, type RideAcceptance, type Sam, type UpdateAlertDto, UpdateAlertSchema, type UpdateGtfsValidationDto, UpdateGtfsValidationSchema, type UpdatePlanDto, UpdatePlanSchema, type UpdateRideAcceptanceDto, UpdateRideAcceptanceSchema, type UpdateRideDto, UpdateRideSchema, type UpdateSamDto, UpdateSamSchema, type UpdateVehicleDto, UpdateVehicleSchema, type Vehicle } from '@tmlmobilidade/types';

/* * */

export class OperationDatabase {
	//

	public readonly alerts: MongoInterfaceTemplate<Alert, CreateAlertDto, UpdateAlertDto>;
	public readonly gtfsValidations: MongoInterfaceTemplate<GtfsValidation, CreateGtfsValidationDto, UpdateGtfsValidationDto>;
	public readonly hashedPatterns: MongoInterfaceTemplate<HashedPattern, HashedPattern, HashedPattern>;
	public readonly hashedShapes: MongoInterfaceTemplate<HashedShape, HashedShape, HashedShape>;
	public readonly hashedTrips: MongoInterfaceTemplate<HashedTrip, HashedTrip, HashedTrip>;
	public readonly plans: MongoInterfaceTemplate<Plan, CreatePlanDto, UpdatePlanDto>;
	public readonly rideAcceptances: MongoInterfaceTemplate<RideAcceptance, CreateRideAcceptanceDto, UpdateRideAcceptanceDto>;
	public readonly rides: MongoInterfaceTemplate<Ride, CreateRideDto, UpdateRideDto>;
	public readonly sams: MongoInterfaceTemplate<Sam, CreateSamDto, UpdateSamDto>;
	public readonly vehicles: MongoInterfaceTemplate<Vehicle, CreateVehicleDto, UpdateVehicleDto>;

	private readonly database: Db;
	private readonly databaseName = 'operation';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);
		// Create collection interfaces
		this.alerts = new MongoInterfaceTemplate<Alert, CreateAlertDto, UpdateAlertDto>('alerts', this.database, CreateAlertSchema, UpdateAlertSchema);
		this.gtfsValidations = new MongoInterfaceTemplate<GtfsValidation, CreateGtfsValidationDto, UpdateGtfsValidationDto>('gtfs-validations', this.database, CreateGtfsValidationSchema, UpdateGtfsValidationSchema);
		this.hashedPatterns = new MongoInterfaceTemplate<HashedPattern, HashedPattern, HashedPattern>('hashed-patterns', this.database, HashedPatternSchema, HashedPatternSchema);
		this.hashedShapes = new MongoInterfaceTemplate<HashedShape, HashedShape, HashedShape>('hashed-shapes', this.database, DocumentSchema, DocumentSchema);
		this.hashedTrips = new MongoInterfaceTemplate<HashedTrip, HashedTrip, HashedTrip>('hashed-trips', this.database, HashedTripSchema, HashedTripSchema);
		this.plans = new MongoInterfaceTemplate<Plan, CreatePlanDto, UpdatePlanDto>('plans', this.database, CreatePlanSchema, UpdatePlanSchema);
		this.rideAcceptances = new MongoInterfaceTemplate<RideAcceptance, CreateRideAcceptanceDto, UpdateRideAcceptanceDto>('ride-acceptances', this.database, CreateRideAcceptanceSchema, UpdateRideAcceptanceSchema);
		this.rides = new MongoInterfaceTemplate<Ride, CreateRideDto, UpdateRideDto>('rides', this.database, CreateRideSchema, UpdateRideSchema);
		this.sams = new MongoInterfaceTemplate<Sam, CreateSamDto, UpdateSamDto>('sams', this.database, CreateSamSchema, UpdateSamSchema);
		this.vehicles = new MongoInterfaceTemplate<Vehicle, CreateVehicleDto, UpdateVehicleDto>('vehicles', this.database, CreateVehicleSchema, UpdateVehicleSchema);
	}
}
