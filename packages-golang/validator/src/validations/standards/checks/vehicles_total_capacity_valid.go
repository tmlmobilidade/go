package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"strconv"
)

/*
# Attributes
  - File: [vehicles.txt]
  - Field: total_capacity
  - Presence: Required
  - Type: Non-negative integer

# Description

Total capacity of passengers. When it is equal to 0, it means that the vehicle unit does not allow the boarding of passengers.
*/
func TotalCapacityValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "vehicles", []string{"total_capacity"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "total_capacity")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty total_capacity values

		// Presence belongs to the field check.
		if value == "" {
			return nil
		}

		//
		// 3. Convert the total_capacity to an integer

		parsed, err := strconv.Atoi(value)
		if err != nil {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 4. Check if the total_capacity is non-negative

		if parsed < 0 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 5. Return success

		return nil
	})
}
