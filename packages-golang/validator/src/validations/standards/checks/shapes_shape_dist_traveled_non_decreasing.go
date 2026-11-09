package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	geo "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/geo"
	standardutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/utils"
)

/*
* ShapeDistTraveledNonDecreasing compares adjacent points in numeric shape sequence order.
* Findings retain the later point's original SQLite row; shapes are never joined.
 */
func ShapeDistTraveledNonDecreasing(ctx *context.ValidationContext) error {
	ready, err := context.RequireTables(ctx, "shapes")
	if err != nil || !ready {
		return err
	}
	ctx.FileName, ctx.Field = "shapes.txt", "shape_dist_traveled"
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
			if geo.ValidDistance(point.Distance) && geo.ValidDistance(previous.Distance) && *point.Distance < *previous.Distance {
				finding := *ctx
				finding.Row = point.Row
				context.AddMessage(&finding, context.GetTranslatedMessage(&finding, "not_increasing", point.ShapeID))
				ctx.Failed = ctx.Failed || finding.Failed
			}
		}
	}
	return nil
}
