import 'package:flutter/material.dart';

import '../widgets/common.dart';
import 'home_tab.dart';
import 'live_map_tab.dart';
import 'my_pass_tab.dart';
import 'profile_tab.dart';
import 'trips_tab.dart';

/// Main app shell — five-tab experience mirroring the design's bottom nav:
/// Home · Live Map · My Pass · Trips · Profile.
class HomeShell extends StatefulWidget {
  final int initialIndex;
  const HomeShell({super.key, this.initialIndex = 0});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  late int _index = widget.initialIndex;

  static const _items = [
    (icon: Icons.home_outlined, label: 'Home'),
    (icon: Icons.map_outlined, label: 'Live Map'),
    (icon: Icons.qr_code_2, label: 'My Pass'),
    (icon: Icons.route_outlined, label: 'Trips'),
    (icon: Icons.person_outline, label: 'Profile'),
  ];

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const HomeTab(),
      const LiveMapTab(),
      const MyPassTab(),
      const TripsTab(),
      const ProfileTab(),
    ];
    return Scaffold(
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: GlassBottomNav(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
        items: _items,
      ),
    );
  }
}
