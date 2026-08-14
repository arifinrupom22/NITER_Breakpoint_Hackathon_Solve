import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../data/seed_data.dart';
import '../models/models.dart';
import '../services/session.dart';
import '../services/simulation.dart';

/// A wallet / payment transaction record.
class WalletTx {
  final String id;
  final String title;
  final String subtitle;
  final double amount; // negative = spend, positive = top-up
  final DateTime date;
  final String status;
  final String ref;
  const WalletTx({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.amount,
    required this.date,
    required this.status,
    required this.ref,
  });
}

class BoardingRecord {
  final String studentName;
  final String card;
  final String busName;
  final String routeName;
  final DateTime time;
  final double fare;
  final String tripId;
  const BoardingRecord({
    required this.studentName,
    required this.card,
    required this.busName,
    required this.routeName,
    required this.time,
    required this.fare,
    required this.tripId,
  });
}

/// Single source of app state. In DEMO mode the [SimulationEngine] drives the
/// same bus state the website simulates; when a live backend is configured the
/// ApiService/SocketService layer can replace it (kept for the full-stack path).
class TransportProvider extends ChangeNotifier {
  // ---- auth ----
  TransportUser? user;
  bool connected = false;

  // ---- transport state ----
  late final Map<String, SimBus> simBuses = _buildBuses();
  late final SimulationEngine engine;
  bool simulationReady = false;
  String? lastEvent;

  // ---- wallet / boarding ----
  double walletBalance = 450.0;
  List<WalletTx> walletTx = [];
  List<BoardingRecord> boardings = [];
  BoardingRecord? lastBoarding;

  // ---- emergency ----
  String? activeEmergency;

  Timer? _persistDebounce;
  Timer? _autoStartTimer;

  TransportProvider() {
    engine = SimulationEngine(buses: simBuses, onTick: _onSimTick);
    _seedWallet();
  }

  Map<String, SimBus> _buildBuses() {
    final map = <String, SimBus>{};
    for (final bus in seedBuses) {
      final route = routeById(bus.routeId);
      map[bus.id] = SimBus(bus, route);
    }
    return map;
  }

  void _seedWallet() {
    final now = DateTime.now();
    walletTx = [
      WalletTx(
        id: 'TX001',
        title: 'Student Bus 1',
        subtitle: 'Khamarbari → NITER',
        amount: -30,
        date: now.subtract(const Duration(hours: 2)),
        status: 'Completed',
        ref: 'TR45901',
      ),
      WalletTx(
        id: 'TX002',
        title: 'bKash Top Up',
        subtitle: 'Wallet Reload',
        amount: 500,
        date: now.subtract(const Duration(days: 1)),
        status: 'Success',
        ref: 'TR45902',
      ),
      WalletTx(
        id: 'TX003',
        title: 'Monthly Pass Scan',
        subtitle: 'Student Bus 1 • Khamarbari Route',
        amount: 0,
        date: now.subtract(const Duration(days: 3)),
        status: 'Verified',
        ref: 'PASS-SCAN',
      ),
      WalletTx(
        id: 'TX004',
        title: 'Student Bus 2',
        subtitle: 'NITER → Mirpur 10',
        amount: -40,
        date: now.subtract(const Duration(days: 4)),
        status: 'Completed',
        ref: 'TR45877',
      ),
    ];
    walletBalance = 450.0;
  }

  // ---------------------------------------------------------------- lifecycle

  Future<void> restore() async {
    final u = await Session.user();
    if (u != null) user = u;
    await _restoreWallet();
    engine.start();
    // Auto-start demo trips so the map shows live movement immediately.
    // Stored as a cancellable Timer so widget tests don't leak a pending timer.
    _autoStartTimer?.cancel();
    _autoStartTimer = Timer(const Duration(milliseconds: 400), () {
      engine.autoStartDemo();
      simulationReady = true;
      notifyListeners();
    });
  }

  Future<void> _restoreWallet() async {
    final prefs = await SharedPreferences.getInstance();
    final bal = prefs.getDouble('niter.wallet');
    if (bal != null) walletBalance = bal;
  }

  Future<void> _persistWallet() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble('niter.wallet', walletBalance);
  }

  void _onSimTick() {
    // Keep simulation and auth state in sync for listeners.
    lastEvent = 'tick';
    notifyListeners();
  }

  // ---------------------------------------------------------------- auth

  SimBus busById(String busId) => simBuses[busId]!;

  /// Verify a student by name + bus card number (exact demo accounts).
  bool verifyStudent(String name, String card) {
    final match = seedStudents.where(
        (s) => s.name.trim().toLowerCase() == name.trim().toLowerCase() && s.card.trim().toUpperCase() == card.trim().toUpperCase());
    if (match.isEmpty) return false;
    final s = match.first;
    user = TransportUser(
      role: 'transport-student',
      name: s.name,
      card: s.card,
      id: s.studentId,
      eligibleBuses: const ['SB1', 'SB2'],
    );
    _saveUser();
    return true;
  }

  /// Verify a teacher by name + teacher ID.
  bool verifyTeacher(String name, String id) {
    final match = seedTeachers.where(
        (t) => t.name.trim().toLowerCase() == name.trim().toLowerCase() && t.teacherId.trim().toUpperCase() == id.trim().toUpperCase());
    if (match.isEmpty) return false;
    final t = match.first;
    user = TransportUser(
      role: 'transport-teacher',
      name: t.name,
      id: t.teacherId,
      card: t.teacherId,
      eligibleBuses: const ['TB1', 'TB2'],
    );
    _saveUser();
    return true;
  }

  /// Driver login — only the assigned bus can be operated.
  bool driverLogin(String id, String password) {
    final match = seedDrivers.where(
        (d) => d.id.trim().toUpperCase() == id.trim().toUpperCase() && d.password == password);
    if (match.isEmpty) return false;
    final d = match.first;
    user = TransportUser(
      role: 'driver',
      name: d.name,
      id: d.id,
      busId: d.busId,
      eligibleBuses: [d.busId],
    );
    _saveUser();
    return true;
  }

  Future<void> logout() async {
    user = null;
    await Session.clear();
    notifyListeners();
  }

  Future<void> _saveUser() async {
    if (user != null) {
      await Session.save('demo-token', user!);
    }
    notifyListeners();
  }

  // ---------------------------------------------------------------- driver ops

  SimBus startTrip(String busId) {
    if (user?.role != 'driver') throw StateError('Driver auth required');
    if (!(user?.eligibleBuses.contains(busId) ?? false)) {
      throw StateError('Not authorized for this bus');
    }
    final b = engine.startTrip(busId);
    lastEvent = 'trip:start';
    notifyListeners();
    return b;
  }

  SimBus endTrip(String busId) {
    if (user?.role != 'driver') throw StateError('Driver auth required');
    final b = engine.endTrip(busId);
    lastEvent = 'trip:end';
    notifyListeners();
    return b;
  }

  // ---------------------------------------------------------------- boarding

  /// Simulated QR/NFC tap-in: verifies identity, records boarding, updates
  /// passenger count + occupancy, calculates fare, creates a transaction.
  BoardingRecord? board() {
    if (user == null) return null;
    final bus = _pickBoardBus();
    if (bus == null) return null;
    if (!bus.isActive && bus.tripStatus != 'Arrived') return null;

    final fare = bus.type == 'Student' ? 30.0 : 40.0;
    final rec = BoardingRecord(
      studentName: user!.name ?? 'Passenger',
      card: user!.card ?? '—',
      busName: bus.name,
      routeName: bus.routeName,
      time: DateTime.now(),
      fare: fare,
      tripId: bus.tripId.isEmpty ? 'TRIP-DEMO' : bus.tripId,
    );
    boardings.insert(0, rec);
    lastBoarding = rec;
    // Update occupancy + wallet (skip charge for pass-covered rides).
    bus.passengers = (bus.passengers + 1).clamp(0, bus.capacity);
    bus.occupancyPct = ((bus.passengers / bus.capacity) * 100).clamp(0, 100).round();
    if (fare > 0) {
      walletBalance -= fare;
      walletTx.insert(0, WalletTx(
            id: 'TX${DateTime.now().millisecondsSinceEpoch % 100000}',
            title: bus.name,
            subtitle: '${bus.routeName.replaceAll(' Route', '')} → NITER',
            amount: -fare,
            date: DateTime.now(),
            status: 'Completed',
            ref: 'TR${DateTime.now().millisecondsSinceEpoch % 100000}',
          ));
      _persistWallet();
    }
    lastEvent = 'boarding';
    notifyListeners();
    return rec;
  }

  SimBus? _pickBoardBus() {
    final eligible = user?.eligibleBuses ?? const <String>[];
    if (eligible.isEmpty) return null;
    // Prefer an active bus.
    for (final id in eligible) {
      if (simBuses[id]!.isActive) return simBuses[id];
    }
    return simBuses[eligible.first];
  }

  // ---------------------------------------------------------------- wallet

  void topUp(double amount, String method) {
    walletBalance += amount;
    walletTx.insert(0, WalletTx(
          id: 'TX${DateTime.now().millisecondsSinceEpoch % 100000}',
          title: '$method Top Up',
          subtitle: 'Wallet Reload',
          amount: amount,
          date: DateTime.now(),
          status: 'Success',
          ref: 'TR${DateTime.now().millisecondsSinceEpoch % 100000}',
        ));
    _persistWallet();
    lastEvent = 'topup';
    notifyListeners();
  }

  // ---------------------------------------------------------------- emergency

  void triggerEmergency(String type) {
    activeEmergency = '${user?.name ?? 'Passenger'} • $type • ${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}';
    lastEvent = 'emergency:new';
    notifyListeners();
  }

  void clearEmergency() {
    activeEmergency = null;
    notifyListeners();
  }

  double get totalSpent => walletTx.where((t) => t.amount < 0).fold(0.0, (s, t) => s + t.amount.abs());

  int get tripsTaken => boardings.length + 28; // demo baseline

  @override
  void dispose() {
    _autoStartTimer?.cancel();
    engine.stop();
    _persistDebounce?.cancel();
    super.dispose();
  }
}
