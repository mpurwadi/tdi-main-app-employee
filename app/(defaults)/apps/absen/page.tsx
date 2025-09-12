import AbsenceComponent from '@/components/apps/absen/components-apps-absen';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Absence',
};

const Absence = () => {
    return <AbsenceComponent />;
};

export default Absence;