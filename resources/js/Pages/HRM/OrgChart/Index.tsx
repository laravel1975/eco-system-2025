import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/Components/ui/card';
import { Building, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import HrmNavigationMenu from '../Partials/HrmNavigationMenu';

// (1. [แก้ไข] Import Handle และ Position)
import {
    ReactFlow,
    Controls,
    Background,
    Node,
    Edge,
    ReactFlowProvider,
    Handle, // (เพิ่ม)
    Position, // (เพิ่ม)
} from '@xyflow/react';

// (Import CSS ของ React Flow)
import '@xyflow/react/dist/style.css';

// (Import Helper ที่เราเพิ่งสร้าง)
import { getLayoutedElements } from '@/lib/dagreLayout';


// --- (Interfaces - เหมือนเดิม) ---
interface FlatEmployee {
    id: number;
    first_name: string;
    last_name: string;
    job_title: string | null;
    reports_to_user_id: number | null;
    user: { id: number; name: string } | null;
}
interface FlatDepartment {
    id: number;
    name: string;
    parent_id: number | null;
}
interface IndexPageProps extends PageProps {
    allEmployees: FlatEmployee[];
    allDepartments: FlatDepartment[];
    companyName: string;
}

// --- (Component UI Card - [แก้ไข] 2. เพิ่ม <Handle>) ---
const EmployeeNode = ({ data }: { data: FlatEmployee }) => (
    <div className="p-3 border rounded-lg shadow-sm bg-white min-w-[200px] text-center">
        {/* (เพิ่ม Handle "รับ" ที่ด้านบน) */}
        <Handle type="target" position={Position.Top} className="!bg-blue-500" />

        <div className="font-semibold">
            {data.first_name} {data.last_name}
        </div>
        <div className="text-sm text-muted-foreground">{data.job_title ?? 'N/A'}</div>

        {/* (เพิ่ม Handle "ส่ง" ที่ด้านล่าง) */}
        <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
);
const DepartmentNode = ({ data }: { data: FlatDepartment | { name: string } }) => (
    <div className="p-3 border rounded-lg shadow-sm bg-blue-50 border-blue-200 min-w-[200px] text-center">
        {/* (เพิ่ม Handle "รับ" ที่ด้านบน) */}
        <Handle type="target" position={Position.Top} className="!bg-blue-500" />

        <div className="font-semibold text-blue-800">{data.name}</div>

        {/* (เพิ่ม Handle "ส่ง" ที่ด้านล่าง) */}
        <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
);
const nodeTypes = {
    employee: EmployeeNode,
    department: DepartmentNode,
};


// --- (Helper: สร้าง Nodes และ Edges - เหมือนเดิม) ---
function buildFlowData(
    items: (FlatEmployee | FlatDepartment)[],
    type: 'employee' | 'department',
    rootNodeData?: { id: string; data: { name: string } }
) {
    const nodes: any[] = [];
    const edges: any[] = [];

    if (rootNodeData) {
        nodes.push({
            id: rootNodeData.id,
            data: rootNodeData.data,
            type: 'department',
        });
    }

    items.forEach((item) => {
        const nodeId = String(item.id);
        nodes.push({
            id: nodeId,
            data: item,
            type: type,
        });

        let parentId: number | null = null;
        if (type === 'department' && 'parent_id' in item) {
            parentId = item.parent_id;
        } else if (type === 'employee' && 'reports_to_user_id' in item) {
            parentId = item.reports_to_user_id;
        }

        const sourceId = (parentId === null)
                            ? (rootNodeData ? rootNodeData.id : null)
                            : String(parentId);

        if (sourceId) {
            edges.push({
                id: `e-${sourceId}-${nodeId}`,
                source: sourceId,
                target: nodeId,
            });
        }
    });

    return getLayoutedElements(nodes, edges);
}


// --- (Component หลัก: หน้า Index - เหมือนเดิม) ---
export default function OrgChartIndex({ auth, allEmployees, allDepartments, companyName }: IndexPageProps) {

    const { nodes: deptNodes, edges: deptEdges } = useMemo(
        () => buildFlowData(
            allDepartments,
            'department',
            { id: 'company_root', data: { name: companyName } }
        ),
        [allDepartments, companyName]
    );

    const { nodes: empNodes, edges: empEdges } = useMemo(
        () => buildFlowData(
            allEmployees,
            'employee'
        ),
        [allEmployees]
    );


    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Organizational Chart
                </h2>
            }
            navigationMenu={<HrmNavigationMenu />}
        >
            <Head title="Org Chart" />

            <div className="py-12">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8">

                    <Tabs defaultValue="department_chart" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="employee_chart">
                                <Users className="mr-2 h-4 w-4" /> Employee Reporting Line
                            </TabsTrigger>
                            <TabsTrigger value="department_chart">
                                <Building className="mr-2 h-4 w-4" /> Department Structure
                            </TabsTrigger>
                        </TabsList>

                        {/* (แท็บที่ 1: แผนผังพนักงาน - React Flow) */}
                        <TabsContent value="employee_chart">
                            <Card>
                                <CardContent className="p-0" style={{ height: '70vh' }}>
                                    <ReactFlowProvider>
                                        <ReactFlow
                                            nodes={empNodes}
                                            edges={empEdges}
                                            nodeTypes={nodeTypes}
                                            fitView
                                        >
                                            <Controls />
                                            <Background />
                                        </ReactFlow>
                                    </ReactFlowProvider>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* (แท็บที่ 2: แผนผังแผนก - React Flow) */}
                        <TabsContent value="department_chart">
                            <Card>
                                <CardContent className="p-0" style={{ height: '70vh' }}>
                                    <ReactFlowProvider>
                                        <ReactFlow
                                            nodes={deptNodes}
                                            edges={deptEdges}
                                            nodeTypes={nodeTypes}
                                            fitView
                                        >
                                            <Controls />
                                            <Background />
                                        </ReactFlow>
                                    </ReactFlowProvider>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
