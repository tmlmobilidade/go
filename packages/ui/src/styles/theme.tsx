/* * */

import '@mantine/core/styles.layer.css';
import '@mantine/dates/styles.layer.css';
import '@mantine/notifications/styles.layer.css';
import '@mantine/charts/styles.layer.css';

/* * */

import './system/reset.css';
import './system/font.css';
import './system/color.css';
import './system/size.css';
import './system/utils.css';

/* * */

import './themes/ocean.css';
import './themes/park.css';
import './themes/path.css';
import './themes/pool.css';
import './themes/royal.css';
import './themes/street.css';

/* * */

import { Accordion, ActionIcon, Avatar, Button, Checkbox, createTheme, MantineThemeOverride, Menu, NumberInput, PasswordInput, PillsInput, PillsInputField, Popover, SegmentedControl, Skeleton, Slider, Switch, Text, Textarea, TextInput } from '@mantine/core';
import { IconCaretLeftFilled } from '@tabler/icons-react';

/* * */

import AccordionOverride from './mantine/Accordion.module.css';
import ActionIconOverride from './mantine/ActionIcon.module.css';
import AvatarOverride from './mantine/Avatar.module.css';
import ButtonOverride from './mantine/Button.module.css';
import CheckboxOverride from './mantine/Checkbox.module.css';
import CheckboxGroupOverride from './mantine/CheckboxGroup.module.css';
import MenuOverride from './mantine/Menu.module.css';
import PasswordInputOverride from './mantine/PasswordInput.module.css';
import PillsInputOverride from './mantine/PillsInput.module.css';
import PopoverOverride from './mantine/Popover.module.css';
import SegmentedControlOverrideSm from './mantine/SegmentedControl-sm.module.css';
import SegmentedControlOverride from './mantine/SegmentedControl.module.css';
import SkeletonOverride from './mantine/Skeleton.module.css';
import SliderOverride from './mantine/Slider.module.css';
import SwitchOverride from './mantine/Switch.module.css';
import TextOverride from './mantine/Text.module.css';
import TextareaOverrideComment from './mantine/Textarea-comment.module.css';
import TextareaOverride from './mantine/Textarea.module.css';
import TextInputOverrideSm from './mantine/TextInput-sm.module.css';
import TextInputOverrideXl from './mantine/TextInput-xl.module.css';
import TextInputOverride from './mantine/TextInput.module.css';

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

		Menu: Menu.extend({
			classNames: {
				...MenuOverride,
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
