// Run from this directory with: go run index.go
// This example exercises the real DAG scheduler, assuming every rule passes.
package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules/algorithm"
	DAGTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/algorithm"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func run() error {
	//
	// 1. Choose a delay to make concurrent rule execution visible

	delay := flag.Duration("delay", 2*time.Second, "Simulated work duration per rule")
	flag.Parse()
	if *delay < 0 {
		return fmt.Errorf("delay cannot be negative")
	}
	if flag.NArg() != 0 {
		return fmt.Errorf("unexpected arguments: %v", flag.Args())
	}
	logger := log.New(os.Stdout, "", log.Ltime|log.Lmicroseconds)

	//
	// 2. Define the example rules and their dependencies directly

	nodes := []DAGTypes.Rule[struct{}]{
		{ID: "shapes_file_missing"},
		{ID: "trips_file_missing"},
		{ID: "trips_pattern_id_field", DependsOn: []string{"trips_file_missing"}},
		{ID: "trips_pattern_id_same_shape_id", DependsOn: []string{"trips_file_missing", "shapes_file_missing"}},
		{ID: "trips_shape_id_field", DependsOn: []string{"trips_file_missing", "shapes_file_missing"}},
		{ID: "trips_shape_id_foreign", DependsOn: []string{"trips_shape_id_field", "shapes_file_missing"}},
	}

	//
	// 3. Preserve the dependencies and replace data checks with passing callbacks

	for i := range nodes {
		id := nodes[i].ID
		nodes[i].Run = func(struct{}) DAGTypes.Status {
			logger.Printf("Running %s", id)
			time.Sleep(*delay)
			logger.Printf("Completed %s: passed", id)
			return DAGTypes.Passed
		}
	}
	// This scheduler-only demo supplies its nodes directly.
	manager := &DAGTypes.Manager[struct{}]{Rules: nodes}
	if err := algorithm.Build(manager); err != nil {
		return err
	}

	//
	// 4. Run the production scheduler: each completion releases eligible dependents

	logger.Printf("Global validation DAG ready: %d rules", len(nodes))
	statuses, err := algorithm.RunRules(manager, struct{}{})
	if err != nil {
		return err
	}
	logger.Printf("DAG complete: %d rules passed", len(statuses))
	return nil
}
