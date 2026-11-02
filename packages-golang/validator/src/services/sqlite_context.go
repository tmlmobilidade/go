package services

import (
	"database/sql"
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	dbops "github.com/tmlmobilidade/go/packages-golang/validator/src/services/database"
	"sort"
	"strings"
)

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
	ctx.FareRules = bind("fare_rules")
	ctx.FeedInfo = bind("feed_info")
	ctx.Frequencies = bind("frequencies")
	ctx.Levels = bind("levels")
	ctx.Pathways = bind("pathways")
	ctx.RiderCategories = bind("rider_categories")
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

// readValidationRows loads one group's values in bounded queries. Validation
// does not modify the imported tables, so its row rules can share these reads.
// The returned rows and values are discarded after the group finishes.
func (t *SQLiteTable) readValidationRows(ids []int) ([]*SQLiteRow, error) {
	fields := make([]string, 0, len(t.columns))
	for name := range t.columns {
		fields = append(fields, name)
	}
	sort.Strings(fields)
	columns := []string{"source.rowid"}
	for _, name := range fields {
		columns = append(columns, t.column("source", name))
	}
	result := make([]*SQLiteRow, 0, len(ids))
	const batchSize = 500
	for start := 0; start < len(ids); start += batchSize {
		batch := ids[start:min(start+batchSize, len(ids))]
		args := make([]any, len(batch))
		for i, id := range batch {
			args[i] = id + 1
		}
		query := "SELECT " + strings.Join(columns, ", ") + " FROM " + dbops.SanitizeTableName(t.name) +
			" AS source WHERE source.rowid IN (" + strings.TrimSuffix(strings.Repeat("?,", len(batch)), ",") + ") ORDER BY source.rowid"
		rows, err := t.db.Query(query, args...)
		if err != nil {
			return nil, err
		}
		var rowID int
		values := make([]sql.NullString, len(fields))
		targets := make([]any, len(fields)+1)
		targets[0] = &rowID
		for i := range fields {
			targets[i+1] = &values[i]
		}
		for rows.Next() {
			if err := rows.Scan(targets...); err != nil {
				rows.Close()
				return nil, err
			}
			row := t.At(rowID - 1)
			row.values = make(map[string]string, len(fields))
			for i, name := range fields {
				row.values[name] = values[i].String
			}
			result = append(result, row)
		}
		err = rows.Err()
		rows.Close()
		if err != nil {
			return nil, err
		}
	}
	if len(result) != len(ids) {
		return nil, fmt.Errorf("read %s validation group: expected %d rows, got %d", t.name, len(ids), len(result))
	}
	return result, nil
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
