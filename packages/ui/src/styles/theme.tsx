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

import { Accordion, ActionIcon, Avatar, Button, Checkbox, CloseButton, createTheme, MantineThemeOverride, Menu, MultiSelect, NumberInput, PasswordInput, Pill, PillGroup, Popover, SegmentedControl, Select, Skeleton, Slider, Switch, TagsInput, Text, Textarea, TextInput } from '@mantine/core';
import { DateInput, TimePicker } from '@mantine/dates';
import { IconCaretLeftFilled } from '@tabler/icons-react';

/* * */

import DropdownBase from './mantine/base/dropdown.module.css';
import InputBase from './mantine/base/input.module.css';
import MultiSelectBase from './mantine/base/multi-select-input.module.css';

/* * */

import AccordionOverride from './mantine/overrides/Accordion.module.css';
import ActionIconOverride from './mantine/overrides/ActionIcon.module.css';
import AvatarOverride from './mantine/overrides/Avatar.module.css';
import ButtonOverride from './mantine/overrides/Button.module.css';
import CheckboxOverride from './mantine/overrides/Checkbox.module.css';
import CheckboxGroupOverride from './mantine/overrides/CheckboxGroup.module.css';
import CloseButtonOverride from './mantine/overrides/CloseButton.module.css';
import MenuOverride from './mantine/overrides/Menu.module.css';
import PasswordInputOverride from './mantine/overrides/PasswordInput.module.css';
import PillOverride from './mantine/overrides/Pill.module.css';
import PillGroupOverride from './mantine/overrides/PillGroup.module.css';
import PopoverOverride from './mantine/overrides/Popover.module.css';
import SegmentedControlOverrideSm from './mantine/overrides/SegmentedControl-sm.module.css';
import SegmentedControlOverride from './mantine/overrides/SegmentedControl.module.css';
import SkeletonOverride from './mantine/overrides/Skeleton.module.css';
import SliderOverride from './mantine/overrides/Slider.module.css';
import SwitchOverride from './mantine/overrides/Switch.module.css';
import TextOverride from './mantine/overrides/Text.module.css';
import TextareaOverrideComment from './mantine/overrides/Textarea-comment.module.css';
import TextareaOverride from './mantine/overrides/Textarea.module.css';
import TimePickerOverride from './mantine/overrides/TimePicker.module.css';

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

		CloseButton: CloseButton.extend({
			classNames: {
				...CloseButtonOverride,
			},
		}),

		DateInput: DateInput.extend({
			classNames: {
				...InputBase,
			},
		}),

		Menu: Menu.extend({
			classNames: {
				...MenuOverride,
			},
		}),

		MultiSelect: MultiSelect.extend({
			classNames: {
				...InputBase,
				...DropdownBase,
				input: `${InputBase.input} ${MultiSelectBase.input}`,
				wrapper: `${InputBase.wrapper} ${MultiSelectBase.wrapper}`,
			},
		}),

		NumberInput: NumberInput.extend({
			classNames: {
				...InputBase,
			},
		}),

		PasswordInput: PasswordInput.extend({
			classNames: {
				// PasswordInput is very similar to a base Input field. The only difference is that
				// the 'input' field is wrapped by an outer div, with the class '.input'.
				// The actual 'input' field is named '.innerInput'. It is necessary to
				// map the 'input' field styles to the '.innerInput' class and apply reset styles
				// to the '.input' class, otherwise the input will appear to be rendered twice.
				...InputBase,
				innerInput: InputBase.input,
				input: PasswordInputOverride.input,
			},
		}),

		Pill: Pill.extend({
			classNames: {
				...PillOverride,
			},
		}),

		PillGroup: PillGroup.extend({
			classNames: {
				...PillGroupOverride,
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

		Select: Select.extend({
			classNames: {
				...InputBase,
				...DropdownBase,
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

		TagsInput: TagsInput.extend({
			classNames: {
				...InputBase,
				...DropdownBase,
				input: `${InputBase.input} ${MultiSelectBase.input}`,
				wrapper: `${InputBase.wrapper} ${MultiSelectBase.wrapper}`,
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
			classNames: {
				...InputBase,
			},
		}),

		TimePicker: TimePicker.extend({
			classNames: {
				...InputBase,
				...DropdownBase,
				...TimePickerOverride,
				wrapper: `${InputBase.wrapper} ${TimePickerOverride.wrapper}`,
			},
		}),

	},
});
