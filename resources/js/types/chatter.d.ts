export type MessageType = 'notification' | 'message' | 'note';

export interface ChatMessage {
    id: string;
    type: MessageType;
    author: {
        name: string;
        avatar?: string;
    };
    content: string; // รองรับ HTML ได้จะดีมาก
    created_at: string; // ISO String
    is_internal: boolean;
}
