/* * */

import '@mantine/core/styles.layer.css';
import '@mantine/dates/styles.layer.css';
import '@mantine/notifications/styles.layer.css';
import '@mantine/charts/styles.layer.css';

/* * */

import '@/styles/system/reset.css';
import '@/styles/system/font.css';
import '@/styles/system/color.css';
import '@/styles/system/size.css';
import '@/styles/system/utils.css';

/* * */

import '@/styles/themes/ocean.css';
import '@/styles/themes/park.css';
import '@/styles/themes/path.css';
import '@/styles/themes/pool.css';
import '@/styles/themes/royal.css';
import '@/styles/themes/street.css';

/* * */

import { Accordion, ActionIcon, Avatar, Button, Checkbox, createTheme, MantineThemeOverride, NumberInput, PasswordInput, PillsInput, PillsInputField, Popover, SegmentedControl, Skeleton, Slider, Switch, Text, Textarea, TextInput } from '@mantine/core';
import { IconCaretLeftFilled } from '@tabler/icons-react';

/* * */

import AccordionOverride from '@/styles/mantine/Accordion.module.css';
import ActionIconOverride from '@/styles/mantine/ActionIcon.module.css';
import AvatarOverride from '@/styles/mantine/Avatar.module.css';
import ButtonOverride from '@/styles/mantine/Button.module.css';
import CheckboxOverride from '@/styles/mantine/Checkbox.module.css';
import CheckboxGroupOverride from '@/styles/mantine/CheckboxGroup.module.css';
import PasswordInputOverride from '@/styles/mantine/PasswordInput.module.css';
import PillsInputOverride from '@/styles/mantine/PillsInput.module.css';
import PopoverOverride from '@/styles/mantine/Popover.module.css';
import SegmentedControlOverrideSm from '@/styles/mantine/SegmentedControl-sm.module.css';
import SegmentedControlOverride from '@/styles/mantine/SegmentedControl.module.css';
import SkeletonOverride from '@/styles/mantine/Skeleton.module.css';
import SliderOverride from '@/styles/mantine/Slider.module.css';
import SwitchOverride from '@/styles/mantine/Switch.module.css';
import TextOverride from '@/styles/mantine/Text.module.css';
import TextareaOverrideComment from '@/styles/mantine/Textarea-comment.module.css';
import TextareaOverride from '@/styles/mantine/Textarea.module.css';
import TextInputOverrideSm from '@/styles/mantine/TextInput-sm.module.css';
import TextInputOverrideXl from '@/styles/mantine/TextInput-xl.module.css';
import TextInputOverride from '@/styles/mantine/TextInput.module.css';

/* * */

export const themeData: MantineThemeOverride = createTheme({
	components: {

		Accordion: Accordion.extend({
			classNames: {
				...AccordionOverride,
			},
			defaultProps: {
				chevron: <IconCaretLeftFilled />,
			},
		}),

		ActionIcon: ActionIcon.extend({
			classNames: {
				...ActionIconOverride,
			},
		}),

		Avatar: Avatar.extend({
			classNames: {
				...AvatarOverride,
			},
		}),

		Button: Button.extend({
			classNames: {
				...ButtonOverride,
			},
		}),

		Checkbox: Checkbox.extend({
			classNames: {
				...CheckboxOverride,
			},
		}),

		CheckboxGroup: Checkbox.Group.extend({
			classNames: {
				...CheckboxGroupOverride,
			},
		}),

		NumberInput: NumberInput.extend({
			classNames: {
				control: TextInputOverride.control,
				controls: TextInputOverride.controls,
				description: TextInputOverride.description,
				error: TextInputOverride.error,
				input: TextInputOverride.input,
				label: TextInputOverride.label,
				root: TextInputOverride.root,
				wrapper: TextInputOverride.wrapper,
			},
		}),

		PasswordInput: PasswordInput.extend({
			classNames: {
				// PasswordInput is very similar to TextInput. The only difference is that
				// the 'input' field is wrapped by an outer div, with the class '.input'.
				// The actual 'input' field is named '.innerInput'. It is necessary to
				// map the 'input' field styles to the '.innerInput' class and apply reset styles
				// to the '.input' class, otherwise the input will appear to be rendered twice.
				description: TextInputOverride.description,
				error: TextInputOverride.error,
				innerInput: TextInputOverride.input,
				input: PasswordInputOverride.input,
				label: TextInputOverride.label,
				root: TextInputOverride.root,
				wrapper: TextInputOverride.wrapper,
			},
		}),

		PillsInput: PillsInput.extend({
			classNames: {
				description: TextInputOverride.description,
				error: TextInputOverride.error,
				label: TextInputOverride.label,
				root: PillsInputOverride.root,
			},
		}),

		PillsInputField: PillsInputField.extend({
			classNames: {
				field: TextInputOverride.input,
			},
		}),

		Popover: Popover.extend({
			classNames: {
				...PopoverOverride,
			},
		}),

		SegmentedControl: SegmentedControl.extend({
			classNames: (_, props) => {
				return {
					...SegmentedControlOverride,
					...(props.size === 'sm' && SegmentedControlOverrideSm),
				};
			},
		}),

		Skeleton: Skeleton.extend({
			classNames: {
				...SkeletonOverride,
			},
		}),

		Slider: Slider.extend({
			classNames: {
				...SliderOverride,
			},
		}),

		Switch: Switch.extend({
			classNames: {
				...SwitchOverride,
			},
		}),

		Text: Text.extend({
			classNames: {
				...TextOverride,
			},
		}),

		Textarea: Textarea.extend({
			classNames: (_, props) => {
				return {
					...TextareaOverride,
					...(props.variant === 'comment' && TextareaOverrideComment),
				};
			},
		}),

		TextInput: TextInput.extend({
			classNames: (_, props) => {
				return {
					...TextInputOverride,
					...(props.size === 'sm' && TextInputOverrideSm),
					...(props.size === 'xl' && TextInputOverrideXl),
					...(props.variant === 'white' && {
						input: TextInputOverrideSm.variantWhite,
						section: TextInputOverrideSm.variantWhite,
					}),
				};
			},
		}),

	},
});
