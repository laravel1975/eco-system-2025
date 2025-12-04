<?php

namespace TmrEcosystem\Approval\Domain\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use TmrEcosystem\Approval\Domain\Models\ApprovalRequest;

class WorkflowCompleted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public ApprovalRequest $request
    ) {}
}
