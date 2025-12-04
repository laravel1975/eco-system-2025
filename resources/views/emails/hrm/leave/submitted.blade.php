<x-mail::message>
# New Leave Request

Hello {{ $managerName }},

A new leave request has been submitted by **{{ $employeeName }}** and is awaiting your approval.

- **Leave Type:** {{ $leaveRequest->leaveType->name }}
- **Start Date:** {{ $leaveRequest->start_datetime->format('d M Y, H:i') }}
- **End Date:** {{ $leaveRequest->end_datetime->format('d M Y, H:i') }}
- **Total Days:** {{ $leaveRequest->total_days }}
- **Reason:** {{ $leaveRequest->reason ?? 'N/A' }}

You can approve or reject this request by visiting the Leave Management portal.

<x-mail::button :url="$url">
View Leave Requests
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
