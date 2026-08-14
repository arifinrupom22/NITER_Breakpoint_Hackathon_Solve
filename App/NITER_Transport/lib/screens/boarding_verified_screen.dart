import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/transport_provider.dart';
import '../theme.dart';
import '../widgets/common.dart';
import 'trip_history_screen.dart';

/// Boarding Verified — success animation, trip details card, fare and
/// attendance info. Matches boarding_verification design.
class BoardingVerifiedScreen extends StatefulWidget {
  const BoardingVerifiedScreen({super.key});

  @override
  State<BoardingVerifiedScreen> createState() => _BoardingVerifiedScreenState();
}

class _BoardingVerifiedScreenState extends State<BoardingVerifiedScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _pulse = AnimationController(vsync: this, duration: const Duration(milliseconds: 2000))..repeat(reverse: true);
  late final AnimationController _entrance = AnimationController(vsync: this, duration: const Duration(milliseconds: 500))..forward();

  @override
  void dispose() {
    _pulse.dispose();
    _entrance.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tp = context.watch<TransportProvider>();
    final rec = tp.lastBoarding;

    if (rec == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Boarding'), leading: const BackButton()),
        body: const Center(child: Text('No boarding record yet.')),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Boarding Verified'), leading: const BackButton()),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          children: [
            const SizedBox(height: 12),
            // Success indicator
            FadeTransition(
              opacity: _entrance,
              child: Column(
                children: [
                  ScaleTransition(
                    scale: Tween(begin: 0.6, end: 1.0).animate(CurvedAnimation(parent: _entrance, curve: Curves.easeOutBack)),
                    child: AnimatedBuilder(
                      animation: _pulse,
                      builder: (context, _) => Container(
                        width: 128,
                        height: 128,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.successContainer,
                          border: Border.all(color: AppColors.success.withValues(alpha: 0.25), width: 4),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.success.withValues(alpha: 0.3 * (1 - _pulse.value)),
                              blurRadius: 24 + _pulse.value * 12,
                              spreadRadius: _pulse.value * 4,
                            ),
                          ],
                        ),
                        child: const Icon(Icons.check_circle, size: 72, color: AppColors.success),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text('Boarding Verified',
                      style: TextStyle(fontSize: 26, fontWeight: FontWeight.w700, color: AppColors.success)),
                  const SizedBox(height: 6),
                  const Text(
                    'Have a safe and pleasant journey to the campus.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 15, height: 1.5, color: AppColors.onSurfaceVariant),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Trip details card
            Container(
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(16),
                boxShadow: AppColors.shadowLevel2,
                border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.4)),
              ),
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(14),
                    color: AppColors.primary.withValues(alpha: 0.05),
                    child: Row(
                      children: [
                        const Icon(Icons.directions_bus_outlined, color: AppColors.primary, size: 20),
                        const SizedBox(width: 8),
                        Text('TRIP DETAILS',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 1, color: AppColors.primary.withValues(alpha: 0.9))),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.surfaceContainerHigh),
                              child: const Icon(Icons.person, color: AppColors.onSurfaceVariant, size: 26),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Student', style: TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant)),
                                Text(rec.studentName,
                                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Divider(color: AppColors.outlineVariant.withValues(alpha: 0.4)),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(child: _kv('Bus', rec.busName, icon: Icons.commute_outlined)),
                            Expanded(child: _kv('Time', _fmtTime(rec.time), icon: Icons.schedule_outlined)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            const Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Status', style: TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant)),
                                  SizedBox(height: 4),
                                  StatusChip('Verified', bg: Color(0xFFE8F5E9), fg: Color(0xFF2E7D32)),
                                ],
                              ),
                            ),
                            Expanded(child: _kv('Card', rec.card, icon: Icons.badge_outlined)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  // Additional info
                  Container(
                    padding: const EdgeInsets.all(14),
                    color: AppColors.surfaceContainerLow,
                    child: Column(
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.payments_outlined, size: 18, color: AppColors.onSurfaceVariant),
                            const SizedBox(width: 8),
                            const Expanded(
                              child: Text('Fare: Automatically calculated',
                                  style: TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant)),
                            ),
                            Text(
                              '৳ ${rec.fare.toStringAsFixed(0)}',
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.onSurface),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Row(
                          children: [
                            Icon(Icons.how_to_reg_outlined, size: 18, color: AppColors.onSurfaceVariant),
                            SizedBox(width: 8),
                            Text('Attendance: Recorded', style: TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            AppButton(
              label: 'View Ticket Details',
              icon: Icons.receipt_long_outlined,
              onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const TripHistoryScreen())),
            ),
            const SizedBox(height: 10),
            AppButton(
              label: 'Back to Dashboard',
              primary: false,
              onPressed: () => Navigator.of(context).popUntil((r) => r.isFirst),
            ),
          ],
        ),
      ),
    );
  }

  Widget _kv(String label, String value, {IconData? icon}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant)),
        const SizedBox(height: 4),
        Row(
          children: [
            if (icon != null) ...[Icon(icon, size: 15, color: AppColors.primary), const SizedBox(width: 4)],
            Flexible(
              child: Text(value,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.onSurface)),
            ),
          ],
        ),
      ],
    );
  }

  String _fmtTime(DateTime d) {
    String two(int v) => v.toString().padLeft(2, '0');
    return '${two(d.hour)}:${two(d.minute)} AM';
  }
}
