/* * */

import { vehicleEventsIndexes } from '@/indexes/vehicle-events/common.js';
import { MongoInterfaceTemplate } from '@/interface.template.js';
import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type RawVehicleEventEsCrtmAisa, RawVehicleEventEsCrtmAisaSchema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventEsCrtmLaVeloz, RawVehicleEventEsCrtmLaVelozSchema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventPtTmlCcfl, RawVehicleEventPtTmlCcflSchema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventPtTmlCmAlsa, RawVehicleEventPtTmlCmAlsaSchema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventPtTmlCmRl, RawVehicleEventPtTmlCmRlSchema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventPtTmlCmTst, RawVehicleEventPtTmlCmTstSchema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventPtTmlCmVa, RawVehicleEventPtTmlCmVaSchema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventPtTmlCp, RawVehicleEventPtTmlCpSchema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventPtTmlFertagus, RawVehicleEventPtTmlFertagusSchema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventPtTmlMl, RawVehicleEventPtTmlMlSchema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventPtTmlMobi, RawVehicleEventPtTmlMobiSchema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventPtTmlTcb, RawVehicleEventPtTmlTcbSchema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventPtTmlTtsl, RawVehicleEventPtTmlTtslSchema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventPtTmpUnirUt1, RawVehicleEventPtTmpUnirUt1Schema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventPtTmpUnirUt2, RawVehicleEventPtTmpUnirUt2Schema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventPtTmpUnirUt3, RawVehicleEventPtTmpUnirUt3Schema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventPtTmpUnirUt4, RawVehicleEventPtTmpUnirUt4Schema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventPtTmpUnirUt5, RawVehicleEventPtTmpUnirUt5Schema } from '@tmlmobilidade/go-types-vehicle-events';
import { type RawVehicleEventPtTmpUnirUt6, RawVehicleEventPtTmpUnirUt6Schema } from '@tmlmobilidade/go-types-vehicle-events';

/* * */

export class VehicleEventsDatabase {
	//

	public readonly esCrtmAisa: MongoInterfaceTemplate<RawVehicleEventEsCrtmAisa, RawVehicleEventEsCrtmAisa>;
	public readonly esCrtmLaVeloz: MongoInterfaceTemplate<RawVehicleEventEsCrtmLaVeloz, RawVehicleEventEsCrtmLaVeloz>;
	public readonly ptTmlCcfl: MongoInterfaceTemplate<RawVehicleEventPtTmlCcfl, RawVehicleEventPtTmlCcfl>;
	public readonly ptTmlCmAlsa: MongoInterfaceTemplate<RawVehicleEventPtTmlCmAlsa, RawVehicleEventPtTmlCmAlsa>;
	public readonly ptTmlCmRl: MongoInterfaceTemplate<RawVehicleEventPtTmlCmRl, RawVehicleEventPtTmlCmRl>;
	public readonly ptTmlCmTst: MongoInterfaceTemplate<RawVehicleEventPtTmlCmTst, RawVehicleEventPtTmlCmTst>;
	public readonly ptTmlCmVa: MongoInterfaceTemplate<RawVehicleEventPtTmlCmVa, RawVehicleEventPtTmlCmVa>;
	public readonly ptTmlCp: MongoInterfaceTemplate<RawVehicleEventPtTmlCp, RawVehicleEventPtTmlCp>;
	public readonly ptTmlFertagus: MongoInterfaceTemplate<RawVehicleEventPtTmlFertagus, RawVehicleEventPtTmlFertagus>;
	public readonly ptTmlMl: MongoInterfaceTemplate<RawVehicleEventPtTmlMl, RawVehicleEventPtTmlMl>;
	public readonly ptTmlMobi: MongoInterfaceTemplate<RawVehicleEventPtTmlMobi, RawVehicleEventPtTmlMobi>;
	public readonly ptTmlTcb: MongoInterfaceTemplate<RawVehicleEventPtTmlTcb, RawVehicleEventPtTmlTcb>;
	public readonly ptTmlTtsl: MongoInterfaceTemplate<RawVehicleEventPtTmlTtsl, RawVehicleEventPtTmlTtsl>;
	public readonly ptTmpUnirUt1: MongoInterfaceTemplate<RawVehicleEventPtTmpUnirUt1, RawVehicleEventPtTmpUnirUt1>;
	public readonly ptTmpUnirUt2: MongoInterfaceTemplate<RawVehicleEventPtTmpUnirUt2, RawVehicleEventPtTmpUnirUt2>;
	public readonly ptTmpUnirUt3: MongoInterfaceTemplate<RawVehicleEventPtTmpUnirUt3, RawVehicleEventPtTmpUnirUt3>;
	public readonly ptTmpUnirUt4: MongoInterfaceTemplate<RawVehicleEventPtTmpUnirUt4, RawVehicleEventPtTmpUnirUt4>;
	public readonly ptTmpUnirUt5: MongoInterfaceTemplate<RawVehicleEventPtTmpUnirUt5, RawVehicleEventPtTmpUnirUt5>;
	public readonly ptTmpUnirUt6: MongoInterfaceTemplate<RawVehicleEventPtTmpUnirUt6, RawVehicleEventPtTmpUnirUt6>;

	private readonly database: Db;
	private readonly databaseName = 'vehicle-events';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);
		// Create collection interfaces
		this.esCrtmAisa = new MongoInterfaceTemplate<RawVehicleEventEsCrtmAisa, RawVehicleEventEsCrtmAisa>('es-crtm-aisa', this.database, RawVehicleEventEsCrtmAisaSchema, vehicleEventsIndexes);
		this.esCrtmLaVeloz = new MongoInterfaceTemplate<RawVehicleEventEsCrtmLaVeloz, RawVehicleEventEsCrtmLaVeloz>('es-crtm-la-veloz', this.database, RawVehicleEventEsCrtmLaVelozSchema, vehicleEventsIndexes);
		this.ptTmlCcfl = new MongoInterfaceTemplate<RawVehicleEventPtTmlCcfl, RawVehicleEventPtTmlCcfl>('pt-tml-ccfl', this.database, RawVehicleEventPtTmlCcflSchema, vehicleEventsIndexes);
		this.ptTmlCmAlsa = new MongoInterfaceTemplate<RawVehicleEventPtTmlCmAlsa, RawVehicleEventPtTmlCmAlsa>('pt-tml-cm-alsa', this.database, RawVehicleEventPtTmlCmAlsaSchema, vehicleEventsIndexes);
		this.ptTmlCmRl = new MongoInterfaceTemplate<RawVehicleEventPtTmlCmRl, RawVehicleEventPtTmlCmRl>('pt-tml-cm-rl', this.database, RawVehicleEventPtTmlCmRlSchema, vehicleEventsIndexes);
		this.ptTmlCmTst = new MongoInterfaceTemplate<RawVehicleEventPtTmlCmTst, RawVehicleEventPtTmlCmTst>('pt-tml-cm-tst', this.database, RawVehicleEventPtTmlCmTstSchema, vehicleEventsIndexes);
		this.ptTmlCmVa = new MongoInterfaceTemplate<RawVehicleEventPtTmlCmVa, RawVehicleEventPtTmlCmVa>('pt-tml-cm-va', this.database, RawVehicleEventPtTmlCmVaSchema, vehicleEventsIndexes);
		this.ptTmlCp = new MongoInterfaceTemplate<RawVehicleEventPtTmlCp, RawVehicleEventPtTmlCp>('pt-tml-cp', this.database, RawVehicleEventPtTmlCpSchema, vehicleEventsIndexes);
		this.ptTmlFertagus = new MongoInterfaceTemplate<RawVehicleEventPtTmlFertagus, RawVehicleEventPtTmlFertagus>('pt-tml-fertagus', this.database, RawVehicleEventPtTmlFertagusSchema, vehicleEventsIndexes);
		this.ptTmlMl = new MongoInterfaceTemplate<RawVehicleEventPtTmlMl, RawVehicleEventPtTmlMl>('pt-tml-ml', this.database, RawVehicleEventPtTmlMlSchema, vehicleEventsIndexes);
		this.ptTmlMobi = new MongoInterfaceTemplate<RawVehicleEventPtTmlMobi, RawVehicleEventPtTmlMobi>('pt-tml-mobi', this.database, RawVehicleEventPtTmlMobiSchema, vehicleEventsIndexes);
		this.ptTmlTcb = new MongoInterfaceTemplate<RawVehicleEventPtTmlTcb, RawVehicleEventPtTmlTcb>('pt-tml-tcb', this.database, RawVehicleEventPtTmlTcbSchema, vehicleEventsIndexes);
		this.ptTmlTtsl = new MongoInterfaceTemplate<RawVehicleEventPtTmlTtsl, RawVehicleEventPtTmlTtsl>('pt-tml-ttsl', this.database, RawVehicleEventPtTmlTtslSchema, vehicleEventsIndexes);
		this.ptTmpUnirUt1 = new MongoInterfaceTemplate<RawVehicleEventPtTmpUnirUt1, RawVehicleEventPtTmpUnirUt1>('pt-tmp-unir-ut1', this.database, RawVehicleEventPtTmpUnirUt1Schema, vehicleEventsIndexes);
		this.ptTmpUnirUt2 = new MongoInterfaceTemplate<RawVehicleEventPtTmpUnirUt2, RawVehicleEventPtTmpUnirUt2>('pt-tmp-unir-ut2', this.database, RawVehicleEventPtTmpUnirUt2Schema, vehicleEventsIndexes);
		this.ptTmpUnirUt3 = new MongoInterfaceTemplate<RawVehicleEventPtTmpUnirUt3, RawVehicleEventPtTmpUnirUt3>('pt-tmp-unir-ut3', this.database, RawVehicleEventPtTmpUnirUt3Schema, vehicleEventsIndexes);
		this.ptTmpUnirUt4 = new MongoInterfaceTemplate<RawVehicleEventPtTmpUnirUt4, RawVehicleEventPtTmpUnirUt4>('pt-tmp-unir-ut4', this.database, RawVehicleEventPtTmpUnirUt4Schema, vehicleEventsIndexes);
		this.ptTmpUnirUt5 = new MongoInterfaceTemplate<RawVehicleEventPtTmpUnirUt5, RawVehicleEventPtTmpUnirUt5>('pt-tmp-unir-ut5', this.database, RawVehicleEventPtTmpUnirUt5Schema, vehicleEventsIndexes);
		this.ptTmpUnirUt6 = new MongoInterfaceTemplate<RawVehicleEventPtTmpUnirUt6, RawVehicleEventPtTmpUnirUt6>('pt-tmp-unir-ut6', this.database, RawVehicleEventPtTmpUnirUt6Schema, vehicleEventsIndexes);
	}
}
