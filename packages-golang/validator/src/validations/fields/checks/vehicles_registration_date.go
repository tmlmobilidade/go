package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: registration_date
  - Presence: Required
  - Type: Date

# Description

Date when the vehicle was first registered, in any country, written as YYYYMMDD. Used to determine the vehicle's
age.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func RegistrationDateField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "vehicles", []string{"registration_date"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the registration_date value

		value, err := queries.Field(row.Source, "registration_date")
		if err != nil {
			return err
		}

		//
		// 3. Check if the registration_date is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			context.AddMessage(row, context.GetSeverityMessage(row, "required", "recommended", "informational"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
