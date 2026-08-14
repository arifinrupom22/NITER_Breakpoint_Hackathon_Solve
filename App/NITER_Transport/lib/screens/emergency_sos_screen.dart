import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../providers/transport_provider.dart';
import '../theme.dart';
import '../widgets/common.dart';

/// Emergency SOS — hold the button to send an SOS with your location to the
/// transport authority. Matches emergency_sos design.
class EmergencySosScreen extends StatefulWidget {
  const EmergencySosScreen({super.key});

  @override
  State<EmergencySosScreen> createState() => _EmergencySosScreenState();
}

class _EmergencySosScreenState extends State<EmergencySosScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _hold =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 1500));
  Timer? _timer;
  bool _sent = false;

  @override
  void dispose() {
    _timer?.cancel();
    _hold.dispose();
    super.dispose();
  }

  void _startHold() {
    _hold.value = 0;
    _timer = Timer.periodic(const Duration(milliseconds: 30), (_) {
      if (_hold.value >= 1) {
        _timer?.cancel();
        _send();
      } else {
        _hold.value += 0.02;
      }
    });
  }

  void _cancelHold() {
    _timer?.cancel();
    _hold.value = 0;
  }

  void _send() {
    context.read<TransportProvider>().triggerEmergency('SOS');
    setState(() => _sent = true);
    HapticFeedback.mediumImpact();
  }

  @override
  Widget build(BuildContext context) {
    final tp = context.watch<TransportProvider>();
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('NITER Transport'), leading: const BackButton()),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
          children: [
            const Row(
              children: [
                Icon(Icons.warning_amber_rounded, color: AppColors.error, size: 26),
                SizedBox(width: 10),
                Expanded(
                  child: Text('Emergency Assistance',
                      style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.error)),
                ),
              ],
            ),
            const SizedBox(height: 6),
            const Text(
              'Select the type of assistance you need. Your current location will be automatically shared with the transport authority for rapid response.',
              style: TextStyle(fontSize: 15, height: 1.5, color: AppColors.onSurfaceVariant),
            ),
            const SizedBox(height: 28),
            // SOS button with progress ring
            Center(
              child: SizedBox(
                width: 170,
                height: 170,
                child: GestureDetector(
                  onLongPressStart: (_) => _startHold(),
                  onLongPressEnd: (_) => _cancelHold(),
                  onLongPressCancel: _cancelHold,
                  child: AnimatedBuilder(
                    animation: _hold,
                    builder: (context, _) => CustomPaint(
                      painter: _SosRingPainter(progress: _hold.value, sent: _sent),
                      child: Center(
                        child: AnimatedScale(
                          scale: _hold.value > 0 ? 0.94 : 1,
                          duration: const Duration(milliseconds: 100),
                          child: Container(
                            width: 128,
                            height: 128,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.error,
                              boxShadow: [BoxShadow(color: Color(0x40BA1A1A), blurRadius: 32, offset: Offset(0, 12))],
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(_sent ? Icons.check : Icons.sos, size: 44, color: Colors.white),
                                const SizedBox(height: 4),
                                Text(
                                  _sent ? 'Sent' : 'HOLD',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 2,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            if (_sent) ...[
              const SizedBox(height: 20),
              const Center(
                child: StatusChip('SIGNAL SENT · AUTHORITY NOTIFIED', bg: Color(0xFFE8F5E9), fg: Color(0xFF2E7D32)),
              ),
            ],
            const SizedBox(height: 32),
            const SectionTitle('Quick Actions'),
            const SizedBox(height: 12),
            // Primary action
            Material(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(16),
              child: InkWell(
                onTap: () => _quick('Contact Transport Authority'),
                borderRadius: BorderRadius.circular(16),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0x33FFFFFF)),
                        child: const Icon(Icons.support_agent, color: Colors.white, size: 24),
                      ),
                      const SizedBox(width: 14),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Contact Transport Authority',
                                style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: Colors.white)),
                            Text('Immediate central dispatch', style: TextStyle(fontSize: 13, color: Color(0xCCFFFFFF))),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right, color: Color(0x80FFFFFF)),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _QuickTile(icon: Icons.directions_bus_outlined, label: 'Contact Bus Driver', onTap: () => _quick('Contact Bus Driver')),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _QuickTile(
                      icon: Icons.car_crash_outlined, label: 'Report Accident', danger: true, onTap: () => _quick('Report Accident')),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _QuickTile(
                      icon: Icons.medical_services_outlined, label: 'Medical Emergency', danger: true, onTap: () => _quick('Medical Emergency')),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _QuickTile(icon: Icons.local_police_outlined, label: 'Security Issue', onTap: () => _quick('Security Issue')),
                ),
              ],
            ),
            const SizedBox(height: 24),
            const SectionTitle('Current Location'),
            const SizedBox(height: 12),
            // Location card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(16),
                boxShadow: AppColors.shadowLevel1,
                border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.5)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.my_location, color: AppColors.primary, size: 20),
                      SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('NITER Main Campus, North Gate',
                                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.onSurface)),
                            Text('Lat: 23.8470, Lng: 90.2760 · Nayarhat, Savar',
                                style: TextStyle(fontSize: 12.5, color: AppColors.onSurfaceVariant)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Simulated map block
                  Container(
                    height: 110,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainerLow,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.4)),
                    ),
                    child: const Center(
                      child: Icon(Icons.map_outlined, size: 40, color: Color(0x33003FB1)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  AppButton(
                    label: 'Send Location to Authority',
                    icon: Icons.near_me_outlined,
                    subtle: true,
                    onPressed: () {
                      tp.triggerEmergency('Location Share');
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Location shared with transport authority.')),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            if (tp.activeEmergency != null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.errorContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.emergency, color: AppColors.error, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Active emergency: ${tp.activeEmergency}',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.onErrorContainer),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 18, color: AppColors.error),
                      onPressed: () => tp.clearEmergency(),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _quick(String type) {
    context.read<TransportProvider>().triggerEmergency(type);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$type — request sent to authority.')),
    );
  }
}

class _SosRingPainter extends CustomPainter {
  final double progress;
  final bool sent;
  _SosRingPainter({required this.progress, required this.sent});

  @override
  void paint(Canvas canvas, Size size) {
    final c = Offset(size.width / 2, size.height / 2);
    final r = size.width / 2 - 6;
    // decorative rings
    for (var i = 0; i < 2; i++) {
      final rr = r * (0.7 + i * 0.22);
      canvas.drawCircle(
        c,
        rr,
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2
          ..color = AppColors.error.withValues(alpha: 0.25 - i * 0.08),
      );
    }
    // progress ring
    canvas.drawCircle(
      c,
      r,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 6
        ..color = AppColors.errorContainer.withValues(alpha: 0.5),
    );
    final sweep = (sent ? 1.0 : progress) * 2 * 3.14159;
    canvas.drawArc(
      Rect.fromCircle(center: c, radius: r),
      -3.14159 / 2,
      sweep,
      false,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 6
        ..strokeCap = StrokeCap.round
        ..color = sent ? AppColors.success : AppColors.error,
    );
  }

  @override
  bool shouldRepaint(covariant _SosRingPainter oldDelegate) =>
      oldDelegate.progress != progress || oldDelegate.sent != sent;
}

class _QuickTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool danger;
  const _QuickTile({required this.icon, required this.label, required this.onTap, this.danger = false});

  @override
  Widget build(BuildContext context) {
    final fg = danger ? AppColors.error : AppColors.primary;
    return Material(
      color: AppColors.surfaceContainerLowest,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            boxShadow: AppColors.shadowLevel1,
            border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.4)),
          ),
          child: Column(
            children: [
              Icon(icon, size: 30, color: fg),
              const SizedBox(height: 8),
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.onSurface),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
