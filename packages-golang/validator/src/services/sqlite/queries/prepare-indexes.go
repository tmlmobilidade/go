package queries

import (
	"database/sql"
	"errors"
	"fmt"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator/src/services/database"
)

/*
* PrepareIndexes creates indexes so validations can find matching rows faster.
* Each lookup contains a table name and column name; missing tables or columns are skipped.
* When coalesce is true, it indexes COALESCE(column, '') for queries that treat NULL as empty.
* Otherwise, it indexes the column directly for equality comparisons.
* Existing indexes are kept, and stored values are unchanged.
* The caller owns the supplied transaction and must commit or roll it back.
* Raw indexes use table_column names; expression indexes add the _coalesce suffix.
 */
func PrepareIndexes(transaction *sql.Tx, lookups [][2]string, coalesce bool) error {
	//

	//
	// 1. Check tables and columns inside the transaction, without a schema cache

	for _, lookup := range lookups {
		var tableName string
		err := transaction.QueryRow("SELECT name FROM sqlite_schema WHERE type = 'table' AND name = ? COLLATE NOCASE", lookup[0]).Scan(&tableName)
		if errors.Is(err, sql.ErrNoRows) {
			continue
		}
		if err != nil {
			return fmt.Errorf("find SQLite table %q for index preparation: %w", lookup[0], err)
		}
		exists, err := columnExists(transaction, tableName, lookup[1])
		if err != nil {
			return err
		}
		if !exists {
			continue
		}

		// The expression and name distinguish raw-equality and NULL-as-empty indexes.
		indexName := lookup[0] + "_" + lookup[1]
		expression := dbops.SanitizeName(lookup[1])
		if coalesce {
			indexName += "_coalesce"
			expression = "COALESCE(" + expression + ", '')"
		}

		//
		// 2. Create the index only when it does not already exist

		name := dbops.SanitizeName(indexName)
		query := "CREATE INDEX IF NOT EXISTS " + name + " ON " + dbops.SanitizeName(tableName) + " (" + expression + ")"
		if _, err := transaction.Exec(query); err != nil {
			return fmt.Errorf("prepare lookup index for %s.%s: %w", tableName, lookup[1], err)
		}
	}

	//
	// 3. Leave the prepared indexes pending for the caller to commit

	return nil
}
