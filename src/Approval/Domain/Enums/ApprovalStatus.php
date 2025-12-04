<?php

namespace TmrEcosystem\Approval\Domain\Enums;

enum ApprovalStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case RETURNED = 'returned'; // ตีกลับให้แก้ไข
}
