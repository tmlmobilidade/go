package gtfsvalidator_test

import (
	"context"
	"database/sql"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

// A closed database exercises operational errors through the public entry point,
// without exposing private rule registration just to support tests.
func TestRulesOperationalError(t *testing.T) {
	database, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	if err := database.Close(); err != nil {
		t.Fatal(err)
	}

	results, err := rules.RunValidations(context.Background(), database, 2)
	if err == nil || len(results) != 3 {
		t.Fatal(results, err)
	}
	if results[0].Status != types.Errored || results[1].Status != types.Skipped || results[2].Status != types.Skipped {
		t.Fatal(results)
	}
}
