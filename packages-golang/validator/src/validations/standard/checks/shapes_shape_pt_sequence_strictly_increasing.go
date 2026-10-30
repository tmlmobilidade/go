package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
)

// ShapePtSequenceStrictlyIncreasing checks points prepared by SequenceGroups.
// CSV rows may appear out of sequence: after sorting, a non-increasing pair
// means a repeated sequence number, not an out-of-order source row.
func ShapePtSequenceStrictlyIncreasing(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "shape_pt_sequence_strictly_increasing"

	//
	// 2. Get the sequence and distance values from SQLite.

	groups, err := validationutils.SequenceGroups(db)
	if err != nil {
		return err
	}

	//
	// 3. Compare adjacent points only within the same shape.

	for _, points := range groups {
		for i := 1; i < len(points); i++ {
			point := points[i]
			if point.Sequence > points[i-1].Sequence {
				continue
			}

			//
			// 3.1 Create the validation context

			ctx := lib.NewValidationContext("shape_pt_sequence", "shapes.txt", ruleID, point.Row, services.AppMessageService)
			if rules != nil {
				rule := rules
				ctx.WithSeverity(rule.Severity)
			}

			//
			// 3.2 Check if the validation should be skipped

			if ctx.ShouldSkip() {
				continue
			}

			//
			// 3.3 Add the message if the sequence is not increasing

			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_increasing", point.ShapeID))
		}
	}

	//
	// 4. Return success

	return nil
}
