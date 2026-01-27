"use client";

import { StatsGrid } from "@/components/StatsGrid";

export default function StatsDemoPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Stats</h1>
                <StatsGrid />
            </div>
        </div>
    );
}
