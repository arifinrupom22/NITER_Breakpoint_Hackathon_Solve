import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../data/seed_data.dart';
import '../providers/transport_provider.dart';
import '../services/simulation.dart';
import '../theme.dart';
import '../widgets/common.dart';

/// Route Details — timeline of stops with the active bus position.
/// Matches route_details_schedule design.
class RouteDetailsScreen extends StatelessWidget {
  final SimBus bus;
  const RouteDetailsScreen({super.key, required this.bus});

  @override
  Widget build(BuildContext context) {
    final tp = context.watch<TransportProvider>();
    final live = tp.simBuses[bus.id]!;
    final activeIdx = live.isActive ? live.stopIdx : -1;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('NITER Transport'), leading: const BackButton()),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            // Header
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(live.name, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
                      const SizedBox(height: 2),
                      Text(live.routeName, style: const TextStyle(fontSize: 14, color: AppColors.onSurfaceVariant)),
                    ],
                  ),
                ),
                if (live.isActive)
                  const StatusChip('On Route', live: true)
                else
                  const StatusChip('Scheduled', bg: AppColors.surfaceContainerHigh, fg: AppColors.onSurfaceVariant),
              ],
            ),
            const SizedBox(height: 16),
            // Route summary stats
            Row(
              children: [
                Expanded(child: StatCard(icon: Icons.schedule_outlined, value: live.isActive && live.etaToCampus != null ? '${live.etaToCampus} min' : '—', label: 'ETA to Campus', accent: AppColors.primary)),
                const SizedBox(width: 12),
                Expanded(child: StatCard(icon: Icons.route_outlined, value: live.distToCampus?.toStringAsFixed(1) ?? '—', label: 'Km Remaining', accent: AppColors.secondaryFixedDim)),
              ],
            ),
            const SizedBox(height: 24),
            const SectionTitle('Route Stops'),
            const SizedBox(height: 12),
            // Timeline
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(16),
                boxShadow: AppColors.shadowLevel1,
              ),
              child: _Timeline(stops: live.route.stops, activeIdx: activeIdx, arrived: live.tripStatus == 'Arrived'),
            ),
            const SizedBox(height: 16),
            // Traffic / occupancy summary
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLow,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      children: [
                        const Text('Traffic', style: TextStyle(fontSize: 12, color: AppColors.secondary)),
                        const SizedBox(height: 4),
                        Text(live.trafficStatus,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
                      ],
                    ),
                  ),
                  Container(width: 1, height: 32, color: AppColors.outlineVariant),
                  Expanded(
                    child: Column(
                      children: [
                        const Text('Occupancy', style: TextStyle(fontSize: 12, color: AppColors.secondary)),
                        const SizedBox(height: 4),
                        Text('${live.occupancyPct}%',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
                      ],
                    ),
                  ),
                  Container(width: 1, height: 32, color: AppColors.outlineVariant),
                  Expanded(
                    child: Column(
                      children: [
                        const Text('Driver', style: TextStyle(fontSize: 12, color: AppColors.secondary)),
                        const SizedBox(height: 4),
                        Text(live.seed.driverName,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Timeline extends StatelessWidget {
  final List<SeedStop> stops;
  final int activeIdx;
  final bool arrived;
  const _Timeline({required this.stops, required this.activeIdx, required this.arrived});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(stops.length, (i) {
        final isLast = i == stops.length - 1;
        final isCampus = isLast;
        final passed = arrived || (activeIdx >= 0 && i < activeIdx);
        final current = !arrived && activeIdx == i;
        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Timeline rail
              SizedBox(
                width: 28,
                child: Column(
                  children: [
                    // line above dot
                    if (i > 0)
                      Expanded(
                        child: Container(
                          width: 3,
                          color: passed || current ? AppColors.primary : AppColors.primaryFixedDim.withValues(alpha: 0.5),
                        ),
                      )
                    else
                      const Expanded(child: SizedBox()),
                    // dot
                    Container(
                      width: current ? 20 : 14,
                      height: current ? 20 : 14,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: current
                            ? AppColors.primary
                            : passed
                                ? AppColors.primary.withValues(alpha: 0.4)
                                : Colors.white,
                        border: Border.all(
                          color: current ? AppColors.primary : isCampus ? AppColors.tertiary : AppColors.primary,
                          width: current ? 5 : 3,
                        ),
                        boxShadow: current ? const [BoxShadow(color: Color(0x33003FB1), blurRadius: 8)] : null,
                      ),
                      child: current ? const Icon(Icons.directions_bus_filled, size: 12, color: Colors.white) : null,
                    ),
                    // line below dot
                    if (!isLast)
                      Expanded(
                        child: Container(
                          width: 3,
                          color: passed || current ? AppColors.primary : AppColors.primaryFixedDim.withValues(alpha: 0.5),
                        ),
                      )
                    else
                      const Expanded(child: SizedBox()),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              // Stop label
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(top: isLast ? 0 : 14, bottom: isLast ? 0 : 14),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              stops[i].name,
                              style: TextStyle(
                                fontSize: current ? 17 : 15,
                                fontWeight: current ? FontWeight.w700 : FontWeight.w600,
                                color: current ? AppColors.primary : AppColors.onSurface,
                              ),
                            ),
                            if (isCampus)
                              const Text('Destination · Nayarhat, Savar',
                                  style: TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant)),
                          ],
                        ),
                      ),
                      if (current)
                        const StatusChip('Bus Here', bg: Color(0xFFE8F5E9), fg: Color(0xFF2E7D32), live: true)
                      else if (passed && !isCampus)
                        const Icon(Icons.check_circle, size: 16, color: Color(0x66003FB1)),
                      if (isCampus)
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.tertiary),
                          child: const Icon(Icons.school, size: 14, color: Colors.white),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}
