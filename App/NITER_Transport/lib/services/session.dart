import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';

class Session {
  static const _tokenKey = 'niter.token';
  static const _userKey = 'niter.user';

  static Future<void> save(String token, TransportUser user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode({
          'role': user.role,
          'name': user.name,
          'card': user.card,
          'id': user.id,
          'busId': user.busId,
          'eligibleBuses': user.eligibleBuses,
        }));
  }

  static Future<String?> token() async => (await SharedPreferences.getInstance()).getString(_tokenKey);

  static Future<TransportUser?> user() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_userKey);
    if (raw == null) return null;
    return TransportUser.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }
}
