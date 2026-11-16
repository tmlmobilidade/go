// Package sqlite provides a SQLite database, buffered tables and a persistent map.
//
// Public names retain the TypeScript names with Go's required initial capitals.
// RegisterTable, Query and Distinct are package functions because Go methods
// cannot declare additional type parameters. Rows may be structs (using db or
// json field tags) or map[string]any. Operations return errors instead of throwing.
// Iterators yield a value and an error; breaking the loop closes the cursor.
// As in the original client, reads and Cleanup do not flush buffered writes.
// Call Flush explicitly before reading or closing a table.
// SQLiteMap and SQLiteWriter own their databases; call Cleanup when finished.
package sqlite
