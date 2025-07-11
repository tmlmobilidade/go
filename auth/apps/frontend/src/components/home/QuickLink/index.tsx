"use client"

/* * */

import { type QuickLink } from '@/components/home/homePage/data';
import { Label } from '@tmlmobilidade/ui';
import styles  from './styles.module.css'

/* * */

interface QuickLinkButtonProps {
    item: QuickLink
}

/* * */

export function QuickLinkButton({item}: QuickLinkButtonProps) {
    return(
        <a className={styles.container} href={item.href} target='_blank'>
            <Label size='lg'>{item.icon}</Label> 
            <Label size="lg">{item.title}</Label>
        </a>
    );
}