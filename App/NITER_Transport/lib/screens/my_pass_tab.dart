import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../providers/transport_provider.dart';
import '../theme.dart';
import '../widgets/common.dart';
import 'boarding_verified_screen.dart';
import 'verify_screen.dart';

/// Digital Smart Bus Pass — student photo placeholder, name, ID, department,
/// batch, Bus Card No, QR, validity. Matches the digital_bus_pass design.
class MyPassTab extends StatelessWidget {
  const MyPassTab({super.key});

  @override
  Widget build(BuildContext context) {
    final tp = context.watch<TransportProvider>();
    final user = tp.user;
    final isStudent = user?.role == 'transport-student';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            const NiterHeader(title: 'NITER Transport'),
            Expanded(
              child: isStudent
                  ? _PassView(name: user!.name!, card: user.card!, id: user.id ?? '—')
                  : _PassGate(
                      onVerify: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const VerifyScreen())),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PassGate extends StatelessWidget {
  final VoidCallback onVerify;
  const _PassGate({required this.onVerify});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFFEFF6FF)),
              child: const Icon(Icons.qr_code_2, size: 36, color: AppColors.primary),
            ),
            const SizedBox(height: 16),
            const Text('Your Digital Bus Pass',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
            const SizedBox(height: 8),
            const Text(
              'Verify as a NITER student to view your Smart Bus Pass with QR.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 15, height: 1.5, color: AppColors.onSurfaceVariant),
            ),
            const SizedBox(height: 20),
            AppButton(label: 'Verify to View Pass', icon: Icons.verified_user_outlined, onPressed: onVerify),
          ],
        ),
      ),
    );
  }
}

class _PassView extends StatefulWidget {
  final String name;
  final String card;
  final String id;
  const _PassView({required this.name, required this.card, required this.id});

  @override
  State<_PassView> createState() => _PassViewState();
}

class _PassViewState extends State<_PassView> with SingleTickerProviderStateMixin {
  late final AnimationController _radar = AnimationController(vsync: this, duration: const Duration(seconds: 4))..repeat();
  final _dept = 'CSE';
  final _batch = 'CSE-23';
  final _validity = 'Valid until Dec 2026';

  @override
  void dispose() {
    _radar.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tp = context.read<TransportProvider>();
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      children: [
        Center(
          child: Container(
            width: double.infinity,
            constraints: const BoxConstraints(maxWidth: 420),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.85),
              borderRadius: BorderRadius.circular(16),
              boxShadow: AppColors.shadowLevel2,
              border: Border.all(color: Colors.white.withValues(alpha: 0.9)),
            ),
            child: Column(
              children: [
                // Header
                Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(10)),
                      child: const Icon(Icons.directions_bus_filled, color: Colors.white, size: 22),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('OFFICIAL TRANSIT PASS',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 0.8, color: AppColors.primary)),
                          Text('NITER Smart Campus', style: TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant)),
                        ],
                      ),
                    ),
                    const StatusChip('Active', live: true),
                  ],
                ),
                const SizedBox(height: 20),
                // QR with animated security ring
                SizedBox(
                  width: 200,
                  height: 200,
                  child: AnimatedBuilder(
                    animation: _radar,
                    builder: (context, child) => CustomPaint(
                      painter: _SecurityRingPainter(progress: _radar.value, color: AppColors.primary),
                      child: child,
                    ),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceContainerLowest,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.outlineVariant),
                      ),
                      child: QrImageView(
                        data: 'NITER|${widget.card}|${widget.name}|${widget.id}|${DateTime.now().year}',
                        version: QrVersions.auto,
                        size: 160,
                        eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: AppColors.primary),
                        dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: AppColors.onSurface),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.qr_code_scanner_outlined, size: 16, color: AppColors.primary),
                    SizedBox(width: 6),
                    Text('Scan to Board', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary)),
                  ],
                ),
                const SizedBox(height: 16),
                // Student info
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerLow,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.5)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('PASSENGER NAME', style: _labelStyle()),
                      const SizedBox(height: 2),
                      Text(widget.name, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
                      Text('ID: ${widget.id}', style: const TextStyle(fontSize: 12, color: AppColors.outline)),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(child: _kv('BUS CARD NO', widget.card)),
                          Expanded(child: _kv('DEPARTMENT', _dept)),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(child: _kv('BATCH', _batch)),
                          Expanded(child: _kv('VALIDITY', _validity)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                AppButton(
                  label: 'Simulate Boarding (QR Tap)',
                  icon: Icons.qr_code_scanner_outlined,
                  onPressed: () {
                    final rec = tp.board();
                    if (rec == null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('No active trip on your route yet. Start a driver trip first.')),
                      );
                      return;
                    }
                    Navigator.of(context).push(MaterialPageRoute(builder: (_) => const BoardingVerifiedScreen()));
                  },
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  TextStyle _labelStyle() => const TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant, letterSpacing: 0.6, fontWeight: FontWeight.w600);

  Widget _kv(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: _labelStyle()),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
      ],
    );
  }
}

class _SecurityRingPainter extends CustomPainter {
  final double progress;
  final Color color;
  _SecurityRingPainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final rrect = RRect.fromRectAndRadius(rect.deflate(2), const Radius.circular(20));
    final sweep = progress * 2 * 3.14159;
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;
    // faint full ring
    paint.color = color.withValues(alpha: 0.15);
    canvas.drawRRect(rrect, paint);
    // sweeping arc
    paint.color = color.withValues(alpha: 0.6);
    canvas.drawArc(rrect.deflate(0).outerRect,
        -3.14159 / 2, sweep, false, paint);
  }

  @override
  bool shouldRepaint(covariant _SecurityRingPainter oldDelegate) => oldDelegate.progress != progress;
}
