/* * */

import { Stepper as MantineStepper, type StepperProps as MantineStepperProps } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

/* * */

export interface StepperDataItem {
	description?: string
	id: string
	isEnabled?: boolean
	isLoading?: boolean
	label?: string
}

export interface StepperProps extends Omit<MantineStepperProps, 'allowNextStepsSelect' | 'children'> {
	data: StepperDataItem[]
}

/* * */

export function Stepper({ data, ...props }: StepperProps) {
	return (
		<MantineStepper
			{...props}
			allowNextStepsSelect={false}
			completedIcon={<IconCheck />}
			iconPosition="right"
			wrap={false}
		>
			{data.map(step => (
				<MantineStepper.Step
					key={step.id}
					allowStepSelect={step.isEnabled ?? true}
					description={step.description}
					label={step.label}
					loading={step.isLoading}
				/>
			))}
		</MantineStepper>
	);
}
