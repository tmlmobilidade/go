package output

import (
	"fmt"
	"io"

	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
)

// WriteSummary writes the report's error and warning totals.
func WriteSummary(writer io.Writer, summary types.Summary) error {
	//

	//
	// 1. Write the summary and propagate output errors

	_, err := fmt.Fprintf(writer, `
		\n\n================================================
		\nGTFS Validation Summary\n================================================
		\nTotal Errors: %d
		\nTotal Warnings: %d
		\n================================================
	`, summary.TotalErrors, summary.TotalWarnings)
	return err
}
