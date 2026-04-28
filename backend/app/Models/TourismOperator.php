<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TourismOperator extends Model
{
    protected $fillable = [
        'business_name',
        'ruc',
        'operator_type',
        'license_number',
        'license_expiry',
        'status',
        'phone',
        'email',
        'address'
    ];

    public function accommodations()
    {
        return $this->hasMany(Accommodation::class, 'operator_id');
    }
}
