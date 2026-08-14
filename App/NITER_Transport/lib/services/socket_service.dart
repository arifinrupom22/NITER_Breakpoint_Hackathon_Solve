import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config.dart';
import '../models/models.dart';

/// Realtime connection to the NITER Transport backend.
/// The same Socket.IO hub that drives the website and admin dashboard.
class SocketService {
  io.Socket? _socket;
  void Function(Map<String, dynamic> state)? onState;
  void Function(Map<String, dynamic> event)? onEvent;

  void connect(String token) {
    disconnect();
    _socket = io.io(
      AppConfig.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .setAuth({'token': token})
          .enableAutoConnect()
          .build(),
    );
    _socket!.onConnect((_) {
      _socket!.emit('auth', {'token': token});
    });
    _socket!.on('transport:state', (data) {
      if (data != null) onState?.call(data as Map<String, dynamic>);
    });
    _socket!.onAny((event, data) {
      if (event == 'trip:start' || event == 'trip:end' || event == 'notification:new' || event == 'emergency:new') {
        onEvent?.call({'event': event, 'data': data});
      }
    });
  }

  void disconnect() {
    _socket?.dispose();
    _socket = null;
  }
}

/// Parses the shared transport state payload into typed objects.
Map<String, LiveBus> parseLive(Map<String, dynamic> state) {
  final live = (state['live'] as Map<String, dynamic>?) ?? {};
  return live.map((k, v) => MapEntry(k, LiveBus.fromJson(v as Map<String, dynamic>)));
}
