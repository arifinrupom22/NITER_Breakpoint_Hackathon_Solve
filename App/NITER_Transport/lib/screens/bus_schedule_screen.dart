import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/transport_provider.dart';
import '../services/simulation.dart';
import '../theme.dart';
import '../widgets/common.dart';
import 'route_details_screen.dart';

/// Bus Schedules — search, Student/Teacher tabs, route cards with departure,
/// frequency, status and actions. Matches bus_schedule design.
class BusScheduleScreen extends StatefulWidget {
  const BusScheduleScreen({super.key});

  @override
  State<BusScheduleScreen> createState() => _BusScheduleScreenState();
}

class _BusScheduleScreenState extends State<BusScheduleScreen> {
  bool _teacher = false;

  @override
  Widget build(BuildContext context) {
    final tp = context.watch<TransportProvider>();
    final buses = tp.simBuses.values
        .where((b) => _teacher ? b.type == 'Teacher' : b.type == 'Student')
        .toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('NITER Transport'), leading: const BackButton()),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            const Text('Bus Schedules', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
            const SizedBox(height: 16),
            // Search
            TextField(
              decoration: const InputDecoration(
                hintText: 'Search routes, stops, or bus numbers...',
                prefixIcon: Icon(Icons.search),
              ),
              onChanged: (q) => setState(() {}),
            ),
            const SizedBox(height: 16),
            // Segmented tabs
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLow,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.5)),
              ),
              child: Row(
                children: [
                  Expanded(child: _segBtn('Student Buses', !_teacher, () => setState(() => _teacher = false))),
                  Expanded(child: _segBtn('Teacher Buses', _teacher, () => setState(() => _teacher = true))),
                ],
              ),
            ),
            const SizedBox(height: 20),
            ...buses.map((b) => Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: _ScheduleCard(bus: b),
                )),
          ],
        ),
      ),
    );
  }

  Widget _segBtn(String label, bool selected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: selected ? AppColors.surfaceContainerLowest : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          boxShadow: selected ? AppColors.shadowLevel1 : null,
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: selected ? AppColors.primary : AppColors.onSurfaceVariant,
          ),
        ),
      ),
    );
  }
}

class _ScheduleCard extends StatelessWidget {
  final SimBus bus;
  const _ScheduleCard({required this.bus});

  @override
  Widget build(BuildContext context) {
    final active = bus.isActive;
    final status = active ? 'On Time' : bus.tripStatus == 'Arrived' ? 'Arrived' : 'Scheduled';
    final statusColor = active ? AppColors.onTimeGreen : AppColors.onSurfaceVariant;
    final statusBg = active ? AppColors.onTimeGreenBg : AppColors.surfaceContainerHigh;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppColors.shadowLevel1,
        border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.4)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(height: 4, color: active ? AppColors.primary : AppColors.outlineVariant),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                            decoration: BoxDecoration(
                              color: active ? AppColors.primaryContainer : AppColors.surfaceVariant,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              bus.type == 'Student' ? 'Student Route' : 'Teacher Route',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: active ? AppColors.onPrimaryContainer : AppColors.onSurfaceVariant,
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(bus.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
                          const SizedBox(height: 2),
                          Text(
                            '${bus.route.stops.first.name} → NITER Campus',
                            style: const TextStyle(fontSize: 14, color: AppColors.onSurfaceVariant),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(bus.departure, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w700, color: AppColors.primary)),
                        const Text('AM Departure', style: TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    const Icon(Icons.update_outlined, size: 16, color: AppColors.outline),
                    const SizedBox(width: 4),
                    const Text('Daily · Morning trip', style: TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant)),
                    const Spacer(),
                    StatusChip(status, bg: statusBg, fg: statusColor, live: active),
                  ],
                ),
                const SizedBox(height: 14),
                Divider(color: AppColors.outlineVariant.withValues(alpha: 0.4)),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: AppButton(
                        label: 'View Stops',
                        primary: false,
                        fullWidth: true,
                        onPressed: () => Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => RouteDetailsScreen(bus: bus)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: AppButton(
                        label: active ? 'Track Live' : 'Schedule',
                        icon: active ? Icons.location_on_outlined : Icons.schedule_outlined,
                        primary: active,
                        subtle: !active,
                        fullWidth: true,
                        onPressed: () => Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => RouteDetailsScreen(bus: bus)),
                        ),
                      ),
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
