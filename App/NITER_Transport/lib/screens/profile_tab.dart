import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/transport_provider.dart';
import '../theme.dart';
import '../widgets/common.dart';
import 'driver_login_screen.dart';
import 'emergency_sos_screen.dart';
import 'verify_screen.dart';
import 'wallet_screen.dart';

/// Profile tab — identity, wallet shortcut, emergency, driver console, logout.
class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    final tp = context.watch<TransportProvider>();
    final user = tp.user;

    final name = user?.name ?? 'Campus Commuter';
    final role = switch (user?.role) {
      'transport-student' => 'Student · ${user?.card ?? ''}',
      'transport-teacher' => 'Teacher · ${user?.id ?? ''}',
      'driver' => 'Driver · ${user?.id ?? ''}',
      _ => 'Guest',
    };

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
                  // Profile card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainerLowest,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: AppColors.shadowLevel1,
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 64,
                          height: 64,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFFD5E0F8), Color(0xFFB5C4FF)]),
                          ),
                          child: Icon(user == null ? Icons.person_outline : Icons.person, size: 34, color: AppColors.onSecondaryContainer),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
                              const SizedBox(height: 4),
                              Text(role, style: const TextStyle(fontSize: 14, color: AppColors.onSurfaceVariant)),
                              if (user != null) ...[
                                const SizedBox(height: 4),
                                const StatusChip('VERIFIED', bg: Color(0xFFE8F5E9), fg: Color(0xFF2E7D32)),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Wallet balance shortcut
                  _ShortcutTile(
                    icon: Icons.account_balance_wallet_outlined,
                    title: 'Transport Wallet',
                    subtitle: 'Balance ৳ ${tp.walletBalance.toStringAsFixed(2)}',
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const WalletScreen())),
                  ),
                  _ShortcutTile(
                    icon: Icons.sos,
                    title: 'Emergency SOS',
                    subtitle: 'Get help immediately',
                    iconColor: AppColors.error,
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const EmergencySosScreen())),
                  ),
                  if (user?.role != 'driver')
                    _ShortcutTile(
                      icon: Icons.badge_outlined,
                      title: 'Driver Console',
                      subtitle: 'Open the driver portal',
                      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const DriverLoginScreen())),
                    ),
                  if (user == null)
                    _ShortcutTile(
                      icon: Icons.verified_user_outlined,
                      title: 'Verify Identity',
                      subtitle: 'Authorize to view live buses',
                      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const VerifyScreen())),
                    ),
                  const SizedBox(height: 8),
                  AppButton(
                    label: user == null ? 'Sign In' : 'Log Out',
                    icon: user == null ? Icons.login : Icons.logout,
                    primary: false,
                    onPressed: () async {
                      if (user != null) {
                        await tp.logout();
                      } else {
                        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const VerifyScreen()));
                      }
                    },
                  ),
                  const SizedBox(height: 12),
                  const Center(
                    child: Text(
                      'NITER Transport v1.0 · Demo Simulation',
                      style: TextStyle(fontSize: 12, color: AppColors.outline),
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

class _ShortcutTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final Color? iconColor;
  const _ShortcutTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              boxShadow: AppColors.shadowLevel1,
            ),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: (iconColor ?? AppColors.primary).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: iconColor ?? AppColors.primary, size: 22),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.onSurface)),
                      const SizedBox(height: 2),
                      Text(subtitle, style: const TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant)),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: AppColors.outline),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
