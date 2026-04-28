<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Institution extends Model
{
    protected $fillable = ['name', 'type', 'code', 'contact_info'];

    protected $casts = [
        'contact_info' => 'array',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
