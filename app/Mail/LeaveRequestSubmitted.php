<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use TmrEcosystem\HRM\Domain\Models\LeaveRequest;

class LeaveRequestSubmitted extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * @var LeaveRequest
     */
    public $leaveRequest;

    /**
     * @var string
     */
    public $employeeName;

    /**
     * @var string
     */
    public $managerName;

    /**
     * Create a new message instance.
     */
    public function __construct(LeaveRequest $leaveRequest, string $employeeName, string $managerName)
    {
        $this->leaveRequest = $leaveRequest;
        $this->employeeName = $employeeName;
        $this->managerName = $managerName;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Leave Request Submitted by ' . $this->employeeName,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        // (เราจะใช้ Markdown View)
        return new Content(
            markdown: 'emails.hrm.leave.submitted',
            with: [
                'url' => route('hrm.leave-requests.index'), // (ลิงก์ไปหน้าจัดการใบลา)
            ],
        );
    }
}
