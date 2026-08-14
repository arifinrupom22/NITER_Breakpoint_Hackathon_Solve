import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/transport_provider.dart';
import '../services/simulation.dart';
import '../theme.dart';
import '../widgets/common.dart';
import 'trip_start_screen.dart';

/// Driver route selection — the driver can only operate their assigned bus.
class RouteSelectionScreen extends StatelessWidget {
  const RouteSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final tp = context.watch<TransportProvider>();
    final user = tp.user;
    if (user?.role != 'driver') {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    final assignedBus = tp.simBuses[user!.busId]!;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Select Assigned Route'),
        leading: const BackButton(),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                children: [
                  const Text(
                    'Choose Your Route',
                    style: TextStyle(fontSize: 26, fontWeight: FontWeight.w700, color: AppColors.onSurface),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Please select your route for this shift to activate live tracking.',
                    style: TextStyle(fontSize: 15, color: AppColors.onSurfaceVariant),
                  ),
                  const SizedBox(height: 20),
                  const SectionTitle('Your Assigned Bus', icon: Icons.directions_bus_outlined),
                  const SizedBox(height: 12),
                  _RouteCard(bus: assignedBus, selected: true, locked: false, onTap: () {}),
                  const SizedBox(height: 20),
                  const SectionTitle('Other Buses (Unauthorized)', icon: Icons.lock_outline, color: AppColors.onSurfaceVariant),
                  const SizedBox(height: 12),
                  ...tp.simBuses.values
                      .where((b) => b.id != assignedBus.id)
                      .map((b) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: _RouteCard(bus: b, selected: false, locked: true, onTap: () {}),
                          )),
                ],
              ),
            ),
            // Bottom action bar
            Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
              decoration: BoxDecoration(
                color: AppColors.surface.withValues(alpha: 0.92),
                border: const Border(top: BorderSide(color: Color(0x4DC3C5D7))),
              ),
              child: SafeArea(
                top: false,
                child: Row(
                  children: [
                    Expanded(
                      child: AppButton(
                        label: 'Cancel',
                        primary: false,
                        fullWidth: true,
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: AppButton(
                        label: 'Confirm Route',
                        icon: Icons.arrow_forward,
                        onPressed: () => Navigator.of(context).pushReplacement(
                          MaterialPageRoute(builder: (_) => TripStartScreen(bus: assignedBus)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RouteCard extends StatelessWidget {
  final SimBus bus;
  final bool selected;
  final bool locked;
  final VoidCallback onTap;
  const _RouteCard({required this.bus, required this.selected, required this.locked, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final active = bus.isActive;
    return Opacity(
      opacity: locked ? 0.55 : 1,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerLowest,
          borderRadius: BorderRadius.circular(16),
          boxShadow: AppColors.shadowLevel1,
          border: Border.all(
            color: selected ? AppColors.primary : Colors.transparent,
            width: 2,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: selected ? AppColors.primary : AppColors.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    locked ? Icons.lock_outline : Icons.directions_bus_filled,
                    color: selected ? Colors.white : AppColors.onSurfaceVariant,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(bus.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          const Icon(Icons.route_outlined, size: 15, color: AppColors.secondary),
                          const SizedBox(width: 4),
                          Text(bus.routeName, style: const TextStyle(fontSize: 14, color: AppColors.secondary)),
                        ],
                      ),
                    ],
                  ),
                ),
                if (selected)
                  const Icon(Icons.check_circle, color: AppColors.primary, size: 22)
                else if (locked)
                  const Icon(Icons.lock_outline, color: AppColors.outline, size: 20),
              ],
            ),
            const SizedBox(height: 12),
            Divider(color: AppColors.outlineVariant.withValues(alpha: 0.4)),
            const SizedBox(height: 10),
            Row(
              children: [
                _kv('Departure', bus.departure),
                const SizedBox(width: 24),
                _kv('Status', active ? 'Active' : 'Idle'),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(
                    color: bus.type == 'Student' ? AppColors.tertiaryContainer : AppColors.secondaryContainer,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    bus.type,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: bus.type == 'Student' ? AppColors.onTertiaryContainer : AppColors.onSecondaryContainer,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _kv(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.secondary)),
        Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
      ],
    );
  }
}
