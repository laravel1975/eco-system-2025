import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Trash2 } from 'lucide-react';
import InputError from '@/Components/InputError';
/*
|--------------------------------------------------------------------------
| 1. Type Definitions
|--------------------------------------------------------------------------
*/
export interface PlanTask {
    id?: number; // (มี ID ถ้ามาจาก DB)
    task_name: string;
    description: string | null;
}

interface Props {
    tasks: PlanTask[];
    setData: (field: 'tasks', tasks: PlanTask[]) => void;
    errors: Partial<Record<string, string>>;

    // (2. [แก้ไข] เปลี่ยน Type ที่ซับซ้อน ให้เป็นฟังก์ชันง่ายๆ)
    // (เพราะเราเรียกใช้แค่ clearErrors() โดยไม่ส่งค่าอะไร)
    clearErrors: () => void;
}

/*
|--------------------------------------------------------------------------
| 2. React Component
|--------------------------------------------------------------------------
*/
export default function PlanTaskForm({ tasks, setData, errors, clearErrors }: Props) {

    // (เพิ่ม Task ใหม่)
    const handleAddTask = () => {
        setData('tasks', [
            ...tasks,
            { task_name: '', description: null }
        ]);
    };

    // (ลบ Task)
    const handleRemoveTask = (indexToRemove: number) => {
        setData('tasks', tasks.filter((_, index) => index !== indexToRemove));
        clearErrors(); // (โค้ดนี้จะยังทำงานได้ถูกต้อง 100%)
    };

    // (อัปเดตข้อมูล Task)
    const handleTaskChange = (index: number, field: 'task_name' | 'description', value: string) => {
        const newTasks = [...tasks];
        newTasks[index][field] = value;
        setData('tasks', newTasks);
    };
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">รายการตรวจสอบ (Checklist)</h3>

            {tasks.length === 0 && (
                <p className="text-sm text-center text-gray-500 py-4 border rounded-md">
                    ยังไม่มีรายการตรวจสอบ
                </p>
            )}

            {/* (วนลูปแสดงฟอร์ม Task) */}
            {tasks.map((task, index) => (
                <div key={index} className="flex items-start gap-2 p-3 border rounded-md">
                    <span className="text-sm font-semibold pt-2">{index + 1}.</span>

                    <div className="flex-grow space-y-2">
                        {/* (Task Name) */}
                        <Input
                            placeholder="ชื่องาน (เช่น ตรวจสอบสายพาน)"
                            value={task.task_name}
                            onChange={(e) => handleTaskChange(index, 'task_name', e.target.value)}
                        />
                        <InputError message={errors[`tasks.${index}.task_name`]} />

                        {/* (Description) */}
                        <Textarea
                            placeholder="คำอธิบาย (ถ้ามี)"
                            value={task.description || ''}
                            onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                            rows={2}
                        />
                        <InputError message={errors[`tasks.${index}.description`]} />
                    </div>

                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveTask(index)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ))}

            <InputError message={errors.tasks} />

            <Button type="button" variant="outline" onClick={handleAddTask}>
                + เพิ่มรายการ
            </Button>
        </div>
    );
}
