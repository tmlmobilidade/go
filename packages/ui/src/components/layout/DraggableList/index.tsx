'use client';

/* * */

import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, type UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical } from '@tabler/icons-react';
import cx from 'clsx';
import { type CSSProperties, type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

export interface DraggableListRenderProps<TItem> {
	dragHandle: ReactNode
	index: number
	isDragging: boolean
	isLast: boolean
	item: TItem
}

interface DraggableListProps<TItem> {
	getId: (item: TItem) => UniqueIdentifier
	items: TItem[]
	onReorder: (items: TItem[], event: { newIndex: number, oldIndex: number }) => void
	renderItem: (props: DraggableListRenderProps<TItem>) => ReactNode
}

/* * */

interface DraggableListItemProps<TItem> {
	getId: (item: TItem) => UniqueIdentifier
	index: number
	isLast: boolean
	item: TItem
	renderItem: (props: DraggableListRenderProps<TItem>) => ReactNode
}

/* * */

function DraggableListItem<TItem>({
	getId,
	index,
	isLast,
	item,
	renderItem,
}: DraggableListItemProps<TItem>) {
	const {
		attributes,
		isDragging,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({
		id: getId(item),
	});

	const style: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const dragHandle = (
		<button
			{...attributes}
			{...listeners}
			className={styles.dragHandle}
			type="button"
		>
			<IconGripVertical size={18} />
		</button>
	);

	return (
		<div
			ref={setNodeRef}
			className={cx(styles.item, { [styles.dragging]: isDragging })}
			style={style}
		>
			{renderItem({
				dragHandle,
				index,
				isDragging,
				isLast,
				item,
			})}
		</div>
	);
}

/* * */

export function DraggableList<TItem>({
	getId,
	items,
	onReorder,
	renderItem,
}: DraggableListProps<TItem>) {
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
		useSensor(KeyboardSensor),
	);

	const ids = items.map(item => getId(item));

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id) return;

		const oldIndex = ids.findIndex(id => id === active.id);
		const newIndex = ids.findIndex(id => id === over.id);

		if (oldIndex === -1 || newIndex === -1) return;

		onReorder(arrayMove(items, oldIndex, newIndex), {
			newIndex,
			oldIndex,
		});
	};

	return (
		<DndContext
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
			sensors={sensors}
		>
			<SortableContext items={ids} strategy={verticalListSortingStrategy}>
				{items.map((item, index) => (
					<DraggableListItem
						key={String(getId(item))}
						getId={getId}
						index={index}
						isLast={index === items.length - 1}
						item={item}
						renderItem={renderItem}
					/>
				))}
			</SortableContext>
		</DndContext>
	);
}
