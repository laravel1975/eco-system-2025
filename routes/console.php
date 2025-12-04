<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// (เพิ่มบรรทัดนี้: รันทุกวัน เวลาเที่ยงคืน)
Schedule::command('maintenance:run-pm')->dailyAt('00:00');
