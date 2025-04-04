"use client";

import GenericHeader from './GenericHeader';
import SpecificHeader from './SpecificHeader';

interface HeaderProps {
    generic: boolean;
}

export default function Header({ generic }: HeaderProps) {
    console.log("->generic", generic)
    return <>
        {
            generic === true ? <GenericHeader /> : <SpecificHeader />
        };
    </>
}


