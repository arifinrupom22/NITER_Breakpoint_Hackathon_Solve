import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';

import '../providers/transport_provider.dart';
import '../services/simulation.dart';
import '../theme.dart';
import '../widgets/common.dart';
import 'driver_login_screen.dart';
import 'emergency_sos_screen.dart';
import 'route_selection_screen.dart';
import 'trip_start_screen.dart';

/// Driver Dashboard — status cards, primary action, vehicle diagnostics,
/// report/emergency buttons. Matches driver_dashboard_1.
class DriverDashboardScreen extends StatelessWidget {
  const DriverDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final tp = context.watch<TransportProvider>();
    final user = tp.user;
    final isDriver = user?.role == 'driver';

    if (!isDriver) {
      // Re-route to login if session dropped.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (context.mounted) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const DriverLoginScreen()),
          );
        }
      });
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final busId = user!.busId!;
    final bus = tp.simBuses[busId]!;
    final active = bus.isActive;
    final isArrived = bus.tripStatus == 'Arrived';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            const NiterHeader(title: 'NITER Transport'),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                children: [
                  Text(
                    _greeting(),
                    style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w700, color: AppColors.onSurface),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${user.name} · ${user.id} · ${bus.name}',
                    style: const TextStyle(fontSize: 14, color: AppColors.onSurfaceVariant),
                  ),
                  const SizedBox(height: 16),
                  // Status cards
                  Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          icon: Icons.directions_bus_outlined,
                          value: bus.name.replaceAll('Student ', '').replaceAll('Teacher ', ''),
                          label: 'Assigned Bus',
                          trailing: const StatusChip('Verified', bg: Color(0xFFE8F5E9), fg: Color(0xFF2E7D32)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: StatCard(
                          icon: Icons.route_outlined,
                          value: active ? 'Active' : isArrived ? 'Arrived' : 'Idle',
                          label: active ? 'On the road' : isArrived ? 'At campus' : 'Awaiting route',
                          accent: AppColors.secondaryFixedDim,
                          trailing: active ? const StatusChip('GPS ON', bg: Color(0xFFE8F5E9), fg: Color(0xFF2E7D32), live: true) : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const StatCard(
                    icon: Icons.my_location_outlined,
                    value: 'Ready',
                    label: 'GPS Status',
                    trailing: StatusChip('Signal Strong', bg: Color(0xFFE8F5E9), fg: Color(0xFF2E7D32), live: true),
                  ),
                  const SizedBox(height: 16),
                  // Primary action
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainerLowest,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: AppColors.shadowLevel1,
                      border: Border.all(color: AppColors.surfaceVariant),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          active ? Icons.satellite_alt : Icons.play_circle_outline,
                          size: 48,
                          color: AppColors.primary,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          active ? 'Trip Broadcasting' : 'Ready to Depart?',
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.onSurface),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          active
                              ? 'Live location is being shared with students and the website.'
                              : 'Select your designated route to begin GPS tracking and open passenger check-in.',
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 14, height: 1.5, color: AppColors.onSurfaceVariant),
                        ),
                        const SizedBox(height: 16),
                        if (active)
                          AppButton(
                            label: isArrived ? 'End Trip (At Campus)' : 'Live Trip View',
                            icon: isArrived ? Icons.stop_circle_outlined : Icons.map_outlined,
                            onPressed: () => Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => TripStartScreen(bus: bus)),
                            ),
                          )
                        else
                          AppButton(
                            label: 'Select Route to Start',
                            icon: Icons.route_outlined,
                            onPressed: () => Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const RouteSelectionScreen()),
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Vehicle diagnostics
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainerLowest,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: AppColors.shadowLevel1,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'VEHICLE DIAGNOSTICS',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 1, color: AppColors.onSurfaceVariant),
                        ),
                        const SizedBox(height: 12),
                        _DiagRow(icon: Icons.groups_outlined, label: 'Passenger Count', value: '${bus.passengers}/${bus.capacity}'),
                        const SizedBox(height: 8),
                        _DiagRow(
                          icon: Icons.local_gas_station_outlined,
                          label: 'Fuel Status',
                          value: '85%',
                          trailing: LinearProgressIndicator(value: 0.85, minHeight: 6, borderRadius: BorderRadius.circular(3), backgroundColor: AppColors.surfaceContainerHigh),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Report / Emergency
                  Row(
                    children: [
                      Expanded(
                        child: _ActionTile(
                          icon: Icons.report_problem_outlined,
                          label: 'Report Issue',
                          onTap: () => ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Issue reported to transport authority.')),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _ActionTile(
                          icon: Icons.emergency_outlined,
                          label: 'Emergency',
                          danger: true,
                          onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const EmergencySosScreen())),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Mini map
                  _MiniMapCard(bus: bus),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good Morning, Driver';
    if (h < 17) return 'Good Afternoon, Driver';
    return 'Good Evening, Driver';
  }
}

class _DiagRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Widget? trailing;
  const _DiagRow({required this.icon, required this.label, required this.value, this.trailing});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(color: AppColors.surfaceContainerLow, borderRadius: BorderRadius.circular(10)),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.secondaryContainer),
            child: Icon(icon, size: 18, color: AppColors.onSecondaryContainer),
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(label, style: const TextStyle(fontSize: 14, color: AppColors.onSurface))),
          if (trailing != null)
            Expanded(child: trailing!)
          else
            Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
        ],
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool danger;
  const _ActionTile({required this.icon, required this.label, required this.onTap, this.danger = false});

  @override
  Widget build(BuildContext context) {
    final fg = danger ? AppColors.onErrorContainer : AppColors.onSurface;
    return Material(
      color: danger ? AppColors.errorContainer : AppColors.surfaceContainerLowest,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            boxShadow: danger ? null : AppColors.shadowLevel1,
          ),
          child: Column(
            children: [
              Icon(icon, size: 32, color: danger ? AppColors.error : AppColors.secondary),
              const SizedBox(height: 8),
              Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: fg)),
            ],
          ),
        ),
      ),
    );
  }
}

class _MiniMapCard extends StatelessWidget {
  final SimBus bus;
  const _MiniMapCard({required this.bus});

  @override
  Widget build(BuildContext context) {
    final coords = bus.route.coords;
    return Container(
      height: 140,
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppColors.shadowLevel1,
      ),
      clipBehavior: Clip.antiAlias,
      child: CustomPaint(
        painter: _RouteMapPainter(coords: coords, position: bus.isActive ? bus.position : coords.first, active: bus.isActive),
        child: Stack(
          children: [
            Positioned(
              left: 12,
              top: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerLowest.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  bus.isActive ? 'LIVE GPS · ${bus.speedKmh.toStringAsFixed(0)} km/h' : 'STANDBY',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: bus.isActive ? const Color(0xFF2E7D32) : AppColors.onSurfaceVariant,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RouteMapPainter extends CustomPainter {
  final List<LatLng> coords;
  final LatLng position;
  final bool active;
  _RouteMapPainter({required this.coords, required this.position, required this.active});

  @override
  void paint(Canvas canvas, Size size) {
    if (coords.isEmpty) return;
    // Fit coordinates into the box.
    final lats = coords.map((c) => c.latitude).toList();
    final lngs = coords.map((c) => c.longitude).toList();
    final minLat = lats.reduce((a, b) => a < b ? a : b);
    final maxLat = lats.reduce((a, b) => a > b ? a : b);
    final minLng = lngs.reduce((a, b) => a < b ? a : b);
    final maxLng = lngs.reduce((a, b) => a > b ? a : b);
    const pad = 24.0;
    final spanLat = (maxLat - minLat).clamp(0.0001, 1.0);
    final spanLng = (maxLng - minLng).clamp(0.0001, 1.0);
    Offset project(LatLng p) => Offset(
          pad + (p.longitude - minLng) / spanLng * (size.width - pad * 2),
          size.height - pad - (p.latitude - minLat) / spanLat * (size.height - pad * 2),
        );

    final path = ui.Path()..moveTo(project(coords.first).dx, project(coords.first).dy);
    for (final c in coords.skip(1)) {
      final pt = project(c);
      path.lineTo(pt.dx, pt.dy);
    }
    canvas.drawPath(path, Paint()..style = PaintingStyle.stroke..strokeWidth = 5..color = AppColors.primary.withValues(alpha: 0.55)..strokeCap = StrokeCap.round);
    canvas.drawPath(path, Paint()..style = PaintingStyle.stroke..strokeWidth = 2..color = AppColors.primary..strokeCap = StrokeCap.round);

    // Stops
    for (final c in coords) {
      final pt = project(c);
      canvas.drawCircle(pt, 5, Paint()..color = Colors.white);
      canvas.drawCircle(pt, 5, Paint()..style = PaintingStyle.stroke..strokeWidth = 2.5..color = AppColors.primary);
    }
    // Campus marker
    final last = project(coords.last);
    canvas.drawCircle(last, 8, Paint()..color = AppColors.tertiary);
    canvas.drawCircle(last, 8, Paint()..style = PaintingStyle.stroke..strokeWidth = 2..color = Colors.white);

    if (active) {
      final busPt = project(position);
      canvas.drawCircle(busPt, 16, Paint()..color = AppColors.primary.withValues(alpha: 0.2));
      canvas.drawCircle(busPt, 8, Paint()..color = AppColors.primary);
      canvas.drawCircle(busPt, 8, Paint()..style = PaintingStyle.stroke..strokeWidth = 2..color = Colors.white);
    }
  }

  @override
  bool shouldRepaint(covariant _RouteMapPainter oldDelegate) =>
      oldDelegate.position != position || oldDelegate.active != active;
}
