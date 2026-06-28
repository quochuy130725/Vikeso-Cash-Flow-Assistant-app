import 'package:flutter/material.dart';

class CameraScreen extends StatelessWidget {
  const CameraScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            // Camera viewfinder mockup (Gray/Dark background with camera icon in the center)
            Positioned.fill(
              bottom: 120, // Leave space for control buttons at the bottom
              child: Container(
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[900],
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.grey[800]!, width: 2),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.camera_alt_outlined,
                        size: 80,
                        color: Colors.grey[600],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Hướng khung hình vào hoá đơn/biên lai',
                        style: TextStyle(
                          color: Colors.grey[500],
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            
            // Bottom control bar
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              height: 120,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Manual Input button on the bottom left
                    SizedBox(
                      width: 120,
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: TextButton(
                          onPressed: () {
                            Navigator.pop(context);
                          },
                          style: TextButton.styleFrom(
                            foregroundColor: Colors.white,
                          ),
                          child: const Text(
                            'Nhập thủ công',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ),
                    
                    // Large Capture FloatingActionButton
                    FloatingActionButton.large(
                      onPressed: () {
                        Navigator.pushNamed(context, '/split');
                      },
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.black,
                      shape: const CircleBorder(),
                      child: const Icon(Icons.camera, size: 36),
                    ),
                    
                    // Empty widget or helper text to balance the row layout
                    const SizedBox(width: 120),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
