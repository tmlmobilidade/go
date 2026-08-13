package services

import (
	"archive/zip"
	"database/sql"
	"encoding/csv"
	"fmt"
	"io"
	"main/i18n"
	"main/lib"
	"main/types"
	"os"
	"reflect"
	"strings"
	"sync"
	"unicode/utf8"

	"main/config"
	dbops "main/services/database"

	_ "modernc.org/sqlite"
)

// GtfsSQLite wraps a SQLite database connection for GTFS data
type GtfsSQLite struct {
	db *sql.DB
}

// NewGtfsSQLite creates a new SQLite-backed GTFS storage
func NewGtfsSQLite(sqlitePath string) (*GtfsSQLite, error) {
	lib.AppLogger.Debug(fmt.Sprintf("Opening SQLite database: %s", sqlitePath))
	db, err := sql.Open("sqlite", sqlitePath)
	if err != nil {
		return nil, err
	}

	// SQLite speed boosters and concurrency settings
	db.Exec("PRAGMA journal_mode=WAL;")
	db.Exec("PRAGMA synchronous=NORMAL;") // NORMAL for better concurrency with WAL
	db.Exec("PRAGMA temp_store=MEMORY;")
	db.Exec("PRAGMA busy_timeout=30000;") // 30 second timeout for locked database
	db.SetMaxOpenConns(1)                 // Single connection to serialize writes and avoid locking

	// Create ID map table for primary key lookups
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS id_map (
			file TEXT NOT NULL,
			key TEXT NOT NULL,
			row_index INTEGER NOT NULL,
			PRIMARY KEY (file, key, row_index)
		);
		CREATE INDEX IF NOT EXISTS idx_id_map_file_key ON id_map(file, key);
	`)
	if err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to create id_map table: %w", err)
	}

	return &GtfsSQLite{db: db}, nil
}

// Close closes the database connection
func (g *GtfsSQLite) Close() error {
	return g.db.Close()
}

// DB returns the underlying database connection
func (g *GtfsSQLite) DB() *sql.DB {
	return g.db
}

// ImportGTFSZipToSQLite reads and imports a GTFS zip file into SQLite
func ImportGTFSZipToSQLite(zipPath, sqlitePath string) (*GtfsSQLite, error) {
	if _, err := os.Stat(zipPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("zip file does not exist: %s", zipPath)
	}

	gtfsDB, err := NewGtfsSQLite(sqlitePath)
	if err != nil {
		return nil, err
	}

	zr, err := zip.OpenReader(zipPath)
	if err != nil {
		gtfsDB.Close()
		return nil, err
	}
	defer zr.Close()

	// Mutex to serialize all database operations and prevent SQLite locking issues
	// SQLite doesn't handle concurrent writes well, so we serialize all DB operations
	var dbMutex sync.Mutex

	// Process files sequentially to avoid SQLite locking issues
	// Even with WAL mode, concurrent writes can cause locking
	for _, file := range zr.File {
		// Only process known GTFS files
		if _, ok := config.GTFSFiles[file.Name]; ok {
			if err := processGTFSFile(gtfsDB.db, file, &dbMutex); err != nil {
				lib.AppLogger.Error(fmt.Sprintf("Error processing %s: %v", file.Name, err))
				AppMessageService.AddMessage(types.Message{
					FileName: file.Name,
					Message:  fmt.Sprintf("Error processing file: %s - %v", file.Name, err),
					RuleID:   "file_validation",
					Severity: types.SEVERITY_ERROR,
					Field:    "N/A",
					Rows:     []int{},
				})
			}
		} else {
			lib.AppLogger.Debug("Skipping invalid GTFS file: " + file.Name)
			AppMessageService.AddMessage(types.Message{
				FileName: file.Name,
				Message:  i18n.AppTranslator.Get("file_validations.not_supported", file.Name),
				RuleID:   "file_validation",
				Severity: types.SEVERITY_IGNORE,
				Field:    "N/A",
				Rows:     []int{},
			})
		}
	}
	return gtfsDB, nil
}

// processGTFSFile processes a single GTFS file from the zip archive
func processGTFSFile(db *sql.DB, file *zip.File, dbMutex *sync.Mutex) error {
	r, err := file.Open()
	if err != nil {
		return fmt.Errorf("error opening file: %w", err)
	}
	defer r.Close()

	// Read content to handle BOM
	content, err := io.ReadAll(r)
	if err != nil {
		return fmt.Errorf("error reading file: %w", err)
	}

	// Remove UTF-8 BOM if present
	if len(content) >= 3 && content[0] == 0xEF && content[1] == 0xBB && content[2] == 0xBF {
		content = content[3:]
	}

	// Ensure content is valid UTF-8
	if !utf8.Valid(content) {
		return fmt.Errorf("file %s contains invalid UTF-8 encoding", file.Name)
	}

	reader := csv.NewReader(strings.NewReader(string(content)))
	reader.TrimLeadingSpace = true

	// Read headers
	headers, err := reader.Read()
	if err != nil {
		if err == io.EOF {
			return fmt.Errorf("CSV file %s is empty", file.Name)
		}
		return fmt.Errorf("could not read CSV header: %w", err)
	}

	table := strings.TrimSuffix(file.Name, ".txt")

	// Create table if it doesn't exist (serialized to prevent locking)
	dbMutex.Lock()
	if err := createSQLiteTableIfNotExists(db, table, headers); err != nil {
		dbMutex.Unlock()
		return fmt.Errorf("failed to create table %s: %w", table, err)
	}
	dbMutex.Unlock()

	// Get primary key configuration
	primaryKey, ok := types.GTFS_PRIMARY_KEYS[table]
	if !ok {
		lib.AppLogger.Debug(fmt.Sprintf("No primary key configuration found for file: %s", table))
	}

	// Prepare INSERT statement
	placeholders := "(" + strings.Repeat("?,", len(headers)-1) + "?)"
	insertSQL := fmt.Sprintf(
		"INSERT INTO %s (%s) VALUES %s",
		table,
		strings.Join(headers, ","),
		placeholders,
	)

	stmt, err := db.Prepare(insertSQL)
	if err != nil {
		return fmt.Errorf("failed to prepare insert statement: %w", err)
	}
	defer stmt.Close()

	// Prepare ID map insert statement
	idMapStmt, err := db.Prepare("INSERT OR IGNORE INTO id_map (file, key, row_index) VALUES (?, ?, ?)")
	if err != nil {
		return fmt.Errorf("failed to prepare id_map statement: %w", err)
	}
	defer idMapStmt.Close()

	// Batch insert with transaction
	// Since files are processed sequentially, we don't need mutex for transactions
	var tx *sql.Tx
	count := 0
	rowIndex := 0

	for {
		row, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			if tx != nil {
				tx.Rollback()
			}
			return fmt.Errorf("CSV read error: %w", err)
		}

		// Pad row if necessary
		if len(row) < len(headers) {
			padded := make([]string, len(headers))
			copy(padded, row)
			row = padded
		}

		// Start transaction if needed
		if tx == nil {
			tx, err = db.Begin()
			if err != nil {
				return fmt.Errorf("failed to begin transaction: %w", err)
			}
		}

		// Insert row
		_, err = tx.Stmt(stmt).Exec(convertToInterface(row)...)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("insert error: %w", err)
		}

		// Handle primary key mapping
		handlePrimaryKeyMappingSQLite(tx, idMapStmt, primaryKey, headers, row, table, rowIndex)

		count++
		rowIndex++

		// Commit batch and start new transaction
		if count >= config.BatchSize {
			if err := tx.Commit(); err != nil {
				return fmt.Errorf("failed to commit transaction: %w", err)
			}
			tx = nil
			count = 0
		}
	}

	// Commit remaining rows
	if tx != nil {
		if err := tx.Commit(); err != nil {
			return fmt.Errorf("failed to commit final transaction: %w", err)
		}
	}

	return nil
}

// handlePrimaryKeyMappingSQLite processes primary key mapping and stores in SQLite
func handlePrimaryKeyMappingSQLite(tx *sql.Tx, stmt *sql.Stmt, primaryKey any, headers []string, row []string, fileNameWithoutExt string, rowIndex int) {
	if primaryKey == nil {
		return
	}

	switch pk := primaryKey.(type) {
	case string:
		// Single primary key case
		for i, header := range headers {
			if pk == header && i < len(row) && row[i] != "" {
				tx.Stmt(stmt).Exec(fileNameWithoutExt, row[i], rowIndex)
			}
		}
	case []string:
		// Composite primary key case
		for _, key := range pk {
			for i, header := range headers {
				if key == header && i < len(row) && row[i] != "" {
					tx.Stmt(stmt).Exec(fileNameWithoutExt, row[i], rowIndex)
				}
			}
		}
	}
}

// createSQLiteTableIfNotExists is a wrapper for database.CreateTableIfNotExists
// Deprecated: Use database.CreateTableIfNotExists directly
func createSQLiteTableIfNotExists(db *sql.DB, table string, headers []string) error {
	return dbops.CreateTableIfNotExists(db, table, headers)
}

// sanitizeTableName is a wrapper for database.SanitizeTableName
// Deprecated: Use database.SanitizeTableName directly
func sanitizeTableName(name string) string {
	return dbops.SanitizeTableName(name)
}

// convertToInterface converts a []string to []any
func convertToInterface(row []string) []any {
	res := make([]any, len(row))
	for i := range row {
		res[i] = row[i]
	}
	return res
}

// LoadIdMapFromSQLite loads the ID map from SQLite into a Go map
func LoadIdMapFromSQLite(db *sql.DB) (types.GtfsIdMap, error) {
	idMap := make(types.GtfsIdMap)

	rows, err := db.Query("SELECT file, key, row_index FROM id_map ORDER BY file, key, row_index")
	if err != nil {
		return nil, fmt.Errorf("failed to query id_map: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var file, key string
		var rowIndex int
		if err := rows.Scan(&file, &key, &rowIndex); err != nil {
			return nil, fmt.Errorf("failed to scan id_map row: %w", err)
		}

		if idMap[file] == nil {
			idMap[file] = make(map[string][]int)
		}
		idMap[file][key] = append(idMap[file][key], rowIndex)
	}

	return idMap, nil
}

// QueryTableRows iterates over all rows in a table, calling fn for each row
func QueryTableRows(db *sql.DB, table string, fn func(int, map[string]string) error) error {
	if db == nil {
		return fmt.Errorf("database connection is nil")
	}

	// Get column names
	rows, err := db.Query(fmt.Sprintf("SELECT * FROM %s LIMIT 0", sanitizeTableName(table)))
	if err != nil {
		return fmt.Errorf("failed to query table %s: %w", table, err)
	}
	columns, err := rows.Columns()
	rows.Close()
	if err != nil {
		return fmt.Errorf("failed to get columns: %w", err)
	}

	// Query all rows
	rows, err = db.Query(fmt.Sprintf("SELECT * FROM %s ORDER BY rowid", sanitizeTableName(table)))
	if err != nil {
		return fmt.Errorf("failed to query rows: %w", err)
	}
	defer rows.Close()

	rowIndex := 0
	for rows.Next() {
		// Create slice of pointers to hold row values
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		if err := rows.Scan(valuePtrs...); err != nil {
			return fmt.Errorf("failed to scan row: %w", err)
		}

		// Convert row to map
		rowMap := make(map[string]string)
		for i, col := range columns {
			val := values[i]
			if val != nil {
				// Remove quotes from column names if present
				colName := strings.Trim(col, `"`)
				rowMap[colName] = fmt.Sprintf("%v", val)
			} else {
				colName := strings.Trim(col, `"`)
				rowMap[colName] = ""
			}
		}

		if err := fn(rowIndex, rowMap); err != nil {
			return err
		}
		rowIndex++
	}

	return rows.Err()
}

// GetTableRow retrieves a specific row by index from a table
func GetTableRow(db *sql.DB, table string, rowIndex int) (map[string]string, error) {
	if db == nil {
		return nil, fmt.Errorf("database connection is nil")
	}

	// Get column names
	rows, err := db.Query(fmt.Sprintf("SELECT * FROM %s LIMIT 0", sanitizeTableName(table)))
	if err != nil {
		return nil, fmt.Errorf("failed to query table %s: %w", table, err)
	}
	columns, err := rows.Columns()
	rows.Close()
	if err != nil {
		return nil, fmt.Errorf("failed to get columns: %w", err)
	}

	// Query by rowid for O(1) lookup (SQLite rowid is 1-based, rowIndex is 0-based)
	rows, err = db.Query(fmt.Sprintf("SELECT * FROM %s WHERE rowid = ?", sanitizeTableName(table)), rowIndex+1)
	if err != nil {
		return nil, fmt.Errorf("failed to query row: %w", err)
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, fmt.Errorf("row index %d not found in table %s", rowIndex, table)
	}

	// Create slice of pointers to hold row values
	values := make([]interface{}, len(columns))
	valuePtrs := make([]interface{}, len(columns))
	for i := range values {
		valuePtrs[i] = &values[i]
	}

	if err := rows.Scan(valuePtrs...); err != nil {
		return nil, fmt.Errorf("failed to scan row: %w", err)
	}

	// Convert row to map
	rowMap := make(map[string]string)
	for i, col := range columns {
		val := values[i]
		if val != nil {
			colName := strings.Trim(col, `"`)
			rowMap[colName] = fmt.Sprintf("%v", val)
		} else {
			colName := strings.Trim(col, `"`)
			rowMap[colName] = ""
		}
	}

	return rowMap, nil
}

// ConvertRowToStruct converts a map[string]string to a struct using reflection
func ConvertRowToStruct[T any](row map[string]string) T {
	var result T
	v := reflect.ValueOf(&result).Elem()
	t := v.Type()

	for i := 0; i < v.NumField(); i++ {
		field := v.Field(i)
		fieldType := t.Field(i)
		tag := fieldType.Tag.Get("gtfs")

		if tag != "" && tag != "-" {
			if value, exists := row[tag]; exists && field.CanSet() {
				field.SetString(value)
			}
		}
	}

	return result
}
