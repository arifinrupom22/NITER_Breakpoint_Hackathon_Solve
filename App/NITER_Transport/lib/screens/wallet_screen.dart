import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/transport_provider.dart';
import '../theme.dart';
import '../widgets/common.dart';

/// Transport Wallet — balance, top-up, payment methods (bKash, Nagad,
/// Bank Card, Campus Balance) and recent transactions. Matches
/// transport_wallet design. All payments are clearly DEMO.
class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  final _amountCtrl = TextEditingController(text: '100');

  @override
  void dispose() {
    _amountCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tp = context.watch<TransportProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Transport Wallet'), leading: const BackButton()),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            // Balance card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(16),
                boxShadow: AppColors.shadowLevel1,
              ),
              child: Column(
                children: [
                  const Text('Available Balance', style: TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant)),
                  const SizedBox(height: 6),
                  Text(
                    '৳ ${tp.walletBalance.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 40, fontWeight: FontWeight.w700, letterSpacing: -0.02, color: AppColors.primary),
                  ),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: _showTopUp,
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    ),
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text('Top Up'),
                  ),
                  const SizedBox(height: 10),
                  const StatusChip('DEMO PAYMENT', bg: Color(0xFFFEF3C7), fg: Color(0xFF92400E)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const SectionTitle('Payment Methods'),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _PaymentTile(label: 'bKash', color: AppColors.bKash, icon: Icons.account_balance_wallet_outlined, onTap: () => _pay('bKash'))),
                const SizedBox(width: 10),
                Expanded(child: _PaymentTile(label: 'Nagad', color: AppColors.nagad, icon: Icons.phone_iphone, onTap: () => _pay('Nagad'))),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(child: _PaymentTile(label: 'Bank Card', color: AppColors.primary, icon: Icons.credit_card_outlined, onTap: () => _pay('Bank Card'))),
                const SizedBox(width: 10),
                Expanded(child: _PaymentTile(label: 'Campus Balance', color: AppColors.secondary, icon: Icons.school_outlined, onTap: () => _pay('Campus Balance'))),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                const Expanded(child: SectionTitle('Recent Transactions')),
                TextButton(onPressed: () {}, child: const Text('View All')),
              ],
            ),
            const SizedBox(height: 4),
            ...tp.walletTx.take(3).map((t) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _WalletTxTile(tx: t),
                )),
          ],
        ),
      ),
    );
  }

  void _showTopUp() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Top Up Wallet'),
        content: TextField(
          controller: _amountCtrl,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'Amount (৳)',
            prefixIcon: Icon(Icons.payments_outlined),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(
            onPressed: () {
              final amt = double.tryParse(_amountCtrl.text) ?? 0;
              if (amt > 0) {
                context.read<TransportProvider>().topUp(amt, 'DEMO');
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('✓ Demo top-up successful')),
                );
              }
            },
            child: const Text('Top Up'),
          ),
        ],
      ),
    );
  }

  void _pay(String method) {
    final tp = context.read<TransportProvider>();
    showModalBottomSheet(
      context: context,
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.surfaceContainerHighest, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 20),
            const Icon(Icons.account_balance_wallet_outlined, size: 44, color: AppColors.primary),
            const SizedBox(height: 12),
            Text('Pay with $method', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
            const SizedBox(height: 6),
            const Text('DEMO PAYMENT — no real transaction occurs.',
                style: TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant)),
            const SizedBox(height: 20),
            AppButton(
              label: 'Confirm Demo Payment',
              icon: Icons.lock_outline,
              onPressed: () {
                Navigator.pop(ctx);
                tp.topUp(0, method); // registers a zero-amount demo tx
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('$method connected (demo). No charge applied.')),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _PaymentTile extends StatelessWidget {
  final String label;
  final Color color;
  final IconData icon;
  final VoidCallback onTap;
  const _PaymentTile({required this.label, required this.color, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surfaceContainerLowest,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            boxShadow: AppColors.shadowLevel1,
          ),
          child: Column(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(shape: BoxShape.circle, color: color.withValues(alpha: 0.1)),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(height: 8),
              Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.onSurfaceVariant)),
            ],
          ),
        ),
      ),
    );
  }
}

class _WalletTxTile extends StatelessWidget {
  final WalletTx tx;
  const _WalletTxTile({required this.tx});

  @override
  Widget build(BuildContext context) {
    final isTopup = tx.amount > 0;
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
            decoration: const BoxDecoration(color: AppColors.surfaceContainerLow, shape: BoxShape.circle),
            child: Icon(isTopup ? Icons.add_card_outlined : Icons.directions_bus_outlined, size: 20, color: AppColors.onSurfaceVariant),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(tx.title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.onSurface)),
                const SizedBox(height: 2),
                Text(tx.subtitle, style: const TextStyle(fontSize: 12.5, color: AppColors.onSurfaceVariant)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${isTopup ? '+' : '-'} ৳ ${tx.amount.abs().toStringAsFixed(0)}',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: isTopup ? AppColors.success : AppColors.error),
              ),
              Text('${tx.status} · ${tx.ref}', style: const TextStyle(fontSize: 11, color: AppColors.secondary)),
            ],
          ),
        ],
      ),
    );
  }
}
