/// NITER Transport — central configuration.
///
/// The mobile app talks to the SAME backend as the website and admin
/// dashboard. There is exactly one source of transport state.
class AppConfig {
  /// Backend base URL.
  ///
  /// - Android emulator: http://10.0.2.2:3001
  /// - iOS simulator / desktop: http://localhost:3001
  /// - Physical phone on the same Wi-Fi: http://<your-pc-ip>:3001
  static const String apiBase = String.fromEnvironment(
    'API_BASE',
    defaultValue: 'http://10.0.2.2:3001/api',
  );

  static const String socketUrl = String.fromEnvironment(
    'SOCKET_URL',
    defaultValue: 'http://10.0.2.2:3001',
  );

  static const String niterCampusName = 'NITER Campus';
  static const double campusLat = 23.8995;
  static const double campusLng = 90.2563;
}
