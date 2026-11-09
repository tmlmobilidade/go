package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"strconv"
)

/*
# Attributes
  - File: [vehicles.txt]
  - Field: car_capacity
  - Presence: Optional
  - Type: Non-negative integer

# Description

Number of light vehicles of normal size that the vehicle unit can transport. It is mainly intended for ferries.
When it is equal to 0, it means that the vehicle unit does not allow the boarding of light vehicles.
Required for operators that provide service for light vehicles.
*/
func CarCapacityValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "vehicles", []string{"car_capacity"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "car_capacity")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty car_capacity values

		// Presence belongs to the field check.
		if value == "" {
			return nil
		}

		//
		// 3. Convert the car_capacity to an integer

		parsed, err := strconv.Atoi(value)
		if err != nil {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 4. Check if the car_capacity is non-negative

		if parsed < 0 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 5. Return success

		return nil
	})
}
