import 'package:flutter/material.dart';

import '../theme.dart';

/// NITER Transport top app bar — hub icon + title + avatar.
class NiterHeader extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final VoidCallback? onAvatarTap;
  final Widget? leading;
  final List<Widget>? actions;
  const NiterHeader({super.key, this.title = 'NITER Transport', this.onAvatarTap, this.leading, this.actions});

  @override
  Size get preferredSize => const Size.fromHeight(64);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        boxShadow: [BoxShadow(color: Color(0x0D1E293B), blurRadius: 20, offset: Offset(0, 4))],
      ),
      child: Row(
        children: [
          if (leading != null) ...[leading!, const SizedBox(width: 8)],
          const Icon(Icons.hub_outlined, color: AppColors.primary, size: 24),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
          ),
          if (actions != null) ...actions!,
          _Avatar(onTap: onAvatarTap),
        ],
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  final VoidCallback? onTap;
  const _Avatar({this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: const BoxDecoration(
          shape: BoxShape.circle,
          color: AppColors.secondaryContainer,
          border: Border.fromBorderSide(BorderSide(color: AppColors.outlineVariant, width: 0.5)),
        ),
        child: const Icon(Icons.person_outline, color: AppColors.onSecondaryContainer, size: 20),
      ),
    );
  }
}

/// Glassmorphism bottom navigation (fixed, backdrop blur).
class GlassBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final List<({IconData icon, String label})> items;
  const GlassBottomNav({super.key, required this.currentIndex, required this.onTap, required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface.withValues(alpha: 0.82),
        border: const Border(top: BorderSide(color: Color(0x4DC3C5D7))),
        boxShadow: const [BoxShadow(color: Color(0x0D1E293B), blurRadius: 16, offset: Offset(0, -4))],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(items.length, (i) {
              final active = i == currentIndex;
              final item = items[i];
              return InkWell(
                onTap: () => onTap(i),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: active ? AppColors.primaryContainer.withValues(alpha: 0.22) : Colors.transparent,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        item.icon,
                        size: 22,
                        color: active ? AppColors.primary : AppColors.secondary,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        item.label,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                          color: active ? AppColors.primary : AppColors.secondary,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

/// Section heading with optional action.
class SectionTitle extends StatelessWidget {
  final String title;
  final String? actionLabel;
  final VoidCallback? onAction;
  final IconData? icon;
  const SectionTitle(this.title, {super.key, this.actionLabel, this.onAction, this.icon, this.color});

  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        if (icon != null) ...[
          Icon(icon, size: 20, color: color ?? AppColors.primary),
          const SizedBox(width: 8),
        ],
        Expanded(
          child: Text(
            title,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: color ?? AppColors.onSurface,
            ),
          ),
        ),
        if (actionLabel != null)
          InkWell(
            onTap: onAction,
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
              child: Text(
                actionLabel!,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.primary),
              ),
            ),
          ),
      ],
    );
  }
}

/// Pill-shaped status chip with optional live dot.
class StatusChip extends StatelessWidget {
  final String label;
  final Color? bg;
  final Color? fg;
  final bool live;
  const StatusChip(this.label, {super.key, this.bg, this.fg, this.live = false});

  @override
  Widget build(BuildContext context) {
    final b = bg ?? AppColors.onTimeGreenBg;
    final f = fg ?? AppColors.onTimeGreen;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: b,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: f.withValues(alpha: 0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (live) ...[
            _PulseDot(color: f, size: 7),
            const SizedBox(width: 6),
          ],
          Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: f)),
        ],
      ),
    );
  }
}

class _PulseDot extends StatefulWidget {
  final Color color;
  final double size;
  const _PulseDot({required this.color, required this.size});

  @override
  State<_PulseDot> createState() => _PulseDotState();
}

class _PulseDotState extends State<_PulseDot> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 1600))..repeat();

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
        final t = _c.value;
        return SizedBox(
          width: widget.size,
          height: widget.size,
          child: Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: widget.size,
                height: widget.size,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: widget.color.withValues(alpha: 0.3 + 0.7 * (1 - t)),
                ),
              ),
              Container(
                width: widget.size * (0.5 + 1.5 * t),
                height: widget.size * (0.5 + 1.5 * t),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: widget.color.withValues(alpha: 0.4 * (1 - t)), width: 1.2),
                ),
              ),
              Container(width: widget.size * 0.55, height: widget.size * 0.55, decoration: BoxDecoration(shape: BoxShape.circle, color: widget.color)),
            ],
          ),
        );
      },
    );
  }
}

/// Left-accent stat card used across dashboards.
class StatCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color? accent;
  final Widget? trailing;
  final bool borderLeft;
  const StatCard({
    super.key,
    required this.icon,
    required this.value,
    required this.label,
    this.accent,
    this.trailing,
    this.borderLeft = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppColors.shadowLevel1,
        border: borderLeft ? Border(left: BorderSide(color: accent ?? AppColors.primary, width: 4)) : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, size: 20, color: AppColors.secondary),
              if (trailing != null) trailing!,
            ],
          ),
          const SizedBox(height: 12),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(value, style: const TextStyle(fontSize: 26, height: 1.2, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
          ),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant)),
        ],
      ),
    );
  }
}

/// Primary / secondary action button following design rules.
class AppButton extends StatelessWidget {
  final String label;
  final IconData? icon;
  final VoidCallback? onPressed;
  final bool primary;
  final bool fullWidth;
  final bool subtle;
  const AppButton({
    super.key,
    required this.label,
    this.icon,
    this.onPressed,
    this.primary = true,
    this.fullWidth = true,
    this.subtle = false,
  });

  @override
  Widget build(BuildContext context) {
    final bg = subtle
        ? const Color(0xFFEFF6FF)
        : primary
            ? AppColors.primary
            : AppColors.surfaceContainerLowest;
    final fg = subtle
        ? AppColors.primary
        : primary
            ? Colors.white
            : AppColors.primary;
    final child = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (icon != null) ...[Icon(icon, size: 20, color: fg), const SizedBox(width: 8)],
        Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, letterSpacing: 0.01, color: fg)),
      ],
    );
    final btn = SizedBox(
      height: 48,
      child: primary || subtle
          ? FilledButton(
              style: FilledButton.styleFrom(backgroundColor: bg, foregroundColor: fg, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              onPressed: onPressed,
              child: child,
            )
          : OutlinedButton(
              style: OutlinedButton.styleFrom(foregroundColor: fg, side: const BorderSide(color: AppColors.outline), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              onPressed: onPressed,
              child: child,
            ),
    );
    return fullWidth ? SizedBox(width: double.infinity, child: btn) : btn;
  }
}

/// Small icon button used for floating controls / map buttons.
class FloatingIconBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;
  final double size;
  const FloatingIconBtn({super.key, required this.icon, this.onTap, this.size = 44});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surfaceContainerLowest,
      shape: const CircleBorder(),
      elevation: 0,
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: AppColors.surfaceContainerHighest)),
          child: Icon(icon, color: AppColors.onSurfaceVariant, size: 20),
        ),
      ),
    );
  }
}
