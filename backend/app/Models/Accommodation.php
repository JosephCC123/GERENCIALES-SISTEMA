<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Accommodation extends Model
{
    protected $fillable = [
        'operator_id',
        'name',
        'category',
        'total_rooms',
        'phone',
        'address'
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
