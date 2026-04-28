<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Visitor extends Model
{
    protected $fillable = [
        'site_id',
        'full_name',
        'document_number',
        'visitor_type',
        'nationality',
        'entry_date',
        'entry_time',
        'exit_time',
        'ticket_number'
    ];

    public function site()
    {
        return $this->belongsTo(TouristSite::class, 'site_id');
    }
}
