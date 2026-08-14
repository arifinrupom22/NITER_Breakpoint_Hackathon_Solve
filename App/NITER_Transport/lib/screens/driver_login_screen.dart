import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/transport_provider.dart';
import '../theme.dart';
import '../widgets/common.dart';
import 'driver_dashboard_screen.dart';

/// Driver Portal — Driver ID + password. Only authorized driver-route
/// combinations are allowed (four demo drivers, each one assigned bus).
class DriverLoginScreen extends StatefulWidget {
  const DriverLoginScreen({super.key});

  @override
  State<DriverLoginScreen> createState() => _DriverLoginScreenState();
}

class _DriverLoginScreenState extends State<DriverLoginScreen> {
  final _idCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _obscure = true;
  bool _loading = false;

  @override
  void dispose() {
    _idCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final tp = context.read<TransportProvider>();
    setState(() => _loading = true);
    await Future.delayed(const Duration(milliseconds: 500));
    setState(() => _loading = false);

    final ok = tp.driverLogin(_idCtrl.text, _passCtrl.text);
    if (!mounted) return;
    if (ok) {
      Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const DriverDashboardScreen()));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid driver ID or password.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 420),
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(16),
                boxShadow: AppColors.shadowLevel2,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Center(
                    child: Column(
                      children: [
                        SizedBox(
                          width: 88,
                          height: 88,
                          child: DecoratedBox(
                            decoration: BoxDecoration(shape: BoxShape.circle, color: Color(0xFFF2F6FF)),
                            child: Icon(Icons.directions_bus_filled, size: 44, color: AppColors.primary),
                          ),
                        ),
                        SizedBox(height: 16),
                        Text('Driver Portal', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
                        SizedBox(height: 4),
                        Text('NITER Transport Operations', style: TextStyle(fontSize: 15, color: AppColors.onSurfaceVariant)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),
                  TextField(
                    controller: _idCtrl,
                    textCapitalization: TextCapitalization.characters,
                    decoration: const InputDecoration(
                      labelText: 'Driver ID',
                      hintText: 'e.g. DRV1',
                      prefixIcon: Icon(Icons.badge_outlined),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _passCtrl,
                    obscureText: _obscure,
                    onSubmitted: (_) => _submit(),
                    decoration: InputDecoration(
                      labelText: 'Password',
                      hintText: '••••••••',
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        icon: Icon(_obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined),
                        onPressed: () => setState(() => _obscure = !_obscure),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Expanded(
                        child: Text('Remember terminal', style: TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant)),
                      ),
                      TextButton(onPressed: () {}, child: const Text('Forgot PIN?', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600))),
                    ],
                  ),
                  const SizedBox(height: 8),
                  AppButton(
                    label: _loading ? 'Signing in…' : 'Secure Login',
                    icon: Icons.login,
                    onPressed: _loading ? null : _submit,
                  ),
                  const SizedBox(height: 20),
                  const Center(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified_user_outlined, size: 15, color: AppColors.surfaceTint),
                        SizedBox(width: 6),
                        Text('End-to-end encrypted connection', style: TextStyle(fontSize: 12.5, color: AppColors.onSurfaceVariant)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text(
                      'Demo drivers: DRV1 (SB1) · DRV2 (SB2) · DRV3 (TB1) · DRV4 (TB2) — password: driver123',
                      style: TextStyle(fontSize: 12, height: 1.4, color: AppColors.onSurfaceVariant),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
