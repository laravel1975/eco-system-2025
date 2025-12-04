import React, { useState, useEffect } from 'react';
import { Button } from "@/Components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Textarea } from "@/Components/ui/textarea";
import { Send, MessageSquare } from "lucide-react"; // Import ไอคอนที่ใช้
import { cn } from "@/lib/utils";
import { ChatMessage } from '@/types/chatter';
import axios from 'axios'; // 👈 อย่าลืม install axios หรือใช้ของที่ Laravel แถมมา

interface ChatterProps {
    modelId: string;   // ID ของเอกสาร (Sales Order UUID)
    modelType: string; // ชื่อ Model (เช่น 'sales_order')
    className?: string;
}

export default function Chatter({ modelId, modelType, className }: ChatterProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'message' | 'note' | null>(null);
    const [inputText, setInputText] = useState("");

    // 1. Fetch Messages เมื่อ modelId เปลี่ยน
    useEffect(() => {
        if (!modelId) return; // ถ้ายังไม่มี ID (เช่นหน้า Create ใหม่ๆ) ไม่ต้องโหลด

        setIsLoading(true);
        axios.get(route('api.communication.messages.index'), {
            params: { model_type: modelType, model_id: modelId }
        })
            .then(response => {
                setMessages(response.data);
            })
            .catch(error => console.error("Failed to load messages:", error))
            .finally(() => setIsLoading(false));
    }, [modelId, modelType]);

    // 2. Handle Submit (Post Message)
    const handleSubmit = () => {
        if (!inputText.trim() || !modelId) return;

        const payload = {
            body: inputText,
            model_type: modelType,
            model_id: modelId,
            type: mode // 'message' or 'note'
        };

        axios.post(route('api.communication.messages.store'), payload)
            .then(response => {
                // Success: เอาข้อความใหม่ไปแปะท้าย list
                setMessages([...messages, response.data]);
                setInputText("");
                setMode(null);
            })
            .catch(error => {
                console.error("Failed to send message:", error);
                alert("Error sending message. Please try again.");
            });
    };

    // --- Render Logic (เหมือนเดิม แต่ใช้ state messages ที่ดึงจาก API) ---
    return (
        <div className={cn("flex flex-col space-y-6", className)}>
            {/* Action Bar */}
            <div className="flex items-center space-x-2 border-b pb-2">
                <Button
                    variant={mode === 'message' ? "default" : "ghost"}
                    className={mode === 'message' ? "bg-purple-700 text-white" : "text-gray-600"}
                    onClick={() => setMode(mode === 'message' ? null : 'message')}
                    disabled={!modelId} // 👈 ห้ามกดถ้ายังไม่มี ID (ยังไม่ Save Order)
                >
                    Send message
                </Button>
                <Button
                    variant={mode === 'note' ? "default" : "ghost"}
                    className={mode === 'note' ? "bg-gray-200 text-gray-900" : "text-gray-600"}
                    onClick={() => setMode(mode === 'note' ? null : 'note')}
                    disabled={!modelId}
                >
                    Log note
                </Button>
            </div>

            {/* Composer */}
            {mode && (
                <div className={cn("p-4 rounded-lg border shadow-sm", mode === 'note' ? "bg-yellow-50" : "bg-white")}>
                    <Textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={mode === 'note' ? "Log an internal note..." : "Message to customer..."}
                        className="bg-transparent border-none focus-visible:ring-0 resize-none min-h-[80px]"
                    />
                    <div className="flex justify-end mt-2">
                        <Button size="sm" onClick={handleSubmit} className={mode === 'note' ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "bg-purple-700"}>
                            Send <Send className="w-3 h-3 ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Messages Feed */}
            <div className="space-y-6 pl-4 relative">
                {!modelId ? (
                    // Case: หน้า New Record (ยังไม่ Save)
                    <div className="flex items-center gap-4 text-sm text-gray-500 py-4">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border">
                            <MessageSquare className="h-5 w-5 text-gray-400" />
                        </div>
                        <p>Creating a new record...</p>
                    </div>
                ) : messages.length === 0 ? (
                    // Case: มี ID แล้ว แต่ยังไม่มีข้อความ
                    <p className="text-gray-400 text-sm italic text-center py-4">No history yet.</p>
                ) : (
                    // Case: Render Messages
                    messages.map((msg) => (
                        <div key={msg.id} className="flex gap-4 relative group">
                            {/* เส้น Timeline */}
                            <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-gray-200 group-last:hidden"></div>

                            <Avatar className="h-10 w-10 border bg-white z-10">
                                <AvatarFallback>{msg.author.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm">{msg.author.name}</span>
                                    <span className="text-xs text-gray-400">{msg.created_at}</span>
                                    {msg.is_internal && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded border border-yellow-200">Note</span>}
                                </div>
                                <div className={cn("text-sm p-3 rounded-lg border", msg.is_internal ? "bg-yellow-50 border-yellow-100" : "bg-white border-gray-200")}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
