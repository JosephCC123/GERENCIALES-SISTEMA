<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Accommodation extends Model
{
    protected $fillable = [
        'operator_id',
        'name',
        'type',
        'category',
        'total_rooms',
        'phone',
        'address',
        'status'
    ];

    public function operator()
    {
        return $this->belongsTo(TourismOperator::class, 'operator_id');
    }

    public function dailyOccupancies()
    {
        return $this->hasMany(DailyOccupancy::class, 'accommodation_id');
    }
}
