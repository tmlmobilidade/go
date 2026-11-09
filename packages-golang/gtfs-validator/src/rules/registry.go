package rules

import (
	"context"
	"database/sql"
)

// A lowercase type/field name is private to this Go package. Applications can use
// the validator, but cannot replace these rules or register new ones.
// validate receives a shared database handle and returns findings plus an error.
// nil error means the check executed successfully, even if it found invalid data.
type rule struct {
	id           string
	dependencies []string
	validate     func(context.Context, *sql.DB) ([]Finding, error)
}

// registry maps stable rule IDs to functions and their required prerequisites.
// Add built-in rules here; declaration order does not determine execution order.
func registry() []rule {
	return []rule{
		{
			id:       "agency_file_present",
			validate: AgencyFilePresent,
		},
		{
			id:           "agency_name_field_present",
			dependencies: []string{"agency_file_present"},
			validate:     AgencyNameFieldPresent,
		},
		{
			id:           "agency_name_valid",
			dependencies: []string{"agency_name_field_present"},
			validate:     AgencyNameValid,
		},
	}
}
