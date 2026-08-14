library;

import 'package:latlong2/latlong.dart';

/// Seed / demo data — mirrors the NITER Smart Campus website exactly
/// (same routes, departure times, students, drivers). The app uses this
/// data for the DEMO SIMULATION mode when no backend is reachable.

class SeedStop {
  final String name;
  final LatLng pos;
  const SeedStop(this.name, this.pos);
}

class SeedRoute {
  final String id;
  final String name;
  final String busId;
  final String departure;
  final bool configurable;
  final List<SeedStop> stops;

  const SeedRoute({
    required this.id,
    required this.name,
    required this.busId,
    required this.departure,
    required this.configurable,
    required this.stops,
  });

  List<LatLng> get coords => stops.map((s) => s.pos).toList();
  List<String> get stopNames => stops.map((s) => s.name).toList();
}

class SeedBus {
  final String id;
  final String name;
  final String type; // Student | Teacher
  final int capacity;
  final String routeId;
  final String routeName;
  final String departure;
  final String driverName;
  const SeedBus({
    required this.id,
    required this.name,
    required this.type,
    required this.capacity,
    required this.routeId,
    required this.routeName,
    required this.departure,
    required this.driverName,
  });
}

class SeedStudent {
  final String name;
  final String card;
  final String studentId;
  final String dept;
  final String batch;
  const SeedStudent({required this.name, required this.card, required this.studentId, required this.dept, required this.batch});
}

class SeedTeacher {
  final String name;
  final String teacherId;
  final String dept;
  const SeedTeacher({required this.name, required this.teacherId, required this.dept});
}

class SeedDriver {
  final String id;
  final String name;
  final String busId;
  final String busName;
  final String routeName;
  final String password;
  const SeedDriver({
    required this.id,
    required this.name,
    required this.busId,
    required this.busName,
    required this.routeName,
    required this.password,
  });
}

const niterCampusName = 'NITER Campus';

/// NITER campus (Nayarhat, Savar, Dhaka).
const campusPos = LatLng(23.8470, 90.2760);

const List<SeedRoute> seedRoutes = [
  SeedRoute(
    id: 'r1',
    name: 'Khamarbari Route',
    busId: 'SB1',
    departure: '6:40 AM',
    configurable: false,
    stops: [
      SeedStop('Khamarbari', LatLng(23.7895, 90.3985)),
      SeedStop('Asadgate', LatLng(23.7780, 90.3900)),
      SeedStop('Shyamoli', LatLng(23.7745, 90.3710)),
      SeedStop('Kallyanpur', LatLng(23.7650, 90.3620)),
      SeedStop('Technical', LatLng(23.7820, 90.3525)),
      SeedStop('Gabtoli', LatLng(23.7805, 90.3495)),
      SeedStop('Savar', LatLng(23.8583, 90.2667)),
      SeedStop(niterCampusName, LatLng(23.8470, 90.2760)),
    ],
  ),
  SeedRoute(
    id: 'r2',
    name: 'Uttara Route',
    busId: 'SB2',
    departure: '6:30 AM',
    configurable: true,
    stops: [
      SeedStop('Uttara', LatLng(23.8759, 90.3795)),
      SeedStop('Airport', LatLng(23.8567, 90.4056)),
      SeedStop('Khilkhet', LatLng(23.8320, 90.4050)),
      SeedStop('Banani', LatLng(23.7940, 90.4050)),
      SeedStop('Savar', LatLng(23.8583, 90.2667)),
      SeedStop(niterCampusName, LatLng(23.8470, 90.2760)),
    ],
  ),
  SeedRoute(
    id: 'r3',
    name: 'Mirpur Route',
    busId: 'TB1',
    departure: '6:45 AM',
    configurable: false,
    stops: [
      SeedStop('Mirpur', LatLng(23.8070, 90.3640)),
      SeedStop('Technical', LatLng(23.7820, 90.3525)),
      SeedStop('Gabtoli', LatLng(23.7805, 90.3495)),
      SeedStop('Savar', LatLng(23.8583, 90.2667)),
      SeedStop(niterCampusName, LatLng(23.8470, 90.2760)),
    ],
  ),
  SeedRoute(
    id: 'r4',
    name: 'Shyamoli Route',
    busId: 'TB2',
    departure: '6:45 AM',
    configurable: true,
    stops: [
      SeedStop('Shyamoli', LatLng(23.7745, 90.3710)),
      SeedStop('Kallyanpur', LatLng(23.7650, 90.3620)),
      SeedStop('Gabtoli', LatLng(23.7805, 90.3495)),
      SeedStop('Savar', LatLng(23.8583, 90.2667)),
      SeedStop(niterCampusName, LatLng(23.8470, 90.2760)),
    ],
  ),
];

const List<SeedBus> seedBuses = [
  SeedBus(
    id: 'SB1',
    name: 'Student Bus 1',
    type: 'Student',
    capacity: 50,
    routeId: 'r1',
    routeName: 'Khamarbari Route',
    departure: '6:40 AM',
    driverName: 'Md. Karim',
  ),
  SeedBus(
    id: 'SB2',
    name: 'Student Bus 2',
    type: 'Student',
    capacity: 50,
    routeId: 'r2',
    routeName: 'Uttara Route',
    departure: '6:30 AM',
    driverName: 'Abdul Latif',
  ),
  SeedBus(
    id: 'TB1',
    name: 'Teacher Bus 1',
    type: 'Teacher',
    capacity: 40,
    routeId: 'r3',
    routeName: 'Mirpur Route',
    departure: '6:45 AM',
    driverName: 'Shafiqul Islam',
  ),
  SeedBus(
    id: 'TB2',
    name: 'Teacher Bus 2',
    type: 'Teacher',
    capacity: 40,
    routeId: 'r4',
    routeName: 'Shyamoli Route',
    departure: '6:45 AM',
    driverName: 'Jahangir Alam',
  ),
];

/// Exactly these three demo students can access live student bus locations.
const List<SeedStudent> seedStudents = [
  SeedStudent(name: 'Arifin Rupom', card: 'BUS06', studentId: 'CS 2405006', dept: 'CSE', batch: 'CSE-23'),
  SeedStudent(name: 'Sneha Rahman', card: 'BUS26', studentId: 'CS 2405026', dept: 'CSE', batch: 'CSE-23'),
  SeedStudent(name: 'Nabila Nawshin', card: 'BUS32', studentId: 'CS 2405032', dept: 'CSE', batch: 'CSE-23'),
];

const List<SeedTeacher> seedTeachers = [
  SeedTeacher(name: 'Dr. Rahman', teacherId: 'T001', dept: 'CSE'),
  SeedTeacher(name: 'Prof. Ahmed', teacherId: 'T002', dept: 'EEE'),
  SeedTeacher(name: 'Ms. Sultana', teacherId: 'T003', dept: 'Textile Engineering'),
];

const List<SeedDriver> seedDrivers = [
  SeedDriver(id: 'DRV1', name: 'Md. Karim', busId: 'SB1', busName: 'Student Bus 1', routeName: 'Khamarbari Route', password: 'driver123'),
  SeedDriver(id: 'DRV2', name: 'Abdul Latif', busId: 'SB2', busName: 'Student Bus 2', routeName: 'Uttara Route', password: 'driver123'),
  SeedDriver(id: 'DRV3', name: 'Shafiqul Islam', busId: 'TB1', busName: 'Teacher Bus 1', routeName: 'Mirpur Route', password: 'driver123'),
  SeedDriver(id: 'DRV4', name: 'Jahangir Alam', busId: 'TB2', busName: 'Teacher Bus 2', routeName: 'Shyamoli Route', password: 'driver123'),
];

SeedRoute routeById(String id) => seedRoutes.firstWhere((r) => r.id == id);

SeedRoute routeForBus(String busId) => seedRoutes.firstWhere((r) => r.busId == busId);

/// Occupancy label from percentage (formula: passengers / capacity x 100).
String occupancyLabel(int pct) {
  if (pct >= 95) return 'Full';
  if (pct >= 75) return 'Crowded';
  if (pct >= 50) return 'Moderate';
  return 'Available';
}
