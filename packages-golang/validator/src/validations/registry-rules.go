package validations

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/rules/registry"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/validations"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables"
	custom "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/checks"
	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

// RegisterRules registers every executable validation once before checks run.
// Each rule ID is declared here beside the function that receives its context.
func RegisterRules() {
	variables.RegisterRulesOnce.Do(func() {
		registry.Register(validationTypes.RuleChecks{
			//
			// 1. Register field validations

			"trips_pattern_id_field": fields.PatternIdField,
			"trips_shape_id_field":   fields.TripsShapeIdField,

			//
			// 2. Register standard validations

			"trips_shape_id_foreign": standard.ShapeIdForeign,

			//
			// 3. Register custom validations

			"trips_pattern_id_same_shape_id": custom.PatternIdSameShapeId,
		})
	})
}
