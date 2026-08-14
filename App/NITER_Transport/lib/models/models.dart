/// Domain models shared by every screen.
library;

class BusInfo {
  final String id;
  final String name;
  final String type; // Student | Teacher
  final int capacity;
  final String departure;
  final String routeId;
  final String routeName;
  final String driverName;
  final String tripStatus; // Inactive | Active | Arrived
  final int passengers;
  final int occupancyPct;
  final String occupancyLabel;
  final String trafficStatus;
  final int? etaToCampus;
  final String lastUpdate;

  const BusInfo({
    required this.id, required this.name, required this.type, required this.capacity,
    required this.departure, required this.routeId, required this.routeName, required this.driverName,
    required this.tripStatus, required this.passengers, required this.occupancyPct,
    required this.occupancyLabel, required this.trafficStatus, this.etaToCampus, required this.lastUpdate,
  });

  factory BusInfo.fromJson(Map<String, dynamic> j) => BusInfo(
        id: j['id'] as String? ?? '',
        name: j['name'] as String? ?? '',
        type: j['type'] as String? ?? 'Student',
        capacity: (j['capacity'] as num?)?.toInt() ?? 0,
        departure: j['departure'] as String? ?? '',
        routeId: j['routeId'] as String? ?? '',
        routeName: j['routeName'] as String? ?? '',
        driverName: j['driverName'] as String? ?? '',
        tripStatus: j['tripStatus'] as String? ?? 'Inactive',
        passengers: (j['passengers'] as num?)?.toInt() ?? 0,
        occupancyPct: (j['occupancyPct'] as num?)?.toInt() ?? 0,
        occupancyLabel: j['occupancyLabel'] as String? ?? 'Available',
        trafficStatus: j['trafficStatus'] as String? ?? 'Traffic information unavailable',
        etaToCampus: (j['etaToCampus'] as num?)?.toInt(),
        lastUpdate: j['lastUpdate'] as String? ?? '',
      );
}

class LiveBus {
  final String busId;
  final String? tripId;
  final String busName;
  final String busType;
  final String routeName;
  final String driverName;
  final String tripStatus;
  final double lat;
  final double lng;
  final double heading;
  final double speedKmh;
  final int passengers;
  final int capacity;
  final int occupancyPct;
  final String currentStop;
  final String? nextStop;
  final double? distToNext;
  final double? distToCampus;
  final int? etaToNext;
  final int? etaToCampus;
  final String trafficStatus;
  final String mode; // demo-simulation | live-gps

  const LiveBus({
    required this.busId, this.tripId, required this.busName, required this.busType, required this.routeName,
    required this.driverName, required this.tripStatus, required this.lat, required this.lng,
    required this.heading, required this.speedKmh, required this.passengers, required this.capacity,
    required this.occupancyPct, required this.currentStop, this.nextStop, this.distToNext,
    this.distToCampus, this.etaToNext, this.etaToCampus, required this.trafficStatus, required this.mode,
  });

  factory LiveBus.fromJson(Map<String, dynamic> j) {
    final pos = (j['position'] as Map<String, dynamic>?) ?? const {};
    return LiveBus(
      busId: j['busId'] as String? ?? '',
      tripId: j['tripId'] as String?,
      busName: j['busName'] as String? ?? j['name'] as String? ?? '',
      busType: j['busType'] as String? ?? 'Student',
      routeName: j['routeName'] as String? ?? '',
      driverName: j['driverName'] as String? ?? '',
      tripStatus: j['tripStatus'] as String? ?? 'Inactive',
      lat: (pos['lat'] as num?)?.toDouble() ?? 0,
      lng: (pos['lng'] as num?)?.toDouble() ?? 0,
      heading: (pos['heading'] as num?)?.toDouble() ?? 0,
      speedKmh: (j['speedKmh'] as num?)?.toDouble() ?? 0,
      passengers: (j['passengers'] as num?)?.toInt() ?? 0,
      capacity: (j['capacity'] as num?)?.toInt() ?? 0,
      occupancyPct: (j['occupancyPct'] as num?)?.toInt() ?? 0,
      currentStop: j['currentStop'] as String? ?? '—',
      nextStop: j['nextStop'] as String?,
      distToNext: (j['distToNext'] as num?)?.toDouble(),
      distToCampus: (j['distToCampus'] as num?)?.toDouble(),
      etaToNext: (j['etaToNext'] as num?)?.toInt(),
      etaToCampus: (j['etaToCampus'] as num?)?.toInt(),
      trafficStatus: j['trafficNote'] as String? ?? j['trafficStatus'] as String? ?? '—',
      mode: j['mode'] as String? ?? 'simulation',
    );
  }
}

class RouteInfo {
  final String id;
  final String name;
  final String type;
  final String departure;
  final bool configurable;
  final List<Stop> stops;

  const RouteInfo({required this.id, required this.name, required this.type, required this.departure, required this.configurable, required this.stops});

  factory RouteInfo.fromJson(Map<String, dynamic> j) => RouteInfo(
        id: j['id'] as String? ?? '',
        name: j['name'] as String? ?? '',
        type: j['type'] as String? ?? 'Student',
        departure: j['departure'] as String? ?? '',
        configurable: j['configurable'] as bool? ?? false,
        stops: ((j['stops'] as List?) ?? []).map((s) => Stop.fromJson(s as Map<String, dynamic>)).toList(),
      );
}

class Stop {
  final String name;
  final double lat;
  final double lng;

  const Stop({required this.name, required this.lat, required this.lng});
  factory Stop.fromJson(Map<String, dynamic> j) => Stop(
        name: j['name'] as String? ?? '',
        lat: (j['lat'] as num?)?.toDouble() ?? 0,
        lng: (j['lng'] as num?)?.toDouble() ?? 0,
      );
}

class TransportUser {
  final String role; // transport-student | transport-teacher | driver | admin
  final String? name;
  final String? card;
  final String? id;
  final String? busId;
  final List<String> eligibleBuses;

  const TransportUser({required this.role, this.name, this.card, this.id, this.busId, this.eligibleBuses = const []});

  factory TransportUser.fromJson(Map<String, dynamic> j) => TransportUser(
        role: j['role'] as String? ?? 'student',
        name: j['name'] as String?,
        card: j['card'] as String?,
        id: j['id'] as String? ?? j['teacherId'] as String?,
        busId: j['busId'] as String?,
        eligibleBuses: ((j['eligibleBuses'] as List?) ?? []).map((e) => e.toString()).toList(),
      );
}

class Trip {
  final String tripId;
  final String busId;
  final String busName;
  final String status;
  final int passengers;
  final double distanceKm;

  const Trip({required this.tripId, required this.busId, required this.busName, required this.status, required this.passengers, required this.distanceKm});

  factory Trip.fromJson(Map<String, dynamic> j) => Trip(
        tripId: j['tripId'] as String? ?? '',
        busId: j['busId'] as String? ?? '',
        busName: j['busName'] as String? ?? '',
        status: j['status'] as String? ?? '',
        passengers: (j['passengers'] as num?)?.toInt() ?? 0,
        distanceKm: (j['distanceKm'] as num?)?.toDouble() ?? 0,
      );
}
