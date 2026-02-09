"use client";

import RoomDashboard from '@/components/features/RoomDashboard';

export default function RoomPage({ params }: { params: { code: string } }) {
    // Use the code from params
    // Uppercase it just in case
    const code = params.code.toUpperCase();

    return <RoomDashboard code={code} />;
}
