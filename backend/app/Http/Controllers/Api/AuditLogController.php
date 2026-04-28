<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index() { return AuditLog::with('user')->latest()->paginate(20); }
    public function show(AuditLog $log) { return $log->load('user'); }
}
