package services

import (
	"database/sql"
	"fmt"
	dbops "main/services/database"
	"strings"
)

// SQLiteTable shares a database connection and column names, never row values.
type SQLiteTable struct {
	db      *sql.DB
	name    string
	columns map[string]bool
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
	table *SQLiteTable
	Row   int
}

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

// FieldWithCount reads a field and counts equal values in this table in one query.
func (r *SQLiteRow) FieldWithCount(field string) (string, int, error) {
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
