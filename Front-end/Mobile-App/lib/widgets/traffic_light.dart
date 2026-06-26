import 'package:flutter/material.dart';

class TrafficLightWrapper extends StatelessWidget {
  final Widget child;
  final String mucDoTinCay;

  const TrafficLightWrapper({
    super.key,
    required this.child,
    required this.mucDoTinCay,
  });

  @override
  Widget build(BuildContext context) {
    Color borderColor;
    List<BoxShadow>? boxShadows;

    switch (mucDoTinCay) {
      case 'Cao':
        borderColor = Colors.green;
        break;
      case 'Trung Binh':
        borderColor = Colors.orange;
        break;
      case 'Thap':
      default:
        borderColor = Colors.red;
        boxShadows = [
          BoxShadow(
            color: Colors.red.withValues(alpha: 0.2),
            blurRadius: 10,
            spreadRadius: 2,
          ),
        ];
        break;
    }

    return Container(
      decoration: BoxDecoration(
        border: Border.all(
          color: borderColor,
          width: 3.0,
        ),
        borderRadius: BorderRadius.circular(16.0),
        boxShadow: boxShadows,
        color: Colors.white,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(13.0),
        child: child,
      ),
    );
  }
}
