import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/transport_provider.dart';
import '../theme.dart';
import '../widgets/common.dart';

/// Full transaction/trip history — summary cards + detailed list with
/// status chips and ticket links. Matches trip_history design.
class TripHistoryScreen extends StatelessWidget {
  const TripHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final tp = context.watch<TransportProvider>();
    final tx = tp.walletTx;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('NITER Transport'), leading: const BackButton()),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            Row(
              children: [
                const Expanded(
                  child: Text('Transaction History',
                      style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
                ),
                IconButton(
                  icon: const Icon(Icons.filter_list, color: AppColors.onSurfaceVariant),
                  onPressed: () {},
                ),
                IconButton(
                  icon: const Icon(Icons.download_outlined, color: AppColors.onSurfaceVariant),
                  onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Report export (demo)')),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: StatCard(icon: Icons.payments_outlined, value: '৳ ${tp.totalSpent.toStringAsFixed(0)}', label: 'Total Spent (Month)')),
                const SizedBox(width: 12),
                Expanded(child: StatCard(icon: Icons.directions_bus_outlined, value: '${tp.tripsTaken}', label: 'Trips Taken', accent: AppColors.tertiaryContainer)),
              ],
            ),
            const SizedBox(height: 24),
            const Text('RECENT TRANSACTIONS',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 1, color: AppColors.secondary)),
            const SizedBox(height: 10),
            ...tx.map((t) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _HistoryTile(tx: t),
                )),
            // Boardings
            if (tp.boardings.isNotEmpty) ...[
              const SizedBox(height: 8),
              const Text('BOARDINGS',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 1, color: AppColors.secondary)),
              const SizedBox(height: 10),
              ...tp.boardings.map((b) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _BoardingTile(rec: b),
                  )),
            ],
            const SizedBox(height: 12),
            Center(
              child: TextButton(
                onPressed: () {},
                child: const Text('Load More'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HistoryTile extends StatelessWidget {
  final WalletTx tx;
  const _HistoryTile({required this.tx});

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
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isTopup ? AppColors.tertiaryContainer.withValues(alpha: 0.15) : AppColors.primaryContainer.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              isTopup ? Icons.account_balance_wallet_outlined : isPass ? Icons.qr_code_2 : Icons.directions_bus_outlined,
              color: isTopup ? AppColors.tertiaryContainer : AppColors.primary,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(tx.title,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: tx.status == 'Success' || tx.status == 'Verified'
                            ? const Color(0xFFE6F4EA)
                            : AppColors.surfaceContainerHigh,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        tx.status,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: tx.status == 'Success' || tx.status == 'Verified' ? const Color(0xFF137333) : AppColors.onSurfaceVariant,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(tx.subtitle, style: const TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.calendar_today_outlined, size: 13, color: AppColors.secondary),
                    const SizedBox(width: 4),
                    Text(_fmtDate(tx.date), style: const TextStyle(fontSize: 12, color: AppColors.secondary)),
                    const Text('  •  ', style: TextStyle(fontSize: 12, color: AppColors.secondary)),
                    const Icon(Icons.schedule_outlined, size: 13, color: AppColors.secondary),
                    const SizedBox(width: 4),
                    Text(_fmtTime(tx.date), style: const TextStyle(fontSize: 12, color: AppColors.secondary)),
                  ],
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
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: isTopup ? const Color(0xFF137333) : isPass ? AppColors.onSurface : AppColors.error,
                ),
              ),
              const SizedBox(height: 2),
              if (isPass)
                const Text('Covered by Pass', style: TextStyle(fontSize: 11, color: AppColors.primary))
              else
                Text('Ref: ${tx.ref}', style: const TextStyle(fontSize: 11, color: AppColors.secondary)),
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

  String _fmtTime(DateTime d) {
    final h = d.hour % 12 == 0 ? 12 : d.hour % 12;
    return '$h:${d.minute.toString().padLeft(2, '0')} ${d.hour < 12 ? 'AM' : 'PM'}';
  }
}

class _BoardingTile extends StatelessWidget {
  final BoardingRecord rec;
  const _BoardingTile({required this.rec});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(14),
        boxShadow: AppColors.shadowLevel1,
        border: const Border(left: BorderSide(color: Color(0xFF15803D), width: 4)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFFDCFCE7)),
            child: const Icon(Icons.check, color: Color(0xFF15803D), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${rec.studentName} boarded ${rec.busName}',
                    style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600, color: AppColors.onSurface)),
                const SizedBox(height: 2),
                Text('${rec.routeName} · ${rec.card} · ${rec.tripId}',
                    style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant)),
              ],
            ),
          ),
          Text('৳ ${rec.fare.toStringAsFixed(0)}',
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.error)),
        ],
      ),
    );
  }
}
