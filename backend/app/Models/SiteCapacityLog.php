<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteCapacityLog extends Model
{
    protected $table = 'site_capacity_log';

    protected $fillable = [
        'site_id',
        'log_time',
        'visitor_count'
    ];

    public function site()
    {
        return $this->belongsTo(TouristSite::class, 'site_id');
    }
}
