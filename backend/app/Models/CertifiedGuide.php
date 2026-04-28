<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CertifiedGuide extends Model
{
    protected $fillable = [
        'full_name',
        'license_number',
        'license_expiry',
        'languages',
        'specialization',
        'phone',
        'email',
        'status'
    ];
}
