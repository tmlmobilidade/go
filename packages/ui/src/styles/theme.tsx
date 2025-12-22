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

import { Accordion, ActionIcon, Avatar, Button, Checkbox, CloseButton, ColorInput, createTheme, MantineThemeOverride, Menu, MultiSelect, NumberInput, PasswordInput, Pill, PillGroup, Popover, Radio, SegmentedControl, Select, Skeleton, Slider, Switch, TagsInput, Text, Textarea, TextInput } from '@mantine/core';
import { IconCaretLeftFilled } from '@tabler/icons-react';

/* * */

import { DateInput } from '@mantine/dates';

import AccordionOverride from './mantine/Accordion.module.css';
import ActionIconOverride from './mantine/ActionIcon.module.css';
import AvatarOverride from './mantine/Avatar.module.css';
import DropdownBase from './mantine/base/dropdown.module.css';
import InputBase from './mantine/base/input.module.css';
import MultiSelectBase from './mantine/base/multi-select-input.module.css';
import ButtonOverride from './mantine/Button.module.css';
import CheckboxOverride from './mantine/Checkbox.module.css';
import CheckboxGroupOverride from './mantine/CheckboxGroup.module.css';
import CloseButtonOverride from './mantine/CloseButton.module.css';
import ColorInputOverride from './mantine/ColorInput.module.css';
import MenuOverride from './mantine/Menu.module.css';
import PillOverride from './mantine/overrides/Pill.module.css';
import PillGroupOverride from './mantine/overrides/PillGroup.module.css';
import PasswordInputOverride from './mantine/PasswordInput.module.css';
import PopoverOverride from './mantine/Popover.module.css';
import RadioOverride from './mantine/Radio.module.css';
import SegmentedControlOverrideSm from './mantine/SegmentedControl-sm.module.css';
import SegmentedControlOverride from './mantine/SegmentedControl.module.css';
import SkeletonOverride from './mantine/Skeleton.module.css';
import SliderOverride from './mantine/Slider.module.css';
import SwitchOverride from './mantine/Switch.module.css';
import TextOverride from './mantine/Text.module.css';
import TextareaOverrideComment from './mantine/Textarea-comment.module.css';
import TextareaOverride from './mantine/Textarea.module.css';

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

		ColorInput: ColorInput.extend({
			classNames: {
				...ColorInputOverride,
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

		Radio: Radio.extend({
			classNames: {
				...RadioOverride,
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

	},
});
