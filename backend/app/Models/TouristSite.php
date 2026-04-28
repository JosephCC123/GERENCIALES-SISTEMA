<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TouristSite extends Model
{
    protected $fillable = [
        'name',
        'type',
        'location',
        'capacity',
        'status',
        'managing_entity_id',
    ];

    public function managingEntity()
    {
        return $this->belongsTo(Institution::class, 'managing_entity_id');
    }
}
