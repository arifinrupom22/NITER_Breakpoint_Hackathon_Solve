import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/transport_provider.dart';
import '../theme.dart';
import '../widgets/common.dart';

/// See Bus Location → verification. Students enter Name + Bus Card No,
/// teachers enter Name + Teacher/Transport ID. Mirrors the website flow.
class VerifyScreen extends StatefulWidget {
  const VerifyScreen({super.key});

  @override
  State<VerifyScreen> createState() => _VerifyScreenState();
}

class _VerifyScreenState extends State<VerifyScreen> {
  bool _teacher = false;
  final _nameCtrl = TextEditingController();
  final _idCtrl = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _idCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final tp = context.read<TransportProvider>();
    setState(() => _loading = true);
    await Future.delayed(const Duration(milliseconds: 600));
    setState(() => _loading = false);

    final ok = _teacher
        ? tp.verifyTeacher(_nameCtrl.text, _idCtrl.text)
        : tp.verifyStudent(_nameCtrl.text, _idCtrl.text);

    if (!mounted) return;
    if (ok) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('✓ Identity verified — live tracking unlocked')),
      );
    } else {
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          icon: const Icon(Icons.lock_outline, color: AppColors.error, size: 32),
          title: const Text('Access Denied'),
          content: const Text(
            'Live transport tracking is available only to authorized NITER students and teachers. Please check your details.',
            style: TextStyle(fontSize: 14, height: 1.5),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Try Again')),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Verify Identity'), leading: const BackButton()),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          children: [
            // Role selector
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLow,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.5)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: _RoleBtn(label: 'Student', selected: !_teacher, icon: Icons.school_outlined, onTap: () => setState(() => _teacher = false)),
                  ),
                  Expanded(
                    child: _RoleBtn(label: 'Teacher', selected: _teacher, icon: Icons.badge_outlined, onTap: () => setState(() => _teacher = true)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('Authorized access only', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
            const SizedBox(height: 6),
            Text(
              _teacher
                  ? 'Enter your name and Teacher ID to view Teacher Bus 1 and Teacher Bus 2 live locations.'
                  : 'Enter your name and Bus Card No. to view Student Bus 1 and Student Bus 2 live locations.',
              style: const TextStyle(fontSize: 15, height: 1.5, color: AppColors.onSurfaceVariant),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _nameCtrl,
              textCapitalization: TextCapitalization.words,
              decoration: InputDecoration(
                labelText: _teacher ? 'Full Name' : 'Name',
                hintText: _teacher ? 'e.g. Dr. Rahman' : 'e.g. Arifin Rupom',
                prefixIcon: const Icon(Icons.person_outline),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _idCtrl,
              textCapitalization: TextCapitalization.characters,
              decoration: InputDecoration(
                labelText: _teacher ? 'Teacher / Transport ID' : 'Bus Card No.',
                hintText: _teacher ? 'e.g. T001' : 'e.g. BUS06',
                prefixIcon: const Icon(Icons.badge_outlined),
              ),
            ),
            const SizedBox(height: 24),
            AppButton(
              label: _loading ? 'Verifying…' : 'Verify & Continue',
              icon: Icons.verified_user_outlined,
              onPressed: _loading ? null : _submit,
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.15)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, size: 18, color: AppColors.primary),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Demo students: Arifin Rupom (BUS06) · Sneha Rahman (BUS26) · Nabila Nawshin (BUS32)',
                      style: TextStyle(fontSize: 12.5, height: 1.4, color: AppColors.onSurfaceVariant),
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

class _RoleBtn extends StatelessWidget {
  final String label;
  final bool selected;
  final IconData icon;
  final VoidCallback onTap;
  const _RoleBtn({required this.label, required this.selected, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: selected ? AppColors.surfaceContainerLowest : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          boxShadow: selected ? AppColors.shadowLevel1 : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 18, color: selected ? AppColors.primary : AppColors.onSurfaceVariant),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: selected ? AppColors.primary : AppColors.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
