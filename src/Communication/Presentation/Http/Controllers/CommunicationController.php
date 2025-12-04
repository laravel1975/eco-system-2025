<?php

namespace TmrEcosystem\Communication\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use TmrEcosystem\Communication\Infrastructure\Persistence\Models\CommunicationMessage;

class CommunicationController extends Controller
{
    // 1. ดึงประวัติการคุย (GET /api/communication/messages)
    public function index(Request $request)
    {
        $request->validate([
            'model_type' => 'required|string',
            'model_id' => 'required|string',
        ]);

        $messages = CommunicationMessage::with('user') // Eager Load User
            ->where('model_type', $request->model_type)
            ->where('model_id', $request->model_id)
            ->orderBy('created_at', 'asc') // เรียงตามเวลา (เก่า -> ใหม่)
            ->get();

        // Transform Data ให้ตรงกับ Typescript Interface
        return response()->json($messages->map(fn($msg) => [
            'id' => $msg->id,
            'type' => $msg->type,
            'content' => $msg->body,
            'created_at' => $msg->created_at->diffForHumans(), // แปลงเวลาให้อ่านง่าย เช่น "2 min ago"
            'is_internal' => $msg->type === 'note',
            'author' => [
                'name' => $msg->user->name ?? 'System',
                'avatar' => null, // หรือ $msg->user->profile_photo_url
            ]
        ]));
    }

    // 2. โพสต์ข้อความใหม่ (POST /api/communication/messages)
    public function store(Request $request)
    {
        $request->validate([
            'body' => 'required|string',
            'model_type' => 'required|string',
            'model_id' => 'required|string',
            'type' => 'required|in:message,note',
        ]);

        $message = CommunicationMessage::create([
            'user_id' => auth()->id(),
            'body' => $request->body,
            'model_type' => $request->model_type,
            'model_id' => $request->model_id,
            'type' => $request->type,
        ]);

        // Return กลับไปให้ Frontend แปะใน Timeline ทันที
        return response()->json([
            'id' => $message->id,
            'type' => $message->type,
            'content' => $message->body,
            'created_at' => 'Just now',
            'is_internal' => $message->type === 'note',
            'author' => [
                'name' => auth()->user()->name,
                'avatar' => null,
            ]
        ]);
    }
}
