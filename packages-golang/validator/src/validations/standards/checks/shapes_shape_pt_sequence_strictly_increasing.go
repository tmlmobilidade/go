package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	standardutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/utils"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: [shape_id, shape_pt_sequence]
  - Presence: Required
  - Type: ID, Non-negative integer

# Description

  - shape_id: Identifies the shape shared by its constituent points.
  - shape_pt_sequence: Non-negative sequence number defining how points connect along the shape. Values must increase
    but need not be consecutive.

Validation: Groups points by non-empty shape_id and sorts them by numeric shape_pt_sequence. Repeated sequence
numbers are reported; gaps and physical row order are irrelevant. A group with a non-integer or negative sequence
is skipped for this check.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#shapestxt
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
