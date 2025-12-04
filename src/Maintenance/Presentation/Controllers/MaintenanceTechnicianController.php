<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceTechnician;

class MaintenanceTechnicianController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $query = MaintenanceTechnician::where('company_id', $companyId);

        // (Filter: Search)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        // (Paginate)
        $technicians = $query->orderBy('first_name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Maintenance/Technicians/Index', [
            'technicians' => $technicians,
            'filters' => $request->only(['search']),
        ]);
    }
}
