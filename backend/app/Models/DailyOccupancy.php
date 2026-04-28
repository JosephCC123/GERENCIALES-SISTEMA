<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyOccupancy extends Model
{
    protected $table = 'daily_occupancy';

    protected $fillable = [
        'accommodation_id',
        'date',
        'occupied_rooms',
        'available_rooms',
        'occupancy_rate'
    ];

    public function accommodation()
    {
        return $this->belongsTo(Accommodation::class, 'accommodation_id');
    }
}
