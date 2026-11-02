package types

// SQLiteContext exposes the current validation row and access to other tables.
// Named handles support table-wide existence checks from any source table.
// Field reads are bound only to the current table; other rows require Table(name).At(row).
type SQLiteContext struct {
	Row             int
	Agency          *SQLiteRow
	BookingRules    *SQLiteRow
	Calendar        *SQLiteRow
	CalendarDates   *SQLiteRow
	FareAttributes  *SQLiteRow
	FareRules       *SQLiteRow
	FeedInfo        *SQLiteRow
	Frequencies     *SQLiteRow
	Levels          *SQLiteRow
	Pathways        *SQLiteRow
	RiderCategories *SQLiteRow
	RouteNetworks   *SQLiteRow
	Routes          *SQLiteRow
	Shapes          *SQLiteRow
	StopTimes       *SQLiteRow
	Stops           *SQLiteRow
	Transfers       *SQLiteRow
	Trips           *SQLiteRow
	Vehicles        *SQLiteRow
	source          *SQLiteRow
}