import 'package:flutter/material.dart';

/// NITER Transport design tokens — ported from the official design system
/// (F:\niter_transport_smart_mobility\niter_transport_design_system).
class AppColors {
  // Brand
  static const primary = Color(0xFF003FB1); // Professional Blue
  static const onPrimary = Color(0xFFFFFFFF);
  static const primaryContainer = Color(0xFF1A56DB);
  static const onPrimaryContainer = Color(0xFFD4DCFF);
  static const surfaceTint = Color(0xFF1353D8);

  // Secondary
  static const secondary = Color(0xFF545F73);
  static const onSecondary = Color(0xFFFFFFFF);
  static const secondaryContainer = Color(0xFFD5E0F8);
  static const onSecondaryContainer = Color(0xFF586377);

  // Tertiary
  static const tertiary = Color(0xFF3231C1);
  static const onTertiary = Color(0xFFFFFFFF);
  static const tertiaryContainer = Color(0xFF4C4ED9);
  static const onTertiaryContainer = Color(0xFFDBDAFF);

  // Error / Success
  static const error = Color(0xFFBA1A1A);
  static const onError = Color(0xFFFFFFFF);
  static const errorContainer = Color(0xFFFFDAD6);
  static const onErrorContainer = Color(0xFF93000A);
  static const success = Color(0xFF15803D);
  static const successContainer = Color(0xFFDCFCE7);
  static const onSuccessContainer = Color(0xFF166534);

  // Surfaces
  static const background = Color(0xFFF7F9FB);
  static const onBackground = Color(0xFF191C1E);
  static const surface = Color(0xFFF7F9FB);
  static const onSurface = Color(0xFF191C1E);
  static const surfaceDim = Color(0xFFD8DADC);
  static const surfaceBright = Color(0xFFF7F9FB);
  static const surfaceContainerLowest = Color(0xFFFFFFFF);
  static const surfaceContainerLow = Color(0xFFF2F4F6);
  static const surfaceContainer = Color(0xFFECEEF0);
  static const surfaceContainerHigh = Color(0xFFE6E8EA);
  static const surfaceContainerHighest = Color(0xFFE0E3E5);
  static const onSurfaceVariant = Color(0xFF434654);
  static const inverseSurface = Color(0xFF2D3133);
  static const inverseOnSurface = Color(0xFFEFF1F3);
  static const inversePrimary = Color(0xFFB5C4FF);

  // Outline
  static const outline = Color(0xFF737686);
  static const outlineVariant = Color(0xFFC3C5D7);
  static const surfaceVariant = Color(0xFFE0E3E5);

  // Fixed palette
  static const primaryFixed = Color(0xFFDBE1FF);
  static const primaryFixedDim = Color(0xFFB5C4FF);
  static const onPrimaryFixed = Color(0xFF00174D);
  static const onPrimaryFixedVariant = Color(0xFF003DAB);
  static const secondaryFixed = Color(0xFFD8E3FB);
  static const secondaryFixedDim = Color(0xFFBCC7DE);
  static const onSecondaryFixed = Color(0xFF111C2D);
  static const onSecondaryFixedVariant = Color(0xFF3C475A);
  static const tertiaryFixed = Color(0xFFE1E0FF);
  static const tertiaryFixedDim = Color(0xFFC0C1FF);
  static const onTertiaryFixed = Color(0xFF07006C);
  static const onTertiaryFixedVariant = Color(0xFF2F2EBE);

  // Brand accents used across screens
  static const bKash = Color(0xFFE2136E);
  static const nagad = Color(0xFFED1C24);
  static const onTimeGreen = Color(0xFF2E7D32);
  static const onTimeGreenBg = Color(0xFFE8F5E9);
  static const delayedRed = Color(0xFFB91C1C);

  // Elevation shadows (Level 1 = cards, Level 2 = overlays)
  static const shadowLevel1 = [
    BoxShadow(color: Color(0x0D1E293B), blurRadius: 20, offset: Offset(0, 4)),
  ];
  static const shadowLevel2 = [
    BoxShadow(color: Color(0x1F1E293B), blurRadius: 32, offset: Offset(0, 12)),
  ];
}

/// Elevation used to "lift" interactive cards on hover/press.
const List<BoxShadow> kLiftShadow = [
  BoxShadow(color: Color(0x1F1E293B), blurRadius: 24, offset: Offset(0, 12)),
];

ThemeData buildTheme({required bool dark}) {
  final scheme = dark ? _darkScheme() : _lightScheme();
  const font = 'Inter';
  final base = ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: scheme.surface,
    fontFamily: font,
  );

  final applied = base.textTheme.apply(
    bodyColor: scheme.onSurface,
    displayColor: scheme.onSurface,
    fontFamily: font,
  );
  final textTheme = applied.copyWith(
    // display-lg 48/56 w700 ls-0.02em
    displayLarge: applied.displayLarge?.copyWith(
      fontSize: 48, height: 56 / 48, fontWeight: FontWeight.w700, letterSpacing: -0.02,
    ),
    // headline-lg 32/40 w700 ls-0.01em
    headlineLarge: applied.headlineLarge?.copyWith(
      fontSize: 32, height: 40 / 32, fontWeight: FontWeight.w700, letterSpacing: -0.01,
    ),
    // headline-lg-mobile 24/32 w700
    headlineMedium: applied.headlineMedium?.copyWith(
      fontSize: 24, height: 32 / 24, fontWeight: FontWeight.w700,
    ),
    // headline-md 20/28 w600
    titleLarge: applied.titleLarge?.copyWith(
      fontSize: 20, height: 28 / 20, fontWeight: FontWeight.w600,
    ),
    // body-lg 18/28 w400
    bodyLarge: applied.bodyLarge?.copyWith(
      fontSize: 18, height: 28 / 18, fontWeight: FontWeight.w400,
    ),
    // body-md 16/24 w400
    bodyMedium: applied.bodyMedium?.copyWith(
      fontSize: 16, height: 24 / 16, fontWeight: FontWeight.w400,
    ),
    // label-md 14/20 w600 ls 0.01em
    labelLarge: applied.labelLarge?.copyWith(
      fontSize: 14, height: 20 / 14, fontWeight: FontWeight.w600, letterSpacing: 0.01,
    ),
    // number-xl 36/44 w700 ls-0.02em
    headlineSmall: applied.headlineSmall?.copyWith(
      fontSize: 36, height: 44 / 36, fontWeight: FontWeight.w700, letterSpacing: -0.02,
    ),
  );

  return base.copyWith(
    textTheme: textTheme,
    appBarTheme: AppBarTheme(
      backgroundColor: scheme.surface,
      foregroundColor: scheme.onSurface,
      elevation: 0,
      scrolledUnderElevation: 0.5,
      centerTitle: false,
      surfaceTintColor: Colors.transparent,
      titleTextStyle: textTheme.titleLarge?.copyWith(
        color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 20,
      ),
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      color: scheme.surfaceContainerLowest,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: scheme.primary,
        foregroundColor: scheme.onPrimary,
        elevation: 0,
        minimumSize: const Size(0, 48),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, letterSpacing: 0.01),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        side: const BorderSide(color: AppColors.outline),
        minimumSize: const Size(0, 48),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, letterSpacing: 0.01),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: scheme.surfaceBright,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.outlineVariant),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.outlineVariant),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
      hintStyle: TextStyle(color: scheme.onSurfaceVariant.withValues(alpha: 0.6), fontWeight: FontWeight.w400),
      labelStyle: TextStyle(color: scheme.onSurfaceVariant),
    ),
    bottomSheetTheme: BottomSheetThemeData(
      backgroundColor: scheme.surfaceContainerLowest,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
    ),
    dividerTheme: DividerThemeData(color: AppColors.outlineVariant.withValues(alpha: 0.3), thickness: 1),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: scheme.inverseSurface,
      contentTextStyle: TextStyle(color: scheme.onInverseSurface),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
    progressIndicatorTheme: ProgressIndicatorThemeData(color: scheme.primary),
    navigationBarTheme: const NavigationBarThemeData(
      backgroundColor: Colors.transparent,
      indicatorColor: AppColors.primaryContainer,
    ),
  );
}

ColorScheme _lightScheme() => const ColorScheme.light(
      primary: AppColors.primary,
      onPrimary: AppColors.onPrimary,
      primaryContainer: AppColors.primaryContainer,
      onPrimaryContainer: AppColors.onPrimaryContainer,
      secondary: AppColors.secondary,
      onSecondary: AppColors.onSecondary,
      secondaryContainer: AppColors.secondaryContainer,
      onSecondaryContainer: AppColors.onSecondaryContainer,
      tertiary: AppColors.tertiary,
      onTertiary: AppColors.onTertiary,
      tertiaryContainer: AppColors.tertiaryContainer,
      onTertiaryContainer: AppColors.onTertiaryContainer,
      error: AppColors.error,
      onError: AppColors.onError,
      errorContainer: AppColors.errorContainer,
      onErrorContainer: AppColors.onErrorContainer,
      surface: AppColors.surface,
      onSurface: AppColors.onSurface,
      onSurfaceVariant: AppColors.onSurfaceVariant,
      outline: AppColors.outline,
      outlineVariant: AppColors.outlineVariant,
      inverseSurface: AppColors.inverseSurface,
      onInverseSurface: AppColors.inverseOnSurface,
      inversePrimary: AppColors.inversePrimary,
      surfaceTint: AppColors.surfaceTint,
      surfaceDim: AppColors.surfaceDim,
      surfaceBright: AppColors.surfaceBright,
      surfaceContainerLowest: AppColors.surfaceContainerLowest,
      surfaceContainerLow: AppColors.surfaceContainerLow,
      surfaceContainer: AppColors.surfaceContainer,
      surfaceContainerHigh: AppColors.surfaceContainerHigh,
      surfaceContainerHighest: AppColors.surfaceContainerHighest,
    );

ColorScheme _darkScheme() => const ColorScheme.dark(
      primary: AppColors.inversePrimary,
      onPrimary: AppColors.onPrimaryFixed,
      primaryContainer: AppColors.onPrimaryFixedVariant,
      onPrimaryContainer: AppColors.primaryFixed,
      secondary: AppColors.secondaryFixedDim,
      onSecondary: AppColors.onSecondaryFixed,
      secondaryContainer: AppColors.onSecondaryFixedVariant,
      onSecondaryContainer: AppColors.secondaryFixed,
      tertiary: AppColors.tertiaryFixedDim,
      onTertiary: AppColors.onTertiaryFixed,
      tertiaryContainer: AppColors.onTertiaryFixedVariant,
      onTertiaryContainer: AppColors.tertiaryFixed,
      error: Color(0xFFFFB4AB),
      onError: Color(0xFF690005),
      errorContainer: Color(0xFF93000A),
      onErrorContainer: Color(0xFFFFDAD6),
      surface: Color(0xFF121316),
      onSurface: Color(0xFFE2E2E5),
      onSurfaceVariant: Color(0xFFC3C7CF),
      outline: Color(0xFF8D9199),
      outlineVariant: Color(0xFF43474E),
      inverseSurface: Color(0xFFE2E2E5),
      onInverseSurface: Color(0xFF2D3133),
      inversePrimary: AppColors.primary,
      surfaceTint: AppColors.inversePrimary,
      surfaceDim: Color(0xFF121316),
      surfaceBright: Color(0xFF383A3D),
      surfaceContainerLowest: Color(0xFF0D0E10),
      surfaceContainerLow: Color(0xFF1A1B1E),
      surfaceContainer: Color(0xFF1E2023),
      surfaceContainerHigh: Color(0xFF292A2E),
      surfaceContainerHighest: Color(0xFF343539),
    );
