import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // The 3 EXACT MAIN COLORS requested by user:
  static const Color brandPink = Color(0xFFFF4783); // #ff4783
  static const Color brandLime = Color(0xFFD0F81B); // #d0f81b
  static const Color brandWhite = Color(0xFFFFFFFF); // #ffffff

  // Neutral contrast & dark text for white background readability
  static const Color brandDark = Color(0xFF0F172A);
  static const Color slateBg = Color(0xFFF8FAFC);
  static const Color slateBorder = Color(0xFFE2E8F0);
  static const Color slateMuted = Color(0xFF64748B);

  // Financial Semantics mapped strictly to the 3 main colors & WCAG AA:
  static const Color thuColor = brandPink; // Tiền vào / Thu / Doanh thu: #FF4783
  static const Color chiColor = brandDark; // Tiền ra / Chi / Chi phí: #0F172A (độ tương phản cao 16:1 trên nền trắng)
  static const Color proBadgeColor = brandLime; // Huy hiệu gói PRO & Điểm nhấn công nghệ AI: #D0F81B
  static const Color onProBadgeColor = brandDark; // Bắt buộc dùng chữ đen/slate trên nền Lime #D0F81B

  static ThemeData getTheme(BuildContext context) {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: slateBg,
      colorScheme: const ColorScheme.light(
        primary: brandPink,
        onPrimary: Colors.white,
        primaryContainer: brandPink,
        onPrimaryContainer: Colors.white,
        secondary: brandLime,
        onSecondary: brandDark,
        secondaryContainer: Color(0xFFF1F5F9),
        onSecondaryContainer: brandDark,
        surface: brandWhite,
        onSurface: brandDark,
        surfaceContainerHighest: slateBorder,
        onSurfaceVariant: slateMuted,
        outline: Color(0xFFCBD5E1),
        outlineVariant: slateBorder,
        error: brandPink,
        errorContainer: Color(0xFFFFE4EE),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: brandDark,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: brandDark,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.3,
        ),
        iconTheme: IconThemeData(color: brandDark),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: slateBorder, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: slateBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: slateBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: brandPink, width: 1.5),
        ),
        labelStyle: const TextStyle(color: slateMuted, fontSize: 14),
        hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
      ),
      textTheme: GoogleFonts.robotoFlexTextTheme(
        Theme.of(context).textTheme,
      ).copyWith(
        displayLarge: GoogleFonts.robotoFlex(
          fontSize: 56,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.02,
          height: 1.14,
        ),
        headlineLarge: GoogleFonts.robotoFlex(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          height: 1.25,
        ),
        titleMedium: GoogleFonts.robotoFlex(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          height: 1.33,
        ),
        bodyLarge: GoogleFonts.robotoFlex(
          fontSize: 16,
          fontWeight: FontWeight.normal,
          height: 1.5,
        ),
        bodySmall: GoogleFonts.robotoFlex(
          fontSize: 14,
          fontWeight: FontWeight.normal,
          height: 1.43,
        ),
        labelMedium: GoogleFonts.robotoFlex(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.05,
          height: 1.33,
        ),
      ),
    );
  }
}
