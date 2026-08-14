import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'providers/transport_provider.dart';
import 'screens/home_shell.dart';
import 'screens/live_map_tab.dart';
import 'screens/splash_screen.dart';
import 'theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const NiterTransportApp());
}

class NiterTransportApp extends StatelessWidget {
  const NiterTransportApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => TransportProvider()..restore(),
      child: Consumer<TransportProvider>(
        builder: (context, tp, _) => MaterialApp(
          title: 'NITER Transport',
          debugShowCheckedModeBanner: false,
          theme: buildTheme(dark: false),
          darkTheme: buildTheme(dark: true),
          themeMode: ThemeMode.light,
          initialRoute: '/splash',
          routes: {
            '/splash': (_) => const _SplashBridge(),
            '/home': (_) => const HomeShell(),
            '/map': (_) => const MapScreen(),
          },
        ),
      ),
    );
  }
}

/// Splash → home bridge. Uses the same root navigator so auth state survives.
class _SplashBridge extends StatefulWidget {
  const _SplashBridge();

  @override
  State<_SplashBridge> createState() => _SplashBridgeState();
}

class _SplashBridgeState extends State<_SplashBridge> {
  @override
  Widget build(BuildContext context) {
    return SplashScreen(
      onDone: () {
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/home');
        }
      },
    );
  }
}
