import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';
import '../models/models.dart';

/// Thin typed REST client. All calls hit the same NITER Transport backend
/// that powers the website and the admin dashboard.
class ApiService {
  static String? token;

  Map<String, String> _headers() => {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  Uri _u(String path) => Uri.parse('${AppConfig.apiBase}$path');

  Future<dynamic> _send(Future<http.Response> Function() fn) async {
    try {
      final res = await fn();
      final body = res.body.isEmpty ? null : jsonDecode(res.body);
      if (res.statusCode >= 200 && res.statusCode < 300) return body;
      final msg = body is Map && body['error'] != null ? body['error'].toString() : 'Request failed (${res.statusCode})';
      throw ApiException(res.statusCode, msg);
    } on ApiException {
      rethrow;
    } catch (_) {
      throw ApiException(0, 'Connection temporarily unavailable');
    }
  }

  Future<dynamic> get(String path) => _send(() => http.get(_u(path), headers: _headers()));
  Future<dynamic> post(String path, [Map<String, dynamic>? body]) =>
      _send(() => http.post(_u(path), headers: _headers(), body: body == null ? null : jsonEncode(body)));
  Future<dynamic> put(String path, [Map<String, dynamic>? body]) =>
      _send(() => http.put(_u(path), headers: _headers(), body: body == null ? null : jsonEncode(body)));

  // ---------------- Auth ----------------
  Future<(String, TransportUser)> verifyTransport(String name, String card) async {
    final res = await post('/auth/transport/verify', {'name': name, 'card': card});
    return (res['token'] as String, TransportUser.fromJson(res['user'] as Map<String, dynamic>));
  }

  Future<(String, TransportUser)> driverLogin(String driverId, String password) async {
    final res = await post('/auth/transport/driver-login', {'driverId': driverId, 'password': password});
    return (res['token'] as String, TransportUser.fromJson(res['user'] as Map<String, dynamic>));
  }

  // ---------------- Transport ----------------
  Future<List<BusInfo>> publicBuses() async {
    final res = await get('/transport/public');
    return ((res['buses'] as List?) ?? []).map((b) => BusInfo.fromJson(b as Map<String, dynamic>)).toList();
  }

  Future<List<RouteInfo>> routes() async {
    final res = await get('/transport/routes');
    return ((res as List?) ?? []).map((r) => RouteInfo.fromJson(r as Map<String, dynamic>)).toList();
  }

  Future<Map<String, LiveBus>> live() async {
    final res = await get('/transport/live');
    final live = (res['live'] as Map<String, dynamic>?) ?? {};
    return live.map((k, v) => MapEntry(k, LiveBus.fromJson(v as Map<String, dynamic>)));
  }

  Future<Trip> startTrip(String busId) async {
    final res = await post('/transport/trip/start', {'busId': busId});
    return Trip.fromJson(res['trip'] as Map<String, dynamic>);
  }

  Future<Trip> endTrip(String tripId) async {
    final res = await post('/transport/trip/end', {'tripId': tripId});
    return Trip.fromJson(res['trip'] as Map<String, dynamic>);
  }

  Future<void> reportGps(String busId, double lat, double lng, double speed) =>
      post('/transport/gps', {'busId': busId, 'lat': lat, 'lng': lng, 'speed': speed});

  Future<Map<String, dynamic>> boarding(String card, String busId, [String tapType = 'IN']) =>
      post('/transport/boarding', {'card': card, 'busId': busId, 'tapType': tapType}) as Future<Map<String, dynamic>>;

  Future<Map<String, dynamic>> emergency(String busId, String type, [String note = '']) =>
      post('/transport/emergency', {'busId': busId, 'type': type, 'note': note}) as Future<Map<String, dynamic>>;

  Future<Map<String, dynamic>> aiCrowd(String busId) async =>
      (await get('/ai/crowd?busId=$busId')) as Map<String, dynamic>;

  Future<String> aiChat(String message) async {
    final res = await post('/ai/chat', {'message': message});
    return res['reply'] as String? ?? '';
  }
}

class ApiException implements Exception {
  final int status;
  final String message;
  ApiException(this.status, this.message);
  @override
  String toString() => message;
}
