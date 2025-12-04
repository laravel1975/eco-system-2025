import dagre from 'dagre';
import { Edge, Node, Position } from '@xyflow/react';

// (1. [แก้ไข] Type InputNode ให้รับ 'data: any' (ไม่สนใจโครงสร้าง data))
type InputNode = {
    id: string;
    data: any; // (รับข้อมูลอะไรก็ได้)
    // (เราจะเพิ่ม type เข้ามาด้วย)
    type?: string;
};

type InputEdge = { id: string; source: string; target: string; };

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// (ตั้งค่าขนาดของ Node)
const nodeWidth = 200;
const nodeHeight = 60; // (ปรับความสูงถ้า Card ของคุณสูงกว่านี้)

export const getLayoutedElements = (nodes: InputNode[], edges: InputEdge[]) => {
    dagreGraph.setGraph({ rankdir: 'TB' }); // (Top-to-Bottom)

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    // (2. [แก้ไข] Logic การ map node)
    const layoutedNodes = nodes.map((node): Node => {
        const nodeWithPosition = dagreGraph.node(node.id);

        return {
            id: node.id,
            data: node.data, // (ส่ง data object ที่รับมา (เช่น FlatDepartment) กลับไป)
            type: node.type, // (ส่ง type (เช่น 'employee') กลับไป)
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
        };
    });

    const layoutedEdges = edges.map((edge): Edge => ({
        ...edge,
        type: 'smoothstep',
        animated: false,
    }));

    return { nodes: layoutedNodes, edges: layoutedEdges };
};
