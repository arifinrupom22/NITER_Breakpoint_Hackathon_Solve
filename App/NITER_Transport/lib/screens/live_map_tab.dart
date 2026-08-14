import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:provider/provider.dart';

import '../data/seed_data.dart';
import '../providers/transport_provider.dart';
import '../services/simulation.dart';
import '../theme.dart';
import '../widgets/common.dart';
import 'verify_screen.dart';

/// Live Map tab — requires an authorized student/teacher. Shows the eligible
/// buses on a real OSM map with routes, markers and a details bottom sheet.
class LiveMapTab extends StatelessWidget {
  /// When pushed as a full-screen route (e.g. from a bus card), show a back
  /// button in the header/gate.
  final bool showBack;
  const LiveMapTab({super.key, this.showBack = false});

  @override
  Widget build(BuildContext context) {
    final tp = context.watch<TransportProvider>();
    final eligible = tp.user?.eligibleBuses ?? const <String>[];
    final isAuthorized = eligible.isNotEmpty;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: isAuthorized
          ? _LiveMapView(eligibleBuses: eligible, showBack: showBack)
          : _VerifyGate(
              showBack: showBack,
              onVerify: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const VerifyScreen())),
            ),
    );
  }
}

/// Standalone full-screen map used by the `/map` route and bus cards.
class MapScreen extends StatelessWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const LiveMapTab(showBack: true);
  }
}

class _VerifyGate extends StatelessWidget {
  final VoidCallback onVerify;
  final bool showBack;
  const _VerifyGate({required this.onVerify, this.showBack = false});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            NiterHeader(
              title: 'Live Map',
              leading: showBack
                  ? IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.of(context).pop())
                  : null,
            ),
            const Spacer(),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(16),
                boxShadow: AppColors.shadowLevel1,
              ),
              child: Column(
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFFEFF6FF)),
                    child: const Icon(Icons.lock_outline, size: 34, color: AppColors.primary),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Live tracking is protected',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.onSurface),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Live bus locations are available only to authorized NITER students and teachers. Verify your identity to continue.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 15, height: 1.5, color: AppColors.onSurfaceVariant),
                  ),
                  const SizedBox(height: 20),
                  AppButton(label: 'Verify to View Buses', icon: Icons.verified_user_outlined, onPressed: onVerify),
                ],
              ),
            ),
            const Spacer(),
          ],
        ),
      ),
    );
  }
}

class _LiveMapView extends StatefulWidget {
  final List<String> eligibleBuses;
  final bool showBack;
  const _LiveMapView({required this.eligibleBuses, this.showBack = false});

  @override
  State<_LiveMapView> createState() => _LiveMapViewState();
}

class _LiveMapViewState extends State<_LiveMapView> {
  final _mapController = MapController();
  String? _selectedBusId;

  @override
  void initState() {
    super.initState();
    _selectedBusId = widget.eligibleBuses.first;
  }

  @override
  Widget build(BuildContext context) {
    final tp = context.watch<TransportProvider>();
    final buses = widget.eligibleBuses.map((id) => tp.simBuses[id]!).toList();
    final selected =
        buses.where((b) => b.id == _selectedBusId).firstOrNull ?? buses.first;

    final route = selected.route;
    final polyline = route.coords;

    final focus = selected.isActive ? selected.position : polyline.first;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          // Bus selector chips
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            decoration: const BoxDecoration(color: AppColors.surface, boxShadow: AppColors.shadowLevel1),
            child: Row(
              children: [
                if (widget.showBack) ...[      
                  IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.of(context).pop()),
                  const SizedBox(width: 4),
                ],
                Expanded(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: buses.map((b) {
                        final active = b.id == _selectedBusId;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: ChoiceChip(
                            label: Text(b.name),
                            selected: active,
                            onSelected: (_) => setState(() => _selectedBusId = b.id),
                            selectedColor: AppColors.primary,
                            labelStyle: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: active ? Colors.white : AppColors.onSurface,
                            ),
                            backgroundColor: AppColors.surfaceContainerLowest,
                            side: BorderSide(color: active ? AppColors.primary : AppColors.outlineVariant),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Map
          Expanded(
            child: Stack(
              children: [
                FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: focus,
                    initialZoom: 12,
                    interactionOptions: const InteractionOptions(flags: InteractiveFlag.all & ~InteractiveFlag.rotate),
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.niter.niter_transport',
                      maxZoom: 19,
                    ),
                    // Route line
                    PolylineLayer(
                      polylines: [
                        Polyline(
                          points: polyline,
                          color: selected.isActive ? AppColors.primary : AppColors.primary.withValues(alpha: 0.35),
                          strokeWidth: 5,
                          borderColor: AppColors.primaryFixedDim.withValues(alpha: 0.5),
                          borderStrokeWidth: 1,
                        ),
                      ],
                    ),
                    // Stop markers
                    MarkerLayer(
                      markers: [
                        for (var i = 0; i < route.stops.length; i++)
                          Marker(
                            point: route.stops[i].pos,
                            width: 26,
                            height: 26,
                            child: Container(
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: i == route.stops.length - 1 ? AppColors.tertiary : Colors.white,
                                border: Border.all(color: i == route.stops.length - 1 ? AppColors.tertiary : AppColors.primary, width: 3),
                                boxShadow: const [BoxShadow(color: Color(0x33000000), blurRadius: 6)],
                              ),
                              child: i == route.stops.length - 1
                                  ? const Icon(Icons.school, size: 14, color: Colors.white)
                                  : null,
                            ),
                          ),
                      ],
                    ),
                    // Bus marker
                    if (selected.isActive)
                      MarkerLayer(
                        markers: [
                          Marker(
                            point: selected.position,
                            width: 56,
                            height: 56,
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                // pulse ring
                                Positioned.fill(
                                  child: CustomPaint(painter: _PulseRingPainter(primary: AppColors.primary)),
                                ),
                                Container(
                                  width: 36,
                                  height: 36,
                                  decoration: const BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: AppColors.primary,
                                    boxShadow: [BoxShadow(color: Color(0x33000000), blurRadius: 10)],
                                  ),
                                  child: const Icon(Icons.directions_bus_filled, color: Colors.white, size: 20),
                                ),
                                Positioned(
                                  top: 34,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.surfaceContainerLowest,
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: AppColors.surfaceContainerHighest),
                                    ),
                                    child: Text(
                                      selected.name.replaceAll('Bus ', 'Bus '),
                                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.onSurface),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    // Inactive bus marker at departure point
                    if (!selected.isActive)
                      MarkerLayer(
                        markers: [
                          Marker(
                            point: route.stops.first.pos,
                            width: 36,
                            height: 36,
                            child: Container(
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.surfaceContainerHigh,
                                border: Border.fromBorderSide(BorderSide(color: AppColors.outlineVariant)),
                              ),
                              child: const Icon(Icons.directions_bus_outlined, size: 20, color: AppColors.onSurfaceVariant),
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
                // Floating controls
                Positioned(
                  right: 12,
                  bottom: 16,
                  child: Column(
                    children: [
                      FloatingIconBtn(icon: Icons.my_location_outlined, onTap: () {
                        _mapController.move(focus, 14);
                      }),
                      const SizedBox(height: 8),
                      Container(
                        decoration: BoxDecoration(
                          color: AppColors.surfaceContainerLowest,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.surfaceContainerHighest),
                        ),
                        child: Column(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.add, size: 20, color: AppColors.onSurfaceVariant),
                              onPressed: () => _mapController.move(_mapController.camera.center, _mapController.camera.zoom + 1),
                            ),
                            const Divider(height: 1),
                            IconButton(
                              icon: const Icon(Icons.remove, size: 20, color: AppColors.onSurfaceVariant),
                              onPressed: () => _mapController.move(_mapController.camera.center, _mapController.camera.zoom - 1),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Details bottom sheet
          _BusDetailsSheet(bus: selected, isAuthorized: true),
        ],
      ),
    );
  }
}

class _PulseRingPainter extends CustomPainter {
  final Color primary;
  _PulseRingPainter({required this.primary});

  @override
  void paint(Canvas canvas, Size size) {
    final c = Offset(size.width / 2, size.height / 2);
    final r = size.width / 2;
    for (var i = 0; i < 3; i++) {
      final paint = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2
        ..color = primary.withValues(alpha: 0.35 - i * 0.1);
      canvas.drawCircle(c, r - i * 4, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _BusDetailsSheet extends StatelessWidget {
  final SimBus bus;
  final bool isAuthorized;
  const _BusDetailsSheet({required this.bus, required this.isAuthorized});

  @override
  Widget build(BuildContext context) {
    final active = bus.isActive;
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(20),
        boxShadow: AppColors.shadowLevel2,
        border: Border.all(color: AppColors.surfaceContainerHigh),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        if (active)
                          const StatusChip('On Route', live: true)
                        else
                          const StatusChip('Scheduled', bg: AppColors.surfaceContainerHigh, fg: AppColors.onSurfaceVariant),
                        const SizedBox(width: 8),
                        StatusChip(bus.trafficStatus,
                            bg: bus.trafficStatus == 'On Time' ? AppColors.onTimeGreenBg : const Color(0xFFFFF3E0),
                            fg: bus.trafficStatus == 'On Time' ? AppColors.onTimeGreen : const Color(0xFFB45309)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(bus.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
                    const SizedBox(height: 2),
                    Text(
                      '${bus.route.stops.first.name} → NITER Campus',
                      style: const TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _StatTile(icon: Icons.schedule_outlined, value: active && bus.etaToCampus != null ? '${bus.etaToCampus}' : '—', label: 'Min ETA', highlight: true),
              const SizedBox(width: 8),
              _StatTile(icon: Icons.route_outlined, value: bus.distToCampus?.toStringAsFixed(1) ?? '—', label: 'Km Left'),
              const SizedBox(width: 8),
              _StatTile(icon: Icons.group_outlined, value: '${bus.occupancyPct}%', label: 'Occupied'),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _InfoRow(icon: Icons.location_on_outlined, label: 'Current', value: active ? bus.currentStop : bus.departure),
              const SizedBox(width: 16),
              _InfoRow(icon: Icons.near_me_outlined, label: 'Next', value: bus.nextStop ?? niterCampusName),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final bool highlight;
  const _StatTile({required this.icon, required this.value, required this.label, this.highlight = false});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: highlight ? AppColors.primary.withValues(alpha: 0.05) : AppColors.surfaceContainerLow,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: highlight ? AppColors.primary.withValues(alpha: 0.15) : AppColors.surfaceContainerHigh),
        ),
        child: Column(
          children: [
            Icon(icon, size: 18, color: highlight ? AppColors.primary : AppColors.secondary),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: highlight ? AppColors.primary : AppColors.onSurface),
            ),
            Text(label, style: const TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant)),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.primary),
          const SizedBox(width: 6),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant)),
                Text(
                  value,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.onSurface),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
