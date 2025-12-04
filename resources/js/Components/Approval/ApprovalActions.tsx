import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { useState } from "react";
import { router } from "@inertiajs/react";

export function ApprovalActions({ requestId }: { requestId: string }) {
  const [comment, setComment] = useState("");

  const submit = (action: 'approve' | 'reject') => {
    router.post(route('approval.action'), {
      request_id: requestId,
      action,
      comment
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold">Approval Decision</h3>
      <Textarea
        placeholder="Reason or comments..."
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={() => submit('approve')} className="bg-green-600 hover:bg-green-700">
          Approve
        </Button>
        <Button onClick={() => submit('reject')} variant="destructive">
          Reject
        </Button>
      </div>
    </div>
  );
}
