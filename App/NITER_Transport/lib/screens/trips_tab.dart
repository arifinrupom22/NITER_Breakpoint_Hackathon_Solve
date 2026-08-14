import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/transport_provider.dart';
import '../theme.dart';
import '../widgets/common.dart';
import 'trip_history_screen.dart';
import 'wallet_screen.dart';

/// Trips tab — summary cards + recent transactions, mirroring trip_history.
class TripsTab extends StatelessWidget {
  const TripsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final tp = context.watch<TransportProvider>();
    final tx = tp.walletTx;

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
                  Row(
                    children: [
                      const Expanded(
                        child: Text('Transaction History',
                            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
                      ),
                      OutlinedButton(
                        onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const TripHistoryScreen())),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(0, 40),
                          padding: const EdgeInsets.symmetric(horizontal: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('View All'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          icon: Icons.payments_outlined,
                          value: '৳ ${tp.totalSpent.toStringAsFixed(0)}',
                          label: 'Total Spent',
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: StatCard(
                          icon: Icons.directions_bus_outlined,
                          value: '${tp.tripsTaken}',
                          label: 'Trips Taken',
                          accent: AppColors.tertiaryContainer,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  const SectionTitle('Recent Transactions'),
                  const SizedBox(height: 12),
                  ...tx.take(4).map((t) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _TxTile(tx: t),
                      )),
                  const SizedBox(height: 8),
                  AppButton(
                    label: 'Open Transport Wallet',
                    icon: Icons.account_balance_wallet_outlined,
                    subtle: true,
                    onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const WalletScreen())),
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

class _TxTile extends StatelessWidget {
  final WalletTx tx;
  const _TxTile({required this.tx});

  @override
  Widget build(BuildContext context) {
    final isTopup = tx.amount > 0;
    final isPass = tx.amount == 0;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(14),
        boxShadow: AppColors.shadowLevel1,
        border: Border(left: BorderSide(color: isTopup ? AppColors.secondaryFixedDim : AppColors.primary, width: 4)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(color: AppColors.surfaceContainerLow, borderRadius: BorderRadius.circular(999)),
            child: Icon(
              isTopup ? Icons.add_card_outlined : isPass ? Icons.qr_code_2 : Icons.directions_bus_outlined,
              size: 20,
              color: AppColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(tx.title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.onSurface)),
                const SizedBox(height: 2),
                Text(tx.subtitle, style: const TextStyle(fontSize: 12.5, color: AppColors.onSurfaceVariant)),
                const SizedBox(height: 4),
                Text(
                  '${_fmtDate(tx.date)} · ${tx.status}',
                  style: const TextStyle(fontSize: 11.5, color: AppColors.secondary),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${isTopup ? '+' : isPass ? '' : '-'} ৳ ${tx.amount.abs().toStringAsFixed(0)}',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: isTopup ? AppColors.success : isPass ? AppColors.secondary : AppColors.error,
                ),
              ),
              if (!isTopup && !isPass) ...[
                const SizedBox(height: 2),
                const Text('Today', style: TextStyle(fontSize: 11, color: AppColors.secondary)),
              ],
            ],
          ),
        ],
      ),
    );
  }

  String _fmtDate(DateTime d) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[d.month - 1]} ${d.day}, ${d.year}';
  }
}
