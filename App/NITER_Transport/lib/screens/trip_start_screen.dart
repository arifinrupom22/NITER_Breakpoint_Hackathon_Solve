import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../data/seed_data.dart';
import '../providers/transport_provider.dart';
import '../services/simulation.dart';
import '../theme.dart';
import '../widgets/common.dart';
import 'driver_dashboard_screen.dart';

/// Trip Start — "Ready to Start" state with START TRIP, then the live
/// "Trip Active" radar state with END TRIP. Matches trip_start_confirmation.
class TripStartScreen extends StatefulWidget {
  final SimBus bus;
  const TripStartScreen({super.key, required this.bus});

  @override
  State<TripStartScreen> createState() => _TripStartScreenState();
}

class _TripStartScreenState extends State<TripStartScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _radar =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 2000))..repeat();

  @override
  void dispose() {
    _radar.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tp = context.watch<TransportProvider>();
    final bus = tp.simBuses[widget.bus.id]!;
    final active = bus.isActive;
    final arrived = bus.tripStatus == 'Arrived';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('NITER Transport'),
        leading: BackButton(onPressed: () => Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (_) => const DriverDashboardScreen()),
              (r) => false,
            )),
      ),
      body: SafeArea(
        child: active || arrived ? _ActiveState(bus: bus, radar: _radar) : _SetupState(bus: bus),
      ),
    );
  }
}

class _SetupState extends StatelessWidget {
  final SimBus bus;
  const _SetupState({required this.bus});

  @override
  Widget build(BuildContext context) {
    final tp = context.read<TransportProvider>();
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Ready to Start',
              style: TextStyle(fontSize: 26, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
          const SizedBox(height: 4),
          const Text('Review your trip details before departing.',
              style: TextStyle(fontSize: 15, color: AppColors.onSurfaceVariant)),
          const SizedBox(height: 20),
          // Route details card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerLowest,
              borderRadius: BorderRadius.circular(16),
              boxShadow: AppColors.shadowLevel1,
              border: const Border(left: BorderSide(color: AppColors.primary, width: 4)),
            ),
            child: Column(
              children: [
                _DetailRow(icon: Icons.directions_bus_filled, iconBg: AppColors.primaryContainer, label: 'SELECTED BUS', value: bus.name),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Divider(color: AppColors.outlineVariant.withValues(alpha: 0.4)),
                ),
                _DetailRow(icon: Icons.route_outlined, iconBg: AppColors.secondaryContainer, label: 'SELECTED ROUTE', value: bus.routeName),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // GPS status
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerLowest,
              borderRadius: BorderRadius.circular(14),
              boxShadow: AppColors.shadowLevel1,
            ),
            child: const Row(
              children: [
                Icon(Icons.my_location_outlined, color: AppColors.outline),
                SizedBox(width: 10),
                Expanded(child: Text('GPS Status', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.onSurfaceVariant))),
                StatusChip('Ready', bg: Color(0xFFE8F5E9), fg: Color(0xFF2E7D32)),
              ],
            ),
          ),
          const Spacer(),
          const SizedBox(height: 16),
          AppButton(
            label: 'START TRIP',
            icon: Icons.play_circle_outline,
            onPressed: () {
              tp.startTrip(bus.id);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Trip started — GPS broadcasting live.')),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final Color iconBg;
  final String label;
  final String value;
  const _DetailRow({required this.icon, required this.iconBg, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, size: 24, color: AppColors.onPrimaryContainer),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 11, letterSpacing: 0.8, fontWeight: FontWeight.w600, color: AppColors.onSurfaceVariant)),
            const SizedBox(height: 2),
            Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
          ],
        ),
      ],
    );
  }
}

class _ActiveState extends StatelessWidget {
  final SimBus bus;
  final AnimationController radar;
  const _ActiveState({required this.bus, required this.radar});

  @override
  Widget build(BuildContext context) {
    final tp = context.read<TransportProvider>();
    final arrived = bus.tripStatus == 'Arrived';
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          const Spacer(),
          // Pulsing radar indicator
          SizedBox(
            width: 130,
            height: 130,
            child: AnimatedBuilder(
              animation: radar,
              builder: (context, _) => CustomPaint(
                painter: _RadarPainter(t: radar.value),
                child: Center(
                  child: Container(
                    width: 64,
                    height: 64,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.primary,
                      boxShadow: [BoxShadow(color: Color(0x66003FB1), blurRadius: 20, offset: Offset(0, 4))],
                    ),
                    child: Icon(arrived ? Icons.flag : Icons.satellite_alt, color: Colors.white, size: 32),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            arrived ? 'Trip Completed' : 'Trip Active',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 34, fontWeight: FontWeight.w700, color: AppColors.primary, letterSpacing: -0.01),
          ),
          const SizedBox(height: 8),
          Text(
            arrived
                ? 'Arrived at NITER Campus. Tap END TRIP to finalize.'
                : 'Live location is being shared with students and the website.',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 17, color: AppColors.onSurfaceVariant),
          ),
          const SizedBox(height: 24),
          // Active details
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerLowest,
              borderRadius: BorderRadius.circular(16),
              boxShadow: AppColors.shadowLevel1,
              border: Border.all(color: AppColors.surfaceVariant),
            ),
            child: Column(
              children: [
                _kvRow('Current Route', '${bus.route.stops.first.name} → NITER Campus'),
                Divider(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                _kvRow('Current Stop', bus.currentStop),
                Divider(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                _kvRow('Next Stop', bus.nextStop ?? niterCampusName),
                Divider(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                _kvRow('Bus ID', bus.id),
                Divider(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                _kvRow('Passengers', '${bus.passengers}/${bus.capacity} · ${bus.occupancyPct}%'),
                Divider(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                _kvRow('Status', arrived ? 'Arrived' : 'Broadcasting', green: true, live: !arrived),
              ],
            ),
          ),
          const Spacer(),
          AppButton(
            label: 'END TRIP',
            icon: Icons.stop_circle_outlined,
            onPressed: () {
              tp.endTrip(bus.id);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Trip completed — GPS off, trip saved.')),
              );
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const DriverDashboardScreen()),
                (r) => false,
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _kvRow(String label, String value, {bool green = false, bool live = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.outline)),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (live) ...[
                const StatusChip('GPS ON', bg: Color(0xFFE8F5E9), fg: Color(0xFF2E7D32), live: true),
                const SizedBox(width: 8),
              ],
              Text(
                value,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: green ? const Color(0xFF2E7D32) : AppColors.onSurface,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RadarPainter extends CustomPainter {
  final double t;
  _RadarPainter({required this.t});

  @override
  void paint(Canvas canvas, Size size) {
    final c = Offset(size.width / 2, size.height / 2);
    final maxR = size.width / 2;
    for (var i = 0; i < 2; i++) {
      final phase = (t + i * 0.5) % 1.0;
      final r = maxR * (0.5 + phase * 0.5);
      final paint = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3
        ..color = AppColors.primary.withValues(alpha: (1 - phase) * 0.4);
      canvas.drawCircle(c, r, paint);
    }
    // sweep
    final sweep = t * 2 * 3.14159;
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round
      ..color = AppColors.primary.withValues(alpha: 0.7);
    canvas.drawArc(Rect.fromCircle(center: c, radius: maxR * 0.95), -3.14159 / 2, sweep, false, paint);
  }

  @override
  bool shouldRepaint(covariant _RadarPainter oldDelegate) => oldDelegate.t != t;
}
