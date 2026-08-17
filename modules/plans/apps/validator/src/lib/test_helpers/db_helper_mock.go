package test_helpers

import (
	"database/sql"
	"fmt"
	"main/types"

	_ "modernc.org/sqlite"
)

// MockGtfs is a generic mock implementation of types.Gtfs for testing.
// It can be used to create fake GTFS data without requiring a database connection.
type MockGtfs struct {
	// TableCounts maps table names to their row counts.
	// If not set, counts will be calculated from IdMapData.
	TableCounts map[string]int

	// IdMapData contains the ID mapping structure: table -> id -> []row_indices
	IdMapData types.GtfsIdMap

	// TableData contains actual table data for testing validations that use GetRowsByField().
	// Maps table name -> rows, where each row is a map of column name -> value.
	TableData map[string][]map[string]string
}

// ToGtfs converts the MockGtfs to a types.Gtfs struct.
// It properly initializes IdMap and creates slice fields with appropriate lengths
// based on TableCounts or calculated from IdMapData.
func (m MockGtfs) ToGtfs() types.Gtfs {
	// Initialize IdMap by copying all tables from IdMapData
	idMap := make(types.GtfsIdMap)
	if m.IdMapData != nil {
		for table, ids := range m.IdMapData {
			// Deep copy the map
			idMap[table] = make(map[string][]int)
			for id, rows := range ids {
				// Copy the slice
				idMap[table][id] = make([]int, len(rows))
				copy(idMap[table][id], rows)
			}
		}
	}

	// Calculate table counts if not provided
	tableCounts := make(map[string]int)
	if m.TableCounts != nil {
		for table, count := range m.TableCounts {
			tableCounts[table] = count
		}
	}

	// Calculate missing counts from IdMap
	if m.IdMapData != nil {
		for table, ids := range m.IdMapData {
			if _, exists := tableCounts[table]; !exists {
				// Count unique row indices across all IDs in this table
				uniqueRows := make(map[int]bool)
				for _, rows := range ids {
					for _, row := range rows {
						uniqueRows[row] = true
					}
				}
				tableCounts[table] = len(uniqueRows)
			}
		}
	}

	// Create Gtfs struct with appropriate slice lengths
	gtfs := types.Gtfs{
		IdMap: idMap,
	}

	// Set slice fields based on table counts
	// This ensures len(gtfs.Agency), len(gtfs.Route), etc. work correctly
	if count, ok := tableCounts["agency"]; ok {
		gtfs.Agency = make([]types.AgencyRaw, count)
	}
	if count, ok := tableCounts["routes"]; ok {
		gtfs.Route = make([]types.RouteRaw, count)
	}
	if count, ok := tableCounts["stops"]; ok {
		gtfs.Stop = make([]types.StopRaw, count)
	}
	if count, ok := tableCounts["trips"]; ok {
		gtfs.Trip = make([]types.TripRaw, count)
	}
	if count, ok := tableCounts["stop_times"]; ok {
		gtfs.StopTime = make([]types.StopTimeRaw, count)
	}
	if count, ok := tableCounts["calendar"]; ok {
		gtfs.Calendar = make([]types.CalendarRaw, count)
	}
	if count, ok := tableCounts["calendar_dates"]; ok {
		gtfs.CalendarDates = make([]types.CalendarDatesRaw, count)
	}
	if count, ok := tableCounts["route_networks"]; ok {
		gtfs.RouteNetwork = make([]types.RouteNetworkRaw, count)
	}

	return gtfs
}

// ToGtfsWithDB converts the MockGtfs to a types.Gtfs struct with an in-memory SQLite database.
// This is useful for testing validations that use GetRowsById() which requires a database connection.
// Returns the Gtfs pointer, a cleanup function to close the database, and any error.
func (m MockGtfs) ToGtfsWithDB() (*types.Gtfs, func(), error) {
	// Create in-memory SQLite database
	db, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		return nil, nil, fmt.Errorf("failed to open in-memory database: %w", err)
	}

	cleanup := func() {
		db.Close()
	}

	// Create id_map table (same schema as gtfs_sqlite.go)
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS id_map (
			file TEXT NOT NULL,
			key TEXT NOT NULL,
			row_index INTEGER NOT NULL,
			PRIMARY KEY (file, key, row_index)
		)
	`)
	if err != nil {
		cleanup()
		return nil, nil, fmt.Errorf("failed to create id_map table: %w", err)
	}

	// Insert IdMapData into id_map table
	if m.IdMapData != nil {
		stmt, err := db.Prepare("INSERT INTO id_map (file, key, row_index) VALUES (?, ?, ?)")
		if err != nil {
			cleanup()
			return nil, nil, fmt.Errorf("failed to prepare insert statement: %w", err)
		}
		defer stmt.Close()

		for table, ids := range m.IdMapData {
			for id, rows := range ids {
				for _, rowIdx := range rows {
					_, err := stmt.Exec(table, id, rowIdx)
					if err != nil {
						cleanup()
						return nil, nil, fmt.Errorf("failed to insert id_map row: %w", err)
					}
				}
			}
		}
	}

	// Insert TableData into actual SQLite tables
	if m.TableData != nil {
		for table, rows := range m.TableData {
			if len(rows) == 0 {
				continue
			}
			// Collect all column names from all rows
			colSet := make(map[string]bool)
			for _, row := range rows {
				for col := range row {
					colSet[col] = true
				}
			}
			columns := make([]string, 0, len(colSet))
			for col := range colSet {
				columns = append(columns, col)
			}

			// Create table
			colDefs := ""
			for i, col := range columns {
				if i > 0 {
					colDefs += ", "
				}
				colDefs += col + " TEXT"
			}
			createSQL := fmt.Sprintf("CREATE TABLE IF NOT EXISTS %s (%s)", table, colDefs)
			if _, err := db.Exec(createSQL); err != nil {
				cleanup()
				return nil, nil, fmt.Errorf("failed to create table %s: %w", table, err)
			}

			// Insert rows
			placeholders := ""
			for i := range columns {
				if i > 0 {
					placeholders += ", "
				}
				placeholders += "?"
			}
			colNames := ""
			for i, col := range columns {
				if i > 0 {
					colNames += ", "
				}
				colNames += col
			}
			insertSQL := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s)", table, colNames, placeholders)
			dataStmt, err := db.Prepare(insertSQL)
			if err != nil {
				cleanup()
				return nil, nil, fmt.Errorf("failed to prepare table data insert: %w", err)
			}
			for _, row := range rows {
				vals := make([]interface{}, len(columns))
				for i, col := range columns {
					vals[i] = row[col]
				}
				if _, err := dataStmt.Exec(vals...); err != nil {
					dataStmt.Close()
					cleanup()
					return nil, nil, fmt.Errorf("failed to insert table data row: %w", err)
				}
			}
			dataStmt.Close()
		}
	}

	// Build IdMap copy for backward compatibility
	idMap := make(types.GtfsIdMap)
	if m.IdMapData != nil {
		for table, ids := range m.IdMapData {
			idMap[table] = make(map[string][]int)
			for id, rows := range ids {
				idMap[table][id] = make([]int, len(rows))
				copy(idMap[table][id], rows)
			}
		}
	}

	// Create Gtfs struct with SQLite connection
	gtfs := types.NewGtfsFromSQLite(db, ":memory:")
	gtfs.IdMap = idMap

	// Set slice fields based on table counts (same as ToGtfs)
	tableCounts := make(map[string]int)
	if m.TableCounts != nil {
		for table, count := range m.TableCounts {
			tableCounts[table] = count
		}
	}
	if m.IdMapData != nil {
		for table, ids := range m.IdMapData {
			if _, exists := tableCounts[table]; !exists {
				uniqueRows := make(map[int]bool)
				for _, rows := range ids {
					for _, row := range rows {
						uniqueRows[row] = true
					}
				}
				tableCounts[table] = len(uniqueRows)
			}
		}
	}

	if count, ok := tableCounts["agency"]; ok {
		gtfs.Agency = make([]types.AgencyRaw, count)
	}
	if count, ok := tableCounts["routes"]; ok {
		gtfs.Route = make([]types.RouteRaw, count)
	}
	if count, ok := tableCounts["stops"]; ok {
		gtfs.Stop = make([]types.StopRaw, count)
	}
	if count, ok := tableCounts["trips"]; ok {
		gtfs.Trip = make([]types.TripRaw, count)
	}
	if count, ok := tableCounts["stop_times"]; ok {
		gtfs.StopTime = make([]types.StopTimeRaw, count)
	}
	if count, ok := tableCounts["calendar"]; ok {
		gtfs.Calendar = make([]types.CalendarRaw, count)
	}
	if count, ok := tableCounts["calendar_dates"]; ok {
		gtfs.CalendarDates = make([]types.CalendarDatesRaw, count)
	}
	if count, ok := tableCounts["route_networks"]; ok {
		gtfs.RouteNetwork = make([]types.RouteNetworkRaw, count)
	}

	return gtfs, cleanup, nil
}

// GetTableCount returns the number of rows in a table.
// It first checks TableCounts, then calculates from IdMapData if needed.
func (m MockGtfs) GetTableCount(table string) (int, error) {
	// Check if explicitly set
	if m.TableCounts != nil {
		if count, ok := m.TableCounts[table]; ok {
			return count, nil
		}
	}

	// Calculate from IdMapData
	if m.IdMapData != nil {
		if tableMap, ok := m.IdMapData[table]; ok {
			uniqueRows := make(map[int]bool)
			for _, rows := range tableMap {
				for _, row := range rows {
					uniqueRows[row] = true
				}
			}
			return len(uniqueRows), nil
		}
	}

	return 0, fmt.Errorf("table %s not found in mock", table)
}

// GetRowsById returns the row indices for a given table and ID.
// This matches the signature of types.Gtfs.GetRowsById which returns []int.
func (m MockGtfs) GetRowsById(table, id string) ([]int, error) {
	if m.IdMapData != nil {
		if tableMap, ok := m.IdMapData[table]; ok {
			if indices, found := tableMap[id]; found {
				// Return a copy of the slice
				result := make([]int, len(indices))
				copy(result, indices)
				return result, nil
			}
		}
	}
	return []int{}, nil
}

// IdMap returns the IdMapData directly.
// This is provided for convenience when you need direct access to the IdMap.
func (m MockGtfs) IdMap() types.GtfsIdMap {
	return m.IdMapData
}
