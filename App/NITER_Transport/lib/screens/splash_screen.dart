import 'dart:async';

import 'package:flutter/material.dart';

import '../theme.dart';

/// Splash screen — Professional Blue background with dotted transport
/// pattern, pulsing logo ring and animated loading dots.
class SplashScreen extends StatefulWidget {
  final VoidCallback onDone;
  const SplashScreen({super.key, required this.onDone});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _pulse =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 2600))..repeat(reverse: true);
  Timer? _navTimer;

  @override
  void initState() {
    super.initState();
    _navTimer = Timer(const Duration(milliseconds: 2600), widget.onDone);
  }

  @override
  void dispose() {
    _navTimer?.cancel();
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryContainer,
      body: Stack(
        children: [
          // Dotted transport pattern.
          Positioned.fill(
            child: CustomPaint(painter: _DotPatternPainter(color: Colors.white.withValues(alpha: 0.1))),
          ),
          // Subtle bottom gradient for depth.
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, AppColors.primary.withValues(alpha: 0.8)],
                ),
              ),
            ),
          ),
          SafeArea(
            child: Column(
              children: [
                Expanded(
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // Logo ring
                          ScaleTransition(
                            scale: Tween(begin: 0.96, end: 1.04).animate(_pulse),
                            child: Container(
                              width: 128,
                              height: 128,
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.surfaceContainerLowest.withValues(alpha: 0.12),
                                border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                                boxShadow: const [BoxShadow(color: Color(0x1A000000), blurRadius: 32, offset: Offset(0, 12))],
                              ),
                              child: Container(
                                decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFFF2F6FF)),
                                child: const Icon(Icons.directions_bus_filled, size: 64, color: AppColors.primary),
                              ),
                            ),
                          ),
                          const SizedBox(height: 32),
                          const Text(
                            'NITER Transport',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 40,
                              height: 1.15,
                              fontWeight: FontWeight.w700,
                              letterSpacing: -0.02,
                              color: AppColors.onPrimary,
                              shadows: [Shadow(color: Color(0x33000000), blurRadius: 8, offset: Offset(0, 2))],
                            ),
                          ),
                          const SizedBox(height: 10),
                          const Text(
                            'Smart Campus Transportation',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 18,
                              fontWeight: FontWeight.w500,
                              color: Color(0xE6D4DCFF),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                // Loading indicator area
                Padding(
                  padding: const EdgeInsets.only(bottom: 48),
                  child: Column(
                    children: [
                      const _LoadingDots(),
                      const SizedBox(height: 16),
                      Text(
                        'INITIALIZING SYSTEM',
                        style: TextStyle(
                          fontSize: 12,
                          letterSpacing: 2,
                          fontWeight: FontWeight.w600,
                          color: AppColors.onPrimary.withValues(alpha: 0.6),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _LoadingDots extends StatefulWidget {
  const _LoadingDots();

  @override
  State<_LoadingDots> createState() => _LoadingDotsState();
}

class _LoadingDotsState extends State<_LoadingDots> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))..repeat();

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _c,
      builder: (context, _) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (i) {
            final phase = (_c.value + i * 0.33) % 1.0;
            final t = (phase * 3).clamp(0.0, 1.0);
            final scale = 0.8 + 0.4 * (1 - (t - 0.5).abs() * 2);
            final opacity = 0.3 + 0.7 * (1 - (t - 0.5).abs() * 2);
            return Container(
              width: 8,
              height: 8,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              transform: Matrix4.identity()..scaleByDouble(scale, scale, scale, 1),
              decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.onPrimary.withValues(alpha: opacity)),
            );
          }),
        );
      },
    );
  }
}

class _DotPatternPainter extends CustomPainter {
  final Color color;
  _DotPatternPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color;
    const gap = 32.0;
    for (double x = 0; x < size.width; x += gap) {
      for (double y = 0; y < size.height; y += gap) {
        canvas.drawCircle(Offset(x + gap / 2, y + gap / 2), 1.2, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _DotPatternPainter oldDelegate) => oldDelegate.color != color;
}
