<?php

namespace TmrEcosystem\Sales\Domain\ValueObjects;

enum OrderStatus: string
{
    case Draft = 'draft';
    case PendingReservation = 'pending_reservation';
    case Confirmed = 'confirmed';
    case Cancelled = 'cancelled';
    case Completed = 'completed';

    public function label(): string
    {
        return match($this) {
            self::Draft => 'Draft',
            self::PendingReservation => 'Waiting for Stock',
            self::Confirmed => 'Confirmed',
            self::Cancelled => 'Cancelled',
            self::Completed => 'Completed',
        };
    }
}
