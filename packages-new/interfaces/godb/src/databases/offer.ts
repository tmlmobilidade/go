/* * */

import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type Annotation, AnnotationSchema, type Event, EventSchema, type Fare, FareSchema, type Holiday, HolidaySchema, type Line, LineSchema, type Pattern, PatternSchema, type Route, RouteSchema, type Typology, TypologySchema, type YearPeriod, YearPeriodSchema, type Zone, ZoneSchema } from '@tmlmobilidade/go-types-offer';

import { createGoDbCollection } from '../factory/create-godb-collection.js';
import { type GoDbCollection } from '../factory/types/godb-collection.type.js';

/* * */

export class OfferDatabase {
	//

	public readonly annotations: GoDbCollection<Annotation>;
	public readonly events: GoDbCollection<Event>;
	public readonly fares: GoDbCollection<Fare>;
	public readonly holidays: GoDbCollection<Holiday>;
	public readonly lines: GoDbCollection<Line>;
	public readonly patterns: GoDbCollection<Pattern>;
	public readonly routes: GoDbCollection<Route>;
	public readonly typologies: GoDbCollection<Typology>;
	public readonly yearPeriods: GoDbCollection<YearPeriod>;
	public readonly zones: GoDbCollection<Zone>;

	private readonly database: Db;
	private readonly databaseName = 'offer';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);
		// Create collection interfaces
		this.annotations = createGoDbCollection<Annotation>({ collectionName: 'annotations', database: this.database, indexDescription: null, schema: AnnotationSchema });
		this.events = createGoDbCollection<Event>({ collectionName: 'events', database: this.database, indexDescription: null, schema: EventSchema });
		this.fares = createGoDbCollection<Fare>({ collectionName: 'fares', database: this.database, indexDescription: null, schema: FareSchema });
		this.holidays = createGoDbCollection<Holiday>({ collectionName: 'holidays', database: this.database, indexDescription: null, schema: HolidaySchema });
		this.lines = createGoDbCollection<Line>({ collectionName: 'lines', database: this.database, indexDescription: null, schema: LineSchema });
		this.patterns = createGoDbCollection<Pattern>({ collectionName: 'patterns', database: this.database, indexDescription: null, schema: PatternSchema });
		this.routes = createGoDbCollection<Route>({ collectionName: 'routes', database: this.database, indexDescription: null, schema: RouteSchema });
		this.typologies = createGoDbCollection<Typology>({ collectionName: 'typologies', database: this.database, indexDescription: null, schema: TypologySchema });
		this.yearPeriods = createGoDbCollection<YearPeriod>({ collectionName: 'year-periods', database: this.database, indexDescription: null, schema: YearPeriodSchema });
		this.zones = createGoDbCollection<Zone>({ collectionName: 'zones', database: this.database, indexDescription: null, schema: ZoneSchema });
	}
}
