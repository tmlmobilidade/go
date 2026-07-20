/* * */

import { MongoInterfaceTemplate } from '@/interface.template.js';
import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type Annotation, type CreateAnnotationDto, CreateAnnotationSchema, type CreateEventDto, CreateEventSchema, type CreateFareDto, CreateFareSchema, type CreateHolidayDto, CreateHolidaySchema, type CreateLineDto, CreateLineSchema, type CreatePatternDto, CreatePatternSchema, type CreateRouteDto, CreateRouteSchema, type CreateTypologyDto, CreateTypologySchema, type CreateYearPeriodDto, CreateYearPeriodSchema, type CreateZoneDto, CreateZoneSchema, type Event, type Fare, type Holiday, type Line, type Pattern, type Route, type Typology, type UpdateAnnotationDto, UpdateAnnotationSchema, type UpdateEventDto, UpdateEventSchema, type UpdateFareDto, UpdateFareSchema, type UpdateHolidayDto, UpdateHolidaySchema, type UpdateLineDto, UpdateLineSchema, type UpdatePatternDto, UpdatePatternSchema, type UpdateRouteDto, UpdateRouteSchema, type UpdateTypologyDto, UpdateTypologySchema, type UpdateYearPeriodDto, UpdateYearPeriodSchema, type UpdateZoneDto, UpdateZoneSchema, type YearPeriod, type Zone } from '@tmlmobilidade/types';

/* * */

export class OfferDatabase {
	//

	public readonly annotations: MongoInterfaceTemplate<Annotation, CreateAnnotationDto, UpdateAnnotationDto>;
	public readonly events: MongoInterfaceTemplate<Event, CreateEventDto, UpdateEventDto>;
	public readonly fares: MongoInterfaceTemplate<Fare, CreateFareDto, UpdateFareDto>;
	public readonly holidays: MongoInterfaceTemplate<Holiday, CreateHolidayDto, UpdateHolidayDto>;
	public readonly lines: MongoInterfaceTemplate<Line, CreateLineDto, UpdateLineDto>;
	public readonly patterns: MongoInterfaceTemplate<Pattern, CreatePatternDto, UpdatePatternDto>;
	public readonly routes: MongoInterfaceTemplate<Route, CreateRouteDto, UpdateRouteDto>;
	public readonly typologies: MongoInterfaceTemplate<Typology, CreateTypologyDto, UpdateTypologyDto>;
	public readonly yearPeriods: MongoInterfaceTemplate<YearPeriod, CreateYearPeriodDto, UpdateYearPeriodDto>;
	public readonly zones: MongoInterfaceTemplate<Zone, CreateZoneDto, UpdateZoneDto>;

	private readonly database: Db;
	private readonly databaseName = 'offer';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);
		// Create collection interfaces
		this.annotations = new MongoInterfaceTemplate<Annotation, CreateAnnotationDto, UpdateAnnotationDto>('annotations', this.database, CreateAnnotationSchema, UpdateAnnotationSchema);
		this.events = new MongoInterfaceTemplate<Event, CreateEventDto, UpdateEventDto>('events', this.database, CreateEventSchema, UpdateEventSchema);
		this.fares = new MongoInterfaceTemplate<Fare, CreateFareDto, UpdateFareDto>('fares', this.database, CreateFareSchema, UpdateFareSchema);
		this.holidays = new MongoInterfaceTemplate<Holiday, CreateHolidayDto, UpdateHolidayDto>('holidays', this.database, CreateHolidaySchema, UpdateHolidaySchema);
		this.lines = new MongoInterfaceTemplate<Line, CreateLineDto, UpdateLineDto>('lines', this.database, CreateLineSchema, UpdateLineSchema);
		this.patterns = new MongoInterfaceTemplate<Pattern, CreatePatternDto, UpdatePatternDto>('patterns', this.database, CreatePatternSchema, UpdatePatternSchema);
		this.routes = new MongoInterfaceTemplate<Route, CreateRouteDto, UpdateRouteDto>('routes', this.database, CreateRouteSchema, UpdateRouteSchema);
		this.typologies = new MongoInterfaceTemplate<Typology, CreateTypologyDto, UpdateTypologyDto>('typologies', this.database, CreateTypologySchema, UpdateTypologySchema);
		this.yearPeriods = new MongoInterfaceTemplate<YearPeriod, CreateYearPeriodDto, UpdateYearPeriodDto>('yearPeriods', this.database, CreateYearPeriodSchema, UpdateYearPeriodSchema);
		this.zones = new MongoInterfaceTemplate<Zone, CreateZoneDto, UpdateZoneDto>('zones', this.database, CreateZoneSchema, UpdateZoneSchema);
	}
}
