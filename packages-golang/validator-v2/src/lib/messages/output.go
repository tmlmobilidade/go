package messages

import (
	"os"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/messages/output"
)

// PrintJSON writes the current report to standard output.
func (service *MessageService) PrintJSON() error {
	//

	//
	// 1. Write one consistent snapshot

	return output.WriteJSON(os.Stdout, service.GetSummary())
}

// PrintSummary writes the current error and warning totals.
func (service *MessageService) PrintSummary() error {
	//

	//
	// 1. Print one consistent snapshot

	return output.WriteSummary(os.Stdout, service.GetSummary())
}

// WriteToFile saves the current report as compact JSON.
func (service *MessageService) WriteToFile(filename string) error {
	//

	//
	// 1. Save one consistent snapshot

	return output.WriteToFile(filename, service.GetSummary())
}
