import React from 'react';
import { Check, Truck, Home, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ShipmentTimeline({ status }: { status: string }) {
    const steps = [
        { id: 'planned', label: 'Planning', icon: Home },
        { id: 'shipped', label: 'In Transit', icon: Truck },
        { id: 'completed', label: 'Completed', icon: Flag },
    ];

    // หา index ปัจจุบัน
    const currentIndex = steps.findIndex(s => s.id === status);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between relative">
                {/* เส้นเชื่อม (Background Line) */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />

                {/* เส้นสีเขียว (Progress Line) */}
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 transition-all duration-500 -z-10"
                    style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <div key={step.id} className="flex flex-col items-center bg-white px-2">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                isCompleted ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-300 text-gray-400",
                                isCurrent && "ring-4 ring-green-100 scale-110"
                            )}>
                                <step.icon className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "text-xs font-bold mt-2 uppercase tracking-wider",
                                isCompleted ? "text-green-600" : "text-gray-400"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
