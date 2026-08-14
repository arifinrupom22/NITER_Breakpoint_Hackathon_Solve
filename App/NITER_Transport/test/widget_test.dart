// NITER Transport — widget smoke tests.
//
// Verifies the app boots through the splash screen, the home shell renders the
// core entry points, and the demo simulation badge is visible.

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:niter_transport/main.dart';

void main() {
  testWidgets('Splash screen renders brand + initializing state', (tester) async {
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(const NiterTransportApp());
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('NITER Transport'), findsOneWidget);
    expect(find.text('Smart Campus Transportation'), findsOneWidget);
    expect(find.text('INITIALIZING SYSTEM'), findsOneWidget);
  });

  testWidgets('App navigates splash → home shell with hero and demo badge', (tester) async {
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(const NiterTransportApp());
    // Let the splash timer finish and the home route settle.
    await tester.pump(const Duration(seconds: 3));
    await tester.pump(const Duration(milliseconds: 800));

    expect(find.textContaining('Your Campus'), findsOneWidget);
    expect(find.text('See Bus Location'), findsOneWidget);
    expect(find.text('Driver Login'), findsOneWidget);

    // The DEMO SIMULATION chip sits at the bottom of the lazy list —
    // scroll it into view instead of expecting it in the first viewport.
    await tester.scrollUntilVisible(find.text('DEMO SIMULATION'), 300,
        scrollable: find.byType(Scrollable).first);
    expect(find.text('DEMO SIMULATION'), findsOneWidget);
  });
}
