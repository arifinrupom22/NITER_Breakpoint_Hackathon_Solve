import 'dart:async';
import 'dart:math' as math;

import 'package:latlong2/latlong.dart';

import '../data/seed_data.dart';

/// A simulated bus driving along its configured route.
///
/// This mirrors the DEMO SIMULATION engine in the website
/// (`js/transport.js`): the same routes, stops, ETA math and labels.
class SimBus {
  final SeedBus seed;
  final SeedRoute route;

  String tripId = '';
  String tripStatus = 'Inactive'; // Inactive | Active | Arrived
  int stopIdx = 0;
  double progress = 0; // 0..1 within the current segment
  LatLng position;
  double heading = 0;
  double speedKmh = 0;
  int passengers = 0;
  int occupancyPct = 0;
  String trafficStatus = 'On Time';
  double trafficFactor = 1.0;
  int? etaToCampus;
  double? distToCampus;
  String lastUpdate = '';
  bool arriving = false;

  SimBus(this.seed, this.route) : position = route.coords.first;

  String get id => seed.id;
  String get name => seed.name;
  String get type => seed.type;
  int get capacity => seed.capacity;
  String get routeName => route.name;
  String get departure => seed.departure;

  String get currentStop => route.stops[math.min(stopIdx, route.stops.length - 1)].name;
  String? get nextStop =>
      stopIdx < route.stops.length - 1 ? route.stops[stopIdx + 1].name : null;
  String get occupancyLabel => occupancyLabelFor(occupancyPct);

  bool get isActive => tripStatus == 'Active';
}

String occupancyLabelFor(int pct) {
  if (pct >= 95) return 'Full';
  if (pct >= 75) return 'Crowded';
  if (pct >= 50) return 'Moderate';
  return 'Available';
}

/// Drives every `SimBus` forward in time. One tick advances each active bus
/// along its route; inactive buses sit at their departure point.
class SimulationEngine {
  final Map<String, SimBus> buses;
  Timer? _timer;
  final Duration tickInterval;
  final void Function() onTick;

  /// Seconds of "real" travel represented by one segment.
  final double segTime;
  static const double segTimeDefault = 8 * 60; // 8 minutes per segment

  SimulationEngine({
    required this.buses,
    required this.onTick,
    this.tickInterval = const Duration(seconds: 1),
    this.segTime = segTimeDefault,
  });

  /// Estimated distance (km) between two lat/lng points (Haversine).
  static double segDist(LatLng a, LatLng b) {
    const r = 6371.0;
    final dLat = (b.latitude - a.latitude) * math.pi / 180;
    final dLng = (b.longitude - a.longitude) * math.pi / 180;
    final s = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(a.latitude * math.pi / 180) *
            math.cos(b.latitude * math.pi / 180) *
            math.sin(dLng / 2) *
            math.sin(dLng / 2);
    final c = 2 * math.atan2(math.sqrt(s), math.sqrt(1 - s));
    return r * c;
  }

  static LatLng lerp(LatLng a, LatLng b, double t) =>
      LatLng(a.latitude + (b.latitude - a.latitude) * t,
          a.longitude + (b.longitude - a.longitude) * t);

  void start() {
    _timer?.cancel();
    _timer = Timer.periodic(tickInterval, (_) => tick());
  }

  void stop() {
    _timer?.cancel();
    _timer = null;
  }

  /// Begins a trip for the given bus: creates a Trip ID, sets status ACTIVE,
  /// starts GPS-like movement, updates occupancy.
  SimBus startTrip(String busId) {
    final b = buses[busId];
    if (b == null) throw ArgumentError('Unknown bus $busId');
    if (b.isActive) return b;
    b.tripId = 'TRIP-${_randId(6)}';
    b.tripStatus = 'Active';
    b.stopIdx = 0;
    b.progress = 0;
    b.position = b.route.coords.first;
    b.passengers = math.max(4, b.capacity ~/ 5);
    _recomputeOccupancy(b);
    b.trafficStatus = _rollTraffic();
    b.trafficFactor = _trafficFactor(b.trafficStatus);
    b.lastUpdate = _now();
    return b;
  }

  /// Ends the current trip and parks the bus at the campus.
  SimBus endTrip(String busId) {
    final b = buses[busId];
    if (b == null) throw ArgumentError('Unknown bus $busId');
    if (b.tripStatus == 'Inactive') return b;
    b.tripStatus = 'Inactive';
    b.stopIdx = 0;
    b.progress = 0;
    b.position = b.route.coords.last;
    b.speedKmh = 0;
    b.passengers = 0;
    _recomputeOccupancy(b);
    b.lastUpdate = _now();
    return b;
  }

  /// Wall-clock seconds for the whole demo trip (departure → campus).
  static const double demoTripSeconds = 30;

  void _tick() {
    for (final b in buses.values) {
      if (!b.isActive) continue;
      final coords = b.route.coords;
      // Advance along the current segment. Paced so a full demo trip takes
      // ~demoTripSeconds of wall-clock time, while ETAs stay realistic.
      final segs = (coords.length - 1).clamp(1, 99);
      final tickSeconds = tickInterval.inMilliseconds / 1000.0;
      final stepPerTick = 1 / (demoTripSeconds / segs / tickSeconds);
      b.progress += stepPerTick;
      if (b.progress >= 1) {
        if (b.stopIdx < coords.length - 2) {
          b.stopIdx++;
          b.progress = 0;
        } else {
          // Arrived at the final stop (campus).
          b.stopIdx = coords.length - 1;
          b.progress = 0;
          b.tripStatus = 'Arrived';
          b.position = coords.last;
          b.speedKmh = 0;
          b.lastUpdate = _now();
          continue;
        }
      }
      final a = coords[b.stopIdx];
      final c = coords[b.stopIdx + 1];
      b.position = lerp(a, c, b.progress);
      b.heading = _heading(a, c);
      b.speedKmh = (35 + b.trafficFactor * 10 + math.Random().nextDouble() * 8)
          .clamp(8, 55);
      // ETA in real minutes: segTime is seconds per segment, so /60 → minutes.
      b.etaToCampus = math.max(
          1,
          ((coords.length - 1 - b.stopIdx - b.progress) * segTime /
                  60 *
                  b.trafficFactor)
              .round());
      double rest = 0;
      for (var k = b.stopIdx + 1; k < coords.length - 1; k++) {
        rest += segDist(coords[k], coords[k + 1]);
      }
      b.distToCampus = double.parse(
          (segDist(b.position, c) + rest).toStringAsFixed(1));
      // Passengers grow along the route.
      b.passengers = math.min(
          b.capacity,
          math.max(4, (b.capacity * (0.2 + 0.5 * (b.stopIdx / coords.length)) +
                  math.Random().nextInt(4))
              .round()));
      _recomputeOccupancy(b);
      b.lastUpdate = _now();
    }
  }

  void tick() {
    _tick();
    onTick();
  }

  void _recomputeOccupancy(SimBus b) {
    b.occupancyPct = ((b.passengers / b.capacity) * 100).clamp(0, 100).round();
  }

  String _rollTraffic() {
    const pool = ['On Time', 'On Time', 'Slight Delay', 'Slight Delay', 'Delayed', 'Heavy Traffic'];
    return pool[math.Random().nextInt(pool.length)];
  }

  double _trafficFactor(String status) {
    switch (status) {
      case 'On Time':
        return 1.0;
      case 'Slight Delay':
        return 1.15;
      case 'Delayed':
        return 1.4;
      case 'Heavy Traffic':
        return 1.8;
      default:
        return 1.0;
    }
  }

  double _heading(LatLng a, LatLng b) {
    final dy = b.latitude - a.latitude;
    final dx = b.longitude - a.longitude;
    final deg = math.atan2(dx, dy) * 180 / math.pi;
    return deg < 0 ? deg + 360 : deg;
  }

  String _randId(int n) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    final r = math.Random();
    return List.generate(n, (_) => chars[r.nextInt(chars.length)]).join();
  }

  String _now() {
    final t = DateTime.now();
    String two(int v) => v.toString().padLeft(2, '0');
    return '${two(t.hour)}:${two(t.minute)}:${two(t.second)}';
  }

  /// Auto-starts the demo trips so the map shows moving buses immediately.
  void autoStartDemo() {
    for (final b in buses.values) {
      if (b.seed.id == 'SB1' || b.seed.id == 'TB1') {
        startTrip(b.id);
      }
    }
  }
}
