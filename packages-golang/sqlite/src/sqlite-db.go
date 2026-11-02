package sqlite

/* * */

import (
	"crypto/rand"
	"database/sql"
	"errors"
	"fmt"
	"iter"
	"log"
	"os"
	"path/filepath"
	"reflect"
	"sort"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

/* * */

type SQLiteDatabase struct {
	DatabaseInstance *sql.DB
	config           SQLiteDatabaseConfig
	tables           map[string]any
}

func NewSQLiteDatabase(config SQLiteDatabaseConfig) (*SQLiteDatabase, error) {
	// If not provided, generate random values
	// and create a new database instance.
	if config.Memory {
		config.InstancePath = ""
	} else {
		if config.InstanceName == "" {
			config.InstanceName = generateRandomString()
		}
		if config.InstancePath == "" {
			instanceDirectory := filepath.Join(os.TempDir(), config.InstanceName)
			if err := os.MkdirAll(instanceDirectory, 0o700); err != nil {
				return nil, err
			}
			config.InstancePath = filepath.Join(instanceDirectory, config.InstanceName+".db")
			log.Printf("[SQLITE] Created database at %s", config.InstancePath)
		}
	}

	// Initialize the database instance
	created := config.DatabaseInstance == nil
	if created {
		path := config.InstancePath
		if config.Memory {
			path = ":memory:"
		}
		var err error
		config.DatabaseInstance, err = createDatabase(path, "ON")
		if err != nil {
			return nil, err
		}
	} else {
		config.DatabaseInstance.SetMaxOpenConns(1)
		if _, err := config.DatabaseInstance.Exec("PRAGMA journal_mode = WAL; PRAGMA synchronous = ON; PRAGMA temp_store = MEMORY;"); err != nil {
			return nil, err
		}
	}
	return &SQLiteDatabase{DatabaseInstance: config.DatabaseInstance, config: config, tables: make(map[string]any)}, nil
}

// Closes the database instance and handles cleanup of the
// database file, either if the database is in memory or on disk.
func (database *SQLiteDatabase) Cleanup() error {
	if err := database.DatabaseInstance.Close(); err != nil {
		return err
	}
	if database.config.InstancePath != "" {
		return removeDatabase(database.config.InstancePath)
	}
	return nil
}

// Registers a new table and returns an object with methods for that table.
func RegisterTable[T any](database *SQLiteDatabase, tableName string, params SQLiteTable[T]) (*SQLiteTableInstance[T], error) {
	if _, exists := database.tables[tableName]; exists {
		return nil, fmt.Errorf("table %q already registered", tableName)
	}
	tableInstance, err := NewSQLiteTableInstance(database.DatabaseInstance, tableName, params)
	if err != nil {
		return nil, err
	}
	database.tables[tableName] = tableInstance
	return tableInstance, nil
}

/* * */

type SQLiteTableInstance[T any] struct {
	// Constructor
	batch            []T
	batchSize        int
	columns          []SQLiteColumn[T]
	databaseInstance *sql.DB
	insertStatement  *sql.Stmt
	tableName        string
}

func NewSQLiteTableInstance[T any](databaseInstance *sql.DB, tableName string, params SQLiteTable[T]) (*SQLiteTableInstance[T], error) {
	// Set up properties
	batchSize := params.Batch_size
	if batchSize == 0 {
		batchSize = 3000
	}
	if batchSize < 1 || len(params.Columns) == 0 {
		return nil, errors.New("a positive batch size and at least one column are required")
	}
	table := &SQLiteTableInstance[T]{batchSize: batchSize, columns: params.Columns, databaseInstance: databaseInstance, tableName: tableName}

	// Create table
	definitions := make([]string, len(params.Columns))
	columnNames := make([]string, len(params.Columns))
	placeholders := make([]string, len(params.Columns))
	for i, c := range params.Columns {
		switch c.Type {
		case "BLOB", "BOOLEAN", "INTEGER", "REAL", "TEXT":
		default:
			return nil, fmt.Errorf("unsupported SQLite column type %q", c.Type)
		}
		columnNames[i] = quoteIdentifier(c.Name)
		definitions[i] = columnNames[i] + " " + c.Type
		placeholders[i] = "?"
	}
	if _, err := databaseInstance.Exec("CREATE TABLE IF NOT EXISTS " + quoteIdentifier(tableName) + " (" + strings.Join(definitions, ", ") + ")"); err != nil {
		return nil, err
	}

	// Create indexes
	for _, c := range params.Columns {
		if c.Indexed {
			if _, err := databaseInstance.Exec("CREATE INDEX IF NOT EXISTS " + quoteIdentifier("idx_"+tableName+"_"+c.Name) + " ON " + quoteIdentifier(tableName) + "(" + quoteIdentifier(c.Name) + ")"); err != nil {
				return nil, err
			}
		}
	}

	// Prepare insert statement
	insertSQL := "INSERT INTO " + quoteIdentifier(tableName) + " (" + strings.Join(columnNames, ", ") + ") VALUES (" + strings.Join(placeholders, ", ") + ")"
	var err error
	table.insertStatement, err = databaseInstance.Prepare(insertSQL)
	if err != nil {
		return nil, err
	}
	return table, nil
}

// Get the number of rows in the table.
func (table *SQLiteTableInstance[T]) Size() (int, error) {
	var count int
	err := table.databaseInstance.QueryRow("SELECT COUNT(*) as count FROM " + quoteIdentifier(table.tableName)).Scan(&count)
	return count, err
}

// Get all rows, optionally filtered by a WHERE clause.
// whereClause is an optional SQL WHERE clause (e.g., "WHERE id = ?").
func (table *SQLiteTableInstance[T]) All(whereClause string, params ...any) ([]T, error) {
	return Query[T](table.databaseInstance, "SELECT * FROM "+quoteIdentifier(table.tableName)+" "+whereClause, params...)
}

// Clears all entries from the map.
func (table *SQLiteTableInstance[T]) Clear() error {
	_, err := table.databaseInstance.Exec("DELETE FROM " + quoteIdentifier(table.tableName))
	return err
}

// Finds all distinct values for a column in the table.
func Distinct[V, T any](table *SQLiteTableInstance[T], col string) ([]V, error) {
	rows, err := table.databaseInstance.Query("SELECT DISTINCT " + quoteIdentifier(col) + " FROM " + quoteIdentifier(table.tableName))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	values := make([]V, 0)
	for rows.Next() {
		var value V
		if err := rows.Scan(&value); err != nil {
			return nil, err
		}
		values = append(values, value)
	}
	return values, rows.Err()
}

// Flush current buffer into DB synchronously.
func (table *SQLiteTableInstance[T]) Flush() error {
	// Skip if batch is empty
	if len(table.batch) == 0 {
		return nil
	}
	// Prepare the operation
	insertManyOperation, err := table.databaseInstance.Begin()
	if err != nil {
		return err
	}
	defer insertManyOperation.Rollback()
	insertStatement := insertManyOperation.Stmt(table.insertStatement)
	defer insertStatement.Close()
	for _, row := range table.batch {
		// Populate the columns with the row values
		// to ensure the order of placeholders is preserved
		rowValues := make([]any, len(table.columns))
		for i, col := range table.columns {
			value, err := columnValue(row, col.Name)
			if err != nil {
				return err
			}
			// Convert boolean to 0 or 1
			if boolean, ok := value.(bool); ok {
				if boolean {
					rowValues[i] = 1
				} else {
					rowValues[i] = 0
				}
			} else {
				rowValues[i] = value
			}
		}
		if _, err := insertStatement.Exec(rowValues...); err != nil {
			return err
		}
	}
	// Run the operation
	if err := insertManyOperation.Commit(); err != nil {
		return err
	}
	// Empty batch
	table.batch = nil
	return nil
}

// Get a single row by column value.
// Returns nil if not found.
func (table *SQLiteTableInstance[T]) Get(col string, value any) (*T, error) {
	rows, err := table.All("WHERE "+quoteIdentifier(col)+" = ? LIMIT 1", value)
	if err != nil || len(rows) == 0 {
		return nil, err
	}
	return &rows[0], nil
}

// Check if a row exists by column value.
func (table *SQLiteTableInstance[T]) Has(col string, value any) (bool, error) {
	var exists int
	err := table.databaseInstance.QueryRow("SELECT 1 FROM "+quoteIdentifier(table.tableName)+" WHERE "+quoteIdentifier(col)+" = ? LIMIT 1", value).Scan(&exists)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	return err == nil, err
}

// Execute a query and return the result as an array of rows.
func Query[R any](databaseInstance *sql.DB, sqlQuery string, params ...any) ([]R, error) {
	result := make([]R, 0)
	for row, err := range stream[R](databaseInstance, sqlQuery, params...) {
		if err != nil {
			return nil, err
		}
		result = append(result, row)
	}
	return result, nil
}

// Execute a query and return the result as an array of rows.
func (table *SQLiteTableInstance[T]) Query(sqlQuery string, params ...any) ([]T, error) {
	return Query[T](table.databaseInstance, sqlQuery, params...)
}

// Iterator to go through all rows in the table.
func (table *SQLiteTableInstance[T]) Stream(whereClause string, params ...any) iter.Seq2[T, error] {
	// Create an iterator for the query
	return stream[T](table.databaseInstance, "SELECT * FROM "+quoteIdentifier(table.tableName)+" "+whereClause, params...)
}

// Update one or more rows in the table.
// whereClause is the WHERE expression without the WHERE keyword.
// Returns the updated rows.
func (table *SQLiteTableInstance[T]) Update(whereClause string, newData map[string]any, params ...any) ([]T, error) {
	if len(newData) == 0 {
		return nil, errors.New("newData must contain at least one column")
	}
	keys := make([]string, 0, len(newData))
	for key := range newData {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	assignments := make([]string, len(keys))
	rowValues := make([]any, 0, len(keys)+len(params))
	for i, key := range keys {
		assignments[i] = quoteIdentifier(key) + " = ?"
		rowValues = append(rowValues, newData[key])
	}
	sqlQuery := "UPDATE " + quoteIdentifier(table.tableName) + " SET " + strings.Join(assignments, ", ")
	if whereClause != "" {
		sqlQuery += " WHERE " + whereClause
	}
	return table.Query(sqlQuery+" RETURNING *", append(rowValues, params...)...)
}

// Add one item to buffer, flush automatically when batchSize reached.
func (table *SQLiteTableInstance[T]) Write(item T) error {
	table.batch = append(table.batch, item)
	if len(table.batch) >= table.batchSize {
		return table.Flush()
	}
	return nil
}

/* * */

func generateRandomString() string {
	return strings.ToLower(rand.Text())
}

func quoteIdentifier(value string) string {
	return `"` + strings.ReplaceAll(value, `"`, `""`) + `"`
}

func createDatabase(path, synchronous string) (*sql.DB, error) {
	// Set up the database
	db, err := sql.Open("sqlite3", path)
	if err != nil {
		return nil, err
	}
	// A single connection keeps in-memory databases and connection pragmas consistent.
	db.SetMaxOpenConns(1)
	if _, err := db.Exec("PRAGMA journal_mode = WAL; PRAGMA synchronous = " + synchronous + "; PRAGMA temp_store = MEMORY;"); err != nil {
		db.Close()
		return nil, err
	}
	// Return the database
	return db, nil
}

func removeDatabase(path string) error {
	for _, suffix := range []string{"", "-wal", "-shm"} {
		if err := os.Remove(path + suffix); err != nil && !errors.Is(err, os.ErrNotExist) {
			return err
		}
	}
	return nil
}

func fieldIndex(row reflect.Value, name string) int {
	for i := 0; i < row.NumField(); i++ {
		field := row.Type().Field(i)
		if !field.IsExported() {
			continue
		}
		key := strings.Split(field.Tag.Get("db"), ",")[0]
		if key == "" {
			key = strings.Split(field.Tag.Get("json"), ",")[0]
		}
		if key == "-" {
			continue
		}
		if key == name || (key == "" && strings.EqualFold(field.Name, name)) {
			return i
		}
	}
	return -1
}

func columnValue(row any, name string) (any, error) {
	value := reflect.ValueOf(row)
	for value.IsValid() && (value.Kind() == reflect.Pointer || value.Kind() == reflect.Interface) {
		value = value.Elem()
	}
	if !value.IsValid() {
		return nil, errors.New("row must not be nil")
	}
	if value.Kind() == reflect.Map && value.Type().Key().Kind() == reflect.String {
		entry := value.MapIndex(reflect.ValueOf(name).Convert(value.Type().Key()))
		if !entry.IsValid() {
			return nil, nil
		}
		return entry.Interface(), nil
	}
	if value.Kind() == reflect.Struct {
		if i := fieldIndex(value, name); i >= 0 {
			return value.Field(i).Interface(), nil
		}
		return nil, fmt.Errorf("row has no field for column %q", name)
	}
	return nil, errors.New("row must be a struct or a map with string keys")
}

func scanRow[T any](rows *sql.Rows, columns []string) (T, error) {
	var row T
	value := reflect.ValueOf(&row).Elem()
	for value.Kind() == reflect.Pointer {
		value.Set(reflect.New(value.Type().Elem()))
		value = value.Elem()
	}
	destinations := make([]any, len(columns))
	values := make([]any, len(columns))
	for i, name := range columns {
		destinations[i] = &values[i]
		if value.Kind() == reflect.Struct {
			if j := fieldIndex(value, name); j >= 0 {
				destinations[i] = value.Field(j).Addr().Interface()
			}
		}
	}
	if err := rows.Scan(destinations...); err != nil {
		return row, err
	}
	if value.Kind() == reflect.Struct {
		return row, nil
	}
	if value.Kind() != reflect.Map || value.Type().Key().Kind() != reflect.String || value.Type().Elem() != reflect.TypeFor[any]() {
		return row, errors.New("query result must be a struct or map with string keys and any values")
	}
	value.Set(reflect.MakeMap(value.Type()))
	for i, name := range columns {
		entry := reflect.ValueOf(&values[i]).Elem()
		value.SetMapIndex(reflect.ValueOf(name).Convert(value.Type().Key()), entry)
	}
	return row, nil
}

func stream[T any](databaseInstance *sql.DB, sqlQuery string, params ...any) iter.Seq2[T, error] {
	return func(yield func(T, error) bool) {
		var zero T
		rows, err := databaseInstance.Query(sqlQuery, params...)
		if err != nil {
			yield(zero, err)
			return
		}
		defer rows.Close()
		columns, err := rows.Columns()
		if err != nil {
			yield(zero, err)
			return
		}
		for rows.Next() {
			row, err := scanRow[T](rows, columns)
			if !yield(row, err) || err != nil {
				return
			}
		}
		if err := rows.Err(); err != nil {
			yield(zero, err)
		}
	}
}
