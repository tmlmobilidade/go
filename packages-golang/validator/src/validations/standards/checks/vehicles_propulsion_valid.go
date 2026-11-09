package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	variables "github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
	"slices"
	"strconv"
)

/*
# Attributes
  - File: [vehicles.txt]
  - Field: propulsion
  - Presence: Required
  - Type: Enum

# Description

The propulsion of the vehicle.

Valid options are:

  - 0 - Not applicable
  - 1 - Gasoline
  - 2 - Diesel
  - 3 - Auto LPG
  - 4 - Mixture
  - 5 - Electricity
  - 6 - Battery electric
  - 7 - Hybrid
  - 8 - Hydrogen
  - 9 - Biofuel
  - 10 - Biofuel / Biodiesel
  - 101 - Natural Gas
  - 102 - Natural Gas - CNG
  - 103 - Natural Gas - LNG
  - 104 - Aviation Fuel
  - 105 - Marine Fuel
  - 106 - Other
*/
func PropulsionValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "vehicles", []string{"propulsion"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}
		config := &rowCtx.Config

		value, err := queries.Field(rowCtx.Source, "propulsion")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty propulsion values

		// Presence belongs to the field check.
		if value == "" {
			return nil
		}

		//
		// 3. Convert the propulsion to an integer

		parsed, err := strconv.Atoi(value)
		if err != nil {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 4. Get the valid propulsion options

		validOptions := []int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 101, 102, 103, 104, 105, 106}

		//
		// 5. Check if the propulsion is a valid option

		if !slices.Contains(validOptions, parsed) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 6. Check the configured propulsion options

		if config.Options != nil && !slices.Contains(*config.Options, variables.AllRuleOptions) && !slices.Contains(*config.Options, strconv.Itoa(parsed)) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_allowed", value))
		}

		//
		// 7. Return success

		return nil
	})
}
