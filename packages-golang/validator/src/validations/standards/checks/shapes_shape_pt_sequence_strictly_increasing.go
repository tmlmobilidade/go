package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	standardutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/utils"
)

/*
* ShapePtSequenceStrictlyIncreasing compares adjacent points in numeric shape sequence order.
* Findings retain the later point's original SQLite row; shapes are never joined.
 */
func ShapePtSequenceStrictlyIncreasing(ctx *context.ValidationContext) error {
	ready, err := context.RequireTables(ctx, "shapes")
	if err != nil || !ready {
		return err
	}
	ctx.FileName, ctx.Field = "shapes.txt", "shape_pt_sequence"
	if context.ShouldIgnore(ctx) {
		return nil
	}
	groups, err := standardutils.SequenceGroups(ctx)
	if err != nil {
		return err
	}
	for _, points := range groups {
		for i := 1; i < len(points); i++ {
			point, previous := points[i], points[i-1]
			if point.Sequence <= previous.Sequence {
				finding := *ctx
				finding.Row = point.Row
				context.AddMessage(&finding, context.GetTranslatedMessage(&finding, "not_increasing", point.ShapeID))
				ctx.Failed = ctx.Failed || finding.Failed
			}
		}
	}
	return nil
}
