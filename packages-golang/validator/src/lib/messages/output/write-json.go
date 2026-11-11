package output

import (
	"encoding/json"
	"fmt"
	"io"

	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/messages"
)

// WriteJSON writes the grouped report as one JSON line.
func WriteJSON(writer io.Writer, summary types.Summary) error {
	//

	//
	// 1. Encode the report and propagate output errors

	if err := json.NewEncoder(writer).Encode(summary); err != nil {
		return fmt.Errorf("writing summary JSON: %w", err)
	}
	return nil
}
