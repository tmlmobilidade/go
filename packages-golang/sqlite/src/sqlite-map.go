package sqlite

/* * */

import (
	"database/sql"
	"encoding/json"
	"errors"
	"iter"
	"os"
	"path/filepath"
)

/* * */

// A map-like structure backed by SQLite for persistent key-value storage.
// Use it to store and retrieve data across sessions without memory constraints.
// The API is similar to the native javascript Map object.
type SQLiteMap[K ~string, V any] struct {
	databaseInstance *sql.DB
	instancePath     string
}

func NewSQLiteMap[K ~string, V any]() (*SQLiteMap[K, V], error) {
	// Set up a new database instance
	databaseFileName := generateRandomString()
	instancePath := filepath.Join(os.TempDir(), databaseFileName+".db")
	databaseInstance, err := createDatabase(instancePath, "NORMAL")
	if err != nil {
		return nil, err
	}

	// Create a new table if it doesn't exist
	if _, err := databaseInstance.Exec("CREATE TABLE IF NOT EXISTS map (key TEXT PRIMARY KEY, value TEXT NOT NULL)"); err != nil {
		databaseInstance.Close()
		removeDatabase(instancePath)
		return nil, err
	}
	return &SQLiteMap[K, V]{databaseInstance: databaseInstance, instancePath: instancePath}, nil
}

// Returns the number of entries in the map.
func (m *SQLiteMap[K, V]) Size() (int, error) {
	var count int
	err := m.databaseInstance.QueryRow("SELECT COUNT(*) as count FROM map").Scan(&count)
	return count, err
}

// Clears all entries from the map.
func (m *SQLiteMap[K, V]) Clear() error {
	_, err := m.databaseInstance.Exec("DELETE FROM map")
	return err
}

// Deletes a key-value pair from the map.
// Returns true if the entry was deleted, false if it didn't exist.
func (m *SQLiteMap[K, V]) Delete(key K) (bool, error) {
	result, err := m.databaseInstance.Exec("DELETE FROM map WHERE key = ?", string(key))
	if err != nil {
		return false, err
	}
	changes, err := result.RowsAffected()
	return changes > 0, err
}

// Returns an iterator over the entries in the map.
func (m *SQLiteMap[K, V]) Entries() iter.Seq2[SQLiteMapEntry[K, V], error] {
	return func(yield func(SQLiteMapEntry[K, V], error) bool) {
		statement := stream[struct{ Key, Value string }](m.databaseInstance, "SELECT key, value FROM map")
		for row, err := range statement {
			entry := SQLiteMapEntry[K, V]{Key: K(row.Key)}
			if err == nil {
				err = json.Unmarshal([]byte(row.Value), &entry.Value)
			}
			if !yield(entry, err) || err != nil {
				return
			}
		}
	}
}

// SQLiteMapEntry is the Go equivalent of a [key, value] tuple.
type SQLiteMapEntry[K ~string, V any] struct {
	Key   K
	Value V
}

// Retrieves the value associated with the given key.
// Returns nil if it doesn't exist.
func (m *SQLiteMap[K, V]) Get(key K) (*V, error) {
	var value string
	err := m.databaseInstance.QueryRow("SELECT value FROM map WHERE key = ?", string(key)).Scan(&value)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var result V
	if err := json.Unmarshal([]byte(value), &result); err != nil {
		return nil, err
	}
	return &result, nil
}

// Checks if the map contains a value for the given key.
func (m *SQLiteMap[K, V]) Has(key K) (bool, error) {
	var exists int
	err := m.databaseInstance.QueryRow("SELECT 1 FROM map WHERE key = ?", string(key)).Scan(&exists)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	return err == nil, err
}

// Returns an iterator over the keys in the map.
func (m *SQLiteMap[K, V]) Keys() iter.Seq2[K, error] {
	return func(yield func(K, error) bool) {
		for row, err := range stream[struct{ Key string }](m.databaseInstance, "SELECT key FROM map") {
			if !yield(K(row.Key), err) || err != nil {
				return
			}
		}
	}
}

// Sets the value for the given key.
func (m *SQLiteMap[K, V]) Set(key K, value V) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	_, err = m.databaseInstance.Exec("INSERT OR REPLACE INTO map (key, value) VALUES (?, ?)", string(key), string(data))
	return err
}

// Returns an iterator over the values in the map.
func (m *SQLiteMap[K, V]) Values() iter.Seq2[V, error] {
	return func(yield func(V, error) bool) {
		for row, err := range stream[struct{ Value string }](m.databaseInstance, "SELECT value FROM map") {
			var value V
			if err == nil {
				err = json.Unmarshal([]byte(row.Value), &value)
			}
			if !yield(value, err) || err != nil {
				return
			}
		}
	}
}

// Closes the database instance and removes its temporary files.
func (m *SQLiteMap[K, V]) Cleanup() error {
	if err := m.databaseInstance.Close(); err != nil {
		return err
	}
	return removeDatabase(m.instancePath)
}
