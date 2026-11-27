package routes

import (
	"context"
	"database/sql"
	"encoding/hex"
	"fmt"
	"math"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: route_color, route_text_color
  - Presence: Required in GTFS v30
  - Type: Color

# Description

Checks that the route text and background colors have a WCAG 2.2 contrast
ratio of at least 4.5:1, the minimum for normal text. Missing or malformed
colors are handled by the presence and format rules.

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes

[WCAG 2.2]: https://www.w3.org/TR/WCAG22/#contrast-minimum
*/
func (RoutesChecks) RoutesRouteColorRouteTextColorContrast(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the routes table exists
	exists, err := sqlutils.TableExists(ctx, db, "routes")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Convert each valid sRGB color to relative luminance
	luminance := func(value string) (float64, bool) {
		var channels [3]byte
		if len(value) != 2*len(channels) {
			return 0, false
		}
		if _, err := hex.Decode(channels[:], []byte(value)); err != nil {
			return 0, false
		}

		var luminance float64
		for i, weight := range [...]float64{0.2126, 0.7152, 0.0722} {
			channel := float64(channels[i]) / 255
			if channel <= 0.04045 {
				channel /= 12.92
			} else {
				channel = math.Pow((channel+0.055)/1.055, 2.4)
			}
			luminance += weight * channel
		}
		return luminance, true
	}

	// 3. Report ratios below the minimum
	const minimumContrast = 4.5
	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, "routes", []string{"route_color", "route_text_color"}, func(row int, values map[string]string) error {
		backgroundColor, textColor := values["route_color"], values["route_text_color"]
		background, backgroundOK := luminance(backgroundColor)
		foreground, textOK := luminance(textColor)
		if !backgroundOK || !textOK {
			return nil
		}

		contrast := (max(background, foreground) + 0.05) / (min(background, foreground) + 0.05)
		if contrast < minimumContrast {
			findings = append(findings, types.Finding{
				Description:            "The route text and background colors must have a contrast ratio of at least 4.5:1.",
				DescriptionTranslation: types.NewTranslation("default", nil),
				Message:                fmt.Sprintf("The route_text_color %q and route_color %q have a contrast ratio of %.2f:1.", textColor, backgroundColor, contrast),
				MessageTranslation:     types.NewTranslation("default", map[string]any{"text": textColor, "background": backgroundColor, "contrast": fmt.Sprintf("%.2f", contrast)}),
				Severity:               config.Severity,
				FileName:               "routes.txt",
				Field:                  "route_text_color",
				Rows:                   []int{row},
			})
		}
		return nil
	})

	// 4. Return the findings
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}
