/* * */

import { MongoInterfaceTemplate } from '@/interface.template.js';
import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type RawVehicleEvent, RawVehicleEventSchema } from '@tmlmobilidade/go-types-vehicle-events';

/* * */

export class VehicleEventsDatabase {
	//

	//
	// Collections

	public readonly esCrtmAisa: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly esCrtmLaVeloz: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlCcfl: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlCmAlsa: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlCmRl: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlCmTst: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlCmVa: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlCp: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlFertagus: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlMl: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlMobi: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlTcb: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlTtsl: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmpUnirUt1: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmpUnirUt2: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmpUnirUt3: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmpUnirUt4: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmpUnirUt5: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;

	private readonly database: Db;
	private readonly databaseName = 'vehicle-events';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);

		// Create collection interfaces
		this.esCrtmAisa = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('es-crtm-aisa-fetch', this.database, RawVehicleEventSchema);
		this.esCrtmLaVeloz = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('es-crtm-la-veloz-fetch', this.database, RawVehicleEventSchema);
		this.ptTmlCcfl = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-ccfl-fetch', this.database, RawVehicleEventSchema);
		this.ptTmlCmAlsa = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-cm-alsa', this.database, RawVehicleEventSchema);
		this.ptTmlCmRl = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-cm-rl', this.database, RawVehicleEventSchema);
		this.ptTmlCmTst = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-cm-tst', this.database, RawVehicleEventSchema);
		this.ptTmlCmVa = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-cm-va', this.database, RawVehicleEventSchema);
		this.ptTmlCp = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-cp-fetch', this.database, RawVehicleEventSchema);
		this.ptTmlFertagus = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-fertagus-fetch', this.database, RawVehicleEventSchema);
		this.ptTmlMl = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-ml-fetch', this.database, RawVehicleEventSchema);
		this.ptTmlMobi = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-mobi-fetch', this.database, RawVehicleEventSchema);
		this.ptTmlTcb = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-tcb-fetch', this.database, RawVehicleEventSchema);
		this.ptTmlTtsl = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-ttsl-fetch', this.database, RawVehicleEventSchema);
		this.ptTmpUnirUt1 = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tmp-unir-ut1', this.database, RawVehicleEventSchema);
		this.ptTmpUnirUt2 = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tmp-unir-ut2', this.database, RawVehicleEventSchema);
		this.ptTmpUnirUt3 = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tmp-unir-ut3', this.database, RawVehicleEventSchema);
		this.ptTmpUnirUt4 = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tmp-unir-ut4', this.database, RawVehicleEventSchema);
		this.ptTmpUnirUt5 = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tmp-unir-ut5', this.database, RawVehicleEventSchema);
	}
}
