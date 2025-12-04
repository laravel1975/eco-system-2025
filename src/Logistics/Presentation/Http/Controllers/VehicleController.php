<?php

namespace TmrEcosystem\Logistics\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
// ✅ Import จาก Namespace ที่ถูกต้อง
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\Vehicle;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $query = Vehicle::query();

        if ($request->search) {
            $query->where('license_plate', 'like', "%{$request->search}%")
                  ->orWhere('driver_name', 'like', "%{$request->search}%");
        }

        $vehicles = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Logistics/Vehicles/Index', [
            'vehicles' => $vehicles,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'license_plate' => 'required|unique:logistics_vehicles,license_plate',
            'vehicle_type' => 'required',
            'ownership_type' => 'required',
            'brand' => 'nullable|string',
            'driver_name' => 'nullable|string',
            'driver_phone' => 'nullable|string',
        ]);

        Vehicle::create($validated);

        return back()->with('success', 'Vehicle created successfully.');
    }

    public function update(Request $request, string $id)
    {
        $vehicle = Vehicle::findOrFail($id);

        $validated = $request->validate([
            'license_plate' => 'required|unique:logistics_vehicles,license_plate,' . $id,
            'vehicle_type' => 'required',
            'ownership_type' => 'required',
            'brand' => 'nullable|string',
            'driver_name' => 'nullable|string',
            'driver_phone' => 'nullable|string',
            'status' => 'required'
        ]);

        $vehicle->update($validated);

        return back()->with('success', 'Vehicle updated successfully.');
    }

    public function destroy(string $id)
    {
        Vehicle::destroy($id);
        return back()->with('success', 'Vehicle deleted.');
    }
}
