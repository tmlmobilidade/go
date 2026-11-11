package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	geo "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/geo"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	standardutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/utils"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: [shape_id, shape_pt_sequence, shape_dist_traveled]
  - Presence: Required, Required, Optional
  - Type: ID, Non-negative integer, Non-negative float

# Description

  - shape_id: Identifies the shape shared by its constituent points.
  - shape_pt_sequence: Non-negative sequence number defining how points connect along the shape. Values must increase
    but need not be consecutive.
  - shape_dist_traveled: Distance traveled from the first point of the shape to this point. It must increase with
    shape_pt_sequence and use the same units as stop_times.shape_dist_traveled.

Validation: Groups points by non-empty shape_id and sorts them by numeric sequence. It reports a decrease only
between adjacent finite, non-negative distances. Equal distances pass; missing or invalid distances break
comparison. A group with an unreadable or negative sequence is skipped.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#shapestxt
*/
func ShapeDistTraveledNonDecreasing(ctx *contextTypes.ValidationContext) error {
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
