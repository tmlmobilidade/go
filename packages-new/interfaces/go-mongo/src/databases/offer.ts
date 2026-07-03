/* * */

import type { Db, MongoClient } from '@tmlmobilidade/go-clients-mongo';

import { MongoInterfaceTemplate } from '@/interface.template.js';
import { Annotation, CreateAnnotationDto, CreateAnnotationSchema, CreateEventDto, CreateEventSchema, CreateFareDto, CreateFareSchema, CreateHolidayDto, CreateHolidaySchema, CreateLineDto, CreateLineSchema, CreatePatternDto, CreatePatternSchema, CreateRouteDto, CreateRouteSchema, CreateTypologyDto, CreateTypologySchema, CreateYearPeriodDto, CreateYearPeriodSchema, CreateZoneDto, CreateZoneSchema, Fare, Holiday, Line, Pattern, Route, Typology, UpdateAnnotationDto, UpdateAnnotationSchema, UpdateEventDto, UpdateEventSchema, UpdateFareDto, UpdateFareSchema, UpdateHolidayDto, UpdateHolidaySchema, UpdateLineDto, UpdateLineSchema, UpdatePatternDto, UpdatePatternSchema, UpdateRouteDto, UpdateRouteSchema, UpdateTypologyDto, UpdateTypologySchema, UpdateYearPeriodDto, UpdateYearPeriodSchema, UpdateZoneDto, UpdateZoneSchema, YearPeriod, Zone } from '@tmlmobilidade/types';
/* * */

export class OfferDatabase {
	//

	//
	// Collections
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

	//
	public readonly database: Db;
	public readonly databaseName = 'offer';

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
