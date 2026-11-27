package fields

import (
	"context"
	"database/sql"
	"fmt"
	"slices"
	"strconv"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

// CheckEnum checks supplied values against the spec and configured options.
func CheckEnum(ctx context.Context, db *sql.DB, config types.Rule, table, column string, allowed ...string) (bool, []types.Finding, error) {
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return CheckForbiddenValues(ctx, db, config, table, column)
	}
	options := config.Options()
	allowedValues := strings.Join(allowed, ", ")
	description := fmt.Sprintf("The %s field must be one of %s and match the configured options.", column, allowedValues)
	translation := types.NewTranslation("field_enum", map[string]any{"field": column, "allowed": allowedValues})
	return checkValues(ctx, db, config, table, column, description, translation, func(value string) bool {
		value = strings.TrimSpace(value)
		if number, err := strconv.Atoi(value); err == nil {
			value = strconv.Itoa(number)
		}
		return slices.Contains(allowed, value) &&
			(options == nil || slices.Contains(options, "all_options") || slices.Contains(options, value))
	})
}
