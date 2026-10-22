package services

import (
	"database/sql"
	"fmt"
	"main/lib"
	dbops "main/services/database"
	"strings"
)

// SQLiteTable shares a database connection and column names, never row values.
type SQLiteTable struct {
	db       *sql.DB
	name     string
	columns  map[string]bool
	prepared *SQLiteTables
}

func NewSQLiteTable(db *sql.DB, name string) (*SQLiteTable, error) {
	if db == nil {
		return nil, fmt.Errorf("database connection is nil")
	}
	rows, err := db.Query("SELECT * FROM " + dbops.SanitizeTableName(name) + " LIMIT 0")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	columns, err := rows.Columns()
	if err != nil {
		return nil, err
	}
	table := &SQLiteTable{db: db, name: name, columns: make(map[string]bool, len(columns))}
	for _, column := range columns {
		table.columns[column] = true
	}
	return table, nil
}

// SQLiteRow identifies a source row. Row is its zero-based data-row index.
type SQLiteRow struct {
	table   *SQLiteTable
	Row     int
	context *SQLiteContext
	name    string
}

// SQLiteContext exposes the current validation row and access to other tables.
// Named handles support table-wide existence checks from any source table.
// Field reads are bound only to the current table; other rows require Table(name).At(row).
type SQLiteContext struct {
	Row            int
	Agency         *SQLiteRow
	BookingRules   *SQLiteRow
	Calendar       *SQLiteRow
	CalendarDates  *SQLiteRow
	FareAttributes *SQLiteRow
	FeedInfo       *SQLiteRow
	Levels         *SQLiteRow
	RouteNetworks  *SQLiteRow
	Routes         *SQLiteRow
	Shapes         *SQLiteRow
	StopTimes      *SQLiteRow
	Stops          *SQLiteRow
	Transfers      *SQLiteRow
	Trips          *SQLiteRow
	Vehicles       *SQLiteRow
	source         *SQLiteRow
}

func (r *SQLiteRow) Context() *SQLiteContext {
	ctx := &SQLiteContext{Row: r.Row, source: r}
	bind := func(name string) *SQLiteRow {
		if strings.EqualFold(r.table.name, name) {
			return r
		}
		return &SQLiteRow{Row: -1, context: ctx, name: name}
	}
	ctx.Agency = bind("agency")
	ctx.BookingRules = bind("booking_rules")
	ctx.Calendar = bind("calendar")
	ctx.CalendarDates = bind("calendar_dates")
	ctx.FareAttributes = bind("fare_attributes")
	ctx.FeedInfo = bind("feed_info")
	ctx.Levels = bind("levels")
	ctx.RouteNetworks = bind("route_networks")
	ctx.Routes = bind("routes")
	ctx.Shapes = bind("shapes")
	ctx.StopTimes = bind("stop_times")
	ctx.Stops = bind("stops")
	ctx.Transfers = bind("transfers")
	ctx.Trips = bind("trips")
	ctx.Vehicles = bind("vehicles")
	return ctx
}

// Table selects any imported table. It does not fetch or cache field values.
func (c *SQLiteContext) Table(name string) (*SQLiteTable, error) {
	if c.source.table.prepared != nil {
		return c.source.table.prepared.Table(name)
	}
	if strings.EqualFold(name, c.source.table.name) {
		return c.source.table, nil
	}
	return NewSQLiteTable(c.source.table.db, name)
}

// At selects a row by zero-based index.
func (t *SQLiteTable) At(row int) *SQLiteRow {
	return &SQLiteRow{table: t, Row: row}
}

// ForEachRow reads row IDs only. Callbacks may query fields through the row context.
// The database pool must allow another connection while this cursor is open.
func (t *SQLiteTable) ForEachRow(fn func(*SQLiteRow) error) error {
	rows, err := t.db.Query("SELECT rowid FROM " + dbops.SanitizeTableName(t.name) + " ORDER BY rowid")
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var rowID int
		if err := rows.Scan(&rowID); err != nil {
			return err
		}
		if err := fn(t.At(rowID - 1)); err != nil {
			return err
		}
	}
	return rows.Err()
}

// column returns SQL NULL for an absent CSV header, so required-field rules can
// validate it without treating it as a failed database query.
func (t *SQLiteTable) column(alias, field string) string {
	if !t.columns[field] {
		return "NULL"
	}
	return alias + "." + dbops.SanitizeColumnName(field)
}

// Fields requests only the named fields in one query. Missing columns and SQL
// NULL values are represented by empty strings, just like empty CSV cells.
func (r *SQLiteRow) Fields(fields ...string) (map[string]string, error) {
	if r.table == nil {
		return nil, fmt.Errorf("select a row from %s before reading fields", r.name)
	}
	if len(fields) == 0 {
		return nil, fmt.Errorf("at least one field is required")
	}
	columns := make([]string, len(fields))
	values := make([]sql.NullString, len(fields))
	targets := make([]any, len(fields))
	for i, field := range fields {
		columns[i] = r.table.column("source", field)
		targets[i] = &values[i]
	}
	query := "SELECT " + strings.Join(columns, ", ") + " FROM " + dbops.SanitizeTableName(r.table.name) + " AS source WHERE source.rowid = ?"
	if err := r.table.db.QueryRow(query, r.Row+1).Scan(targets...); err != nil {
		return nil, fmt.Errorf("read %s row %d: %w", r.table.name, r.Row, err)
	}
	result := make(map[string]string, len(fields))
	for i, field := range fields {
		result[field] = values[i].String
	}
	return result, nil
}

func (r *SQLiteRow) Field(field string) (string, error) {
	values, err := r.Fields(field)
	return values[field], err
}

// Exists checks a value across the table without loading matching rows.
func (t *SQLiteTable) Exists(field string, value string) (bool, error) {
	query := "SELECT EXISTS(SELECT 1 FROM " + dbops.SanitizeTableName(t.name) +
		" AS source WHERE " + t.column("source", field) + " = ?)"
	var exists bool
	if err := t.db.QueryRow(query, value).Scan(&exists); err != nil {
		return false, fmt.Errorf("check %s.%s: %w", t.name, field, err)
	}
	return exists, nil
}

// FieldWithCount reads a field and counts equal values in this table in one query.
func (r *SQLiteRow) FieldWithCount(field string) (string, int, error) {
	if r.table == nil {
		return "", 0, fmt.Errorf("select a row from %s before reading fields", r.name)
	}
	table := dbops.SanitizeTableName(r.table.name)
	column := r.table.column("source", field)
	query := "SELECT " + column + ", (SELECT COUNT(*) FROM " + table + " AS other WHERE " + r.table.column("other", field) + " = " + column + ") FROM " + table + " AS source WHERE source.rowid = ?"
	var value sql.NullString
	var count int
	if err := r.table.db.QueryRow(query, r.Row+1).Scan(&value, &count); err != nil {
		return "", 0, fmt.Errorf("read %s.%s row %d: %w", r.table.name, field, r.Row, err)
	}
	return value.String, count, nil
}

// Count returns the number of imported rows in this table.
func (t *SQLiteTable) Count() (int, error) {
	var count int
	err := t.db.QueryRow("SELECT COUNT(*) FROM " + dbops.SanitizeTableName(t.name)).Scan(&count)
	return count, err
}

// HasColumn reports whether a field header was imported.
func (r *SQLiteRow) HasColumn(field string) bool { return r.table != nil && r.table.columns[field] }

// Exists checks the named table, independent of the current source row.
// Query failures are logged and return false. Use Table(name).Exists when the
// caller needs to handle the error directly.
func (r *SQLiteRow) Exists(field, value string) bool {
	table := r.table
	if table == nil {
		var err error
		table, err = r.context.Table(r.name)
		if err != nil {
			lib.AppLogger.Error(fmt.Sprintf("SQLite existence check failed: %v", err))
			return false
		}
	}
	exists, err := table.Exists(field, value)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("SQLite existence check failed: %v", err))
		return false
	}
	return exists
}

// ExistsMatching checks that all requested values occur in the same row.
func (t *SQLiteTable) ExistsMatching(fields map[string]string) (bool, error) {
	if len(fields) == 0 {
		return false, fmt.Errorf("at least one field is required")
	}
	conditions := make([]string, 0, len(fields))
	values := make([]any, 0, len(fields))
	for field, value := range fields {
		conditions = append(conditions, t.column("source", field)+" = ?")
		values = append(values, value)
	}
	query := "SELECT EXISTS(SELECT 1 FROM " + dbops.SanitizeTableName(t.name) + " AS source WHERE " + strings.Join(conditions, " AND ") + ")"
	var exists bool
	if err := t.db.QueryRow(query, values...).Scan(&exists); err != nil {
		return false, err
	}
	return exists, nil
}

// ForEachMatching selects source rows whose field equals the supplied value.
// Values are bound parameters; callers can request just the fields they need.
func (t *SQLiteTable) ForEachMatching(field, value string, fn func(*SQLiteRow) error) error {
	query := "SELECT rowid FROM " + dbops.SanitizeTableName(t.name) + " AS source WHERE COALESCE(" + t.column("source", field) + ", '') = ? ORDER BY rowid"
	rows, err := t.db.Query(query, value)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var rowID int
		if err := rows.Scan(&rowID); err != nil {
			return err
		}
		if err := fn(t.At(rowID - 1)); err != nil {
			return err
		}
	}
	return rows.Err()
}
