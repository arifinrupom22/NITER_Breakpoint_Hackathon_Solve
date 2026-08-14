import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/transport_provider.dart';
import '../services/simulation.dart';
import '../theme.dart';
import '../widgets/common.dart';
import 'bus_schedule_screen.dart';
import 'driver_login_screen.dart';
import 'verify_screen.dart';

/// Home tab — hero + status cards + "Today's Service" bus list,
/// matching welcome_home + transport_overview designs.
class HomeTab extends StatelessWidget {
  const HomeTab({super.key});

  @override
  Widget build(BuildContext context) {
    final tp = context.watch<TransportProvider>();
    final buses = tp.simBuses.values.toList();

    final active = buses.where((b) => b.isActive).toList();
    int activeCount = active.length;
    final nextBus = active.isNotEmpty ? active.first : buses.first;
    // Null-safe earliest arrival — .reduce() on an empty list would throw
    // "Bad state: No element" (seen as a red error screen at startup).
    int? firstArrival;
    for (final b in buses) {
      if (b.isActive && b.etaToCampus != null) {
        final v = b.etaToCampus!;
        if (firstArrival == null || v < firstArrival) firstArrival = v;
      }
    }

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
                  _HeroCard(
                    onTrack: () => _openVerify(context),
                    onDriver: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const DriverLoginScreen())),
                  ),
                  const SizedBox(height: 16),
                  _StatusGrid(activeCount: activeCount, nextBus: nextBus, firstArrival: firstArrival),
                  const SizedBox(height: 24),
                  SectionTitle(
                    "Today's Service",
                    actionLabel: 'Schedules',
                    onAction: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const BusScheduleScreen())),
                  ),
                  const SizedBox(height: 12),
                  ...buses.map((b) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _BusServiceCard(bus: b),
                      )),
                  const SizedBox(height: 8),
                  const Center(
                    child: StatusChip('DEMO SIMULATION', bg: Color(0xFFFEF3C7), fg: Color(0xFF92400E), live: true),
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _openVerify(BuildContext context) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => const VerifyScreen()));
  }
}

class _HeroCard extends StatelessWidget {
  final VoidCallback onTrack;
  final VoidCallback onDriver;
  const _HeroCard({required this.onTrack, required this.onDriver});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppColors.shadowLevel1,
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 140,
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFFE8EEFB), Color(0xFFF6F8FD)],
              ),
            ),
            child: Stack(
              children: [
                const Positioned(
                  right: -10,
                  bottom: -20,
                  child: Icon(Icons.directions_bus_filled, size: 150, color: Color(0x1A003FB1)),
                ),
                Positioned(
                  left: 16,
                  top: 16,
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.hub_outlined, color: Colors.white, size: 22),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        'NITER Smart Mobility',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.onSurfaceVariant),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Your Campus.\nYour Bus.\nYour Journey.',
                  style: TextStyle(
                    fontSize: 26,
                    height: 1.25,
                    fontWeight: FontWeight.w700,
                    color: AppColors.onSurface,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Track NITER buses in real time, check arrival times, routes, and occupancy from one smart platform.',
                  style: TextStyle(fontSize: 15, height: 1.5, color: AppColors.onSurfaceVariant),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: AppButton(label: 'See Bus Location', icon: Icons.location_on_outlined, onPressed: onTrack),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: AppButton(label: 'Driver Login', icon: Icons.badge_outlined, onPressed: onDriver, primary: false),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusGrid extends StatelessWidget {
  final int activeCount;
  final SimBus nextBus;
  final int? firstArrival;
  const _StatusGrid({required this.activeCount, required this.nextBus, this.firstArrival});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, c) {
      const gap = 12.0;
      final w = (c.maxWidth - gap) / 2;
      return Wrap(
        spacing: gap,
        runSpacing: gap,
        children: [
          SizedBox(
            width: w,
            child: StatCard(
              icon: Icons.directions_bus_outlined,
              value: '$activeCount',
              label: 'Buses Running',
              trailing: _LiveTag(),
            ),
          ),
          SizedBox(
            width: w,
            child: StatCard(
              icon: Icons.route_outlined,
              value: '${firstArrival == null ? 0 : activeCount}',
              label: 'Active Trips',
              accent: AppColors.secondaryFixedDim,
              trailing: _LiveTag(),
            ),
          ),
          SizedBox(
            width: w,
            child: StatCard(
              icon: Icons.schedule_outlined,
              value: nextBus.departure,
              label: 'Next Bus · ${nextBus.name}',
            ),
          ),
          SizedBox(
            width: w,
            child: StatCard(
              icon: Icons.flag_outlined,
              value: firstArrival == null ? '—' : '$firstArrival min',
              label: 'First Arrival',
              accent: AppColors.tertiaryFixedDim,
            ),
          ),
        ],
      );
    });
  }
}

class _LiveTag extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return const StatusChip('Live', bg: Color(0xFFE8F5E9), fg: Color(0xFF2E7D32), live: true);
  }
}

class _BusServiceCard extends StatelessWidget {
  final SimBus bus;
  const _BusServiceCard({required this.bus});

  @override
  Widget build(BuildContext context) {
    final active = bus.isActive;
    final accent = active ? AppColors.primary : AppColors.outlineVariant;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppColors.shadowLevel1,
        border: Border(left: BorderSide(color: accent, width: 4)),
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
                    Text(bus.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.directions_outlined, size: 16, color: AppColors.onSurfaceVariant),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            '${bus.route.stops.first.name} → NITER Campus',
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 14, color: AppColors.onSurfaceVariant),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              if (active)
                const StatusChip('On Route', live: true)
              else
                const StatusChip('Scheduled', bg: AppColors.surfaceContainerHigh, fg: AppColors.onSurfaceVariant),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerLow,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                _miniStat('Departure', bus.departure, dark: true),
                _divider(),
                _miniStat('ETA', active && bus.etaToCampus != null ? '${bus.etaToCampus} min' : '—',
                    highlight: active),
                _divider(),
                _miniStat('Occupied', '${bus.occupancyPct}%', dark: true),
              ],
            ),
          ),
          const SizedBox(height: 12),
          AppButton(
            label: active ? 'Track Bus' : 'View Schedule',
            icon: active ? Icons.location_on_outlined : Icons.schedule_outlined,
            primary: active,
            subtle: !active,
            onPressed: active
                ? () => _openMap(context)
                : () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const BusScheduleScreen())),
          ),
        ],
      ),
    );
  }

  void _openMap(BuildContext context) {
    Navigator.of(context).pushNamed('/map', arguments: bus.id);
  }

  Widget _divider() => Container(width: 1, height: 28, color: AppColors.outlineVariant.withValues(alpha: 0.5), margin: const EdgeInsets.symmetric(horizontal: 8));

  Widget _miniStat(String label, String value, {bool highlight = false, bool dark = false}) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.secondary)),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: highlight ? AppColors.primary : AppColors.onSurface,
            ),
          ),
        ],
      ),
    );
  }
}
