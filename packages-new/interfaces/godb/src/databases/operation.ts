/* * */

import { alertsIndexes, plansIndexes, rideAcceptancesIndexes, vehiclesIndexes } from '@/indexes/index.js';
import { MongoInterfaceTemplate } from '@/interface.template.js';
import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type Alert, type CreateAlertDto, CreateAlertSchema, type CreateGtfsValidationDto, CreateGtfsValidationSchema, type CreatePlanDto, CreatePlanSchema, type CreateRideAcceptanceDto, CreateRideAcceptanceSchema, type CreateSamDto, CreateSamSchema, type CreateSchoolDto, CreateSchoolSchema, type CreateVehicleDto, CreateVehicleSchema, type GtfsValidation, type Plan, type RideAcceptance, type Sam, type School, type UpdateAlertDto, UpdateAlertSchema, type UpdateGtfsValidationDto, UpdateGtfsValidationSchema, type UpdatePlanDto, UpdatePlanSchema, type UpdateRideAcceptanceDto, UpdateRideAcceptanceSchema, type UpdateSamDto, UpdateSamSchema, type UpdateSchoolDto, UpdateSchoolSchema, type UpdateVehicleDto, UpdateVehicleSchema, type Vehicle } from '@tmlmobilidade/go-types-operation';

/* * */

export class OperationDatabase {
	//

	public readonly alerts: MongoInterfaceTemplate<Alert, CreateAlertDto, UpdateAlertDto>;
	public readonly gtfsValidations: MongoInterfaceTemplate<GtfsValidation, CreateGtfsValidationDto, UpdateGtfsValidationDto>;
	public readonly plans: MongoInterfaceTemplate<Plan, CreatePlanDto, UpdatePlanDto>;
	public readonly rideAcceptances: MongoInterfaceTemplate<RideAcceptance, CreateRideAcceptanceDto, UpdateRideAcceptanceDto>;
	public readonly sams: MongoInterfaceTemplate<Sam, CreateSamDto, UpdateSamDto>;
	public readonly schools: MongoInterfaceTemplate<School, CreateSchoolDto, UpdateSchoolDto>;
	public readonly vehicles: MongoInterfaceTemplate<Vehicle, CreateVehicleDto, UpdateVehicleDto>;

	private readonly database: Db;
	private readonly databaseName = 'operation';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);
		// Create collection interfaces
		this.alerts = new MongoInterfaceTemplate<Alert, CreateAlertDto, UpdateAlertDto>('alerts', this.database, CreateAlertSchema, UpdateAlertSchema, alertsIndexes);
		this.gtfsValidations = new MongoInterfaceTemplate<GtfsValidation, CreateGtfsValidationDto, UpdateGtfsValidationDto>('gtfs-validations', this.database, CreateGtfsValidationSchema, UpdateGtfsValidationSchema);
		this.plans = new MongoInterfaceTemplate<Plan, CreatePlanDto, UpdatePlanDto>('plans', this.database, CreatePlanSchema, UpdatePlanSchema, plansIndexes);
		this.rideAcceptances = new MongoInterfaceTemplate<RideAcceptance, CreateRideAcceptanceDto, UpdateRideAcceptanceDto>('ride-acceptances', this.database, CreateRideAcceptanceSchema, UpdateRideAcceptanceSchema, rideAcceptancesIndexes);
		this.sams = new MongoInterfaceTemplate<Sam, CreateSamDto, UpdateSamDto>('sams', this.database, CreateSamSchema, UpdateSamSchema);
		this.schools = new MongoInterfaceTemplate<School, CreateSchoolDto, UpdateSchoolDto>('schools', this.database, CreateSchoolSchema, UpdateSchoolSchema);
		this.vehicles = new MongoInterfaceTemplate<Vehicle, CreateVehicleDto, UpdateVehicleDto>('vehicles', this.database, CreateVehicleSchema, UpdateVehicleSchema, vehiclesIndexes);
	}
}
