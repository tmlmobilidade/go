package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes
  - File: [vehicles.txt]
  - Field: registration_date
  - Presence: Required
  - Type: Date

# Description

Date the vehicle was first registered, in any location.
It is often used to determine the vehicle's age. In the numeric format yyyymmdd.
*/
func RegistrationDateValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "vehicles", []string{"registration_date"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "registration_date")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty registration_date values

		// Presence belongs to the field check.
		if value == "" {
			return nil
		}

		//
		// 3. Check if the registration_date is a valid service date

		if !validators.IsValidServiceDate(value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 4. Return success

		return nil
	})
}
