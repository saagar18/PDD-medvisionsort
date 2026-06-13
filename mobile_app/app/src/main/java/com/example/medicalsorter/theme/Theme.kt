package com.example.medicalsorter.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = lightColorScheme(
    primary = PrimaryTeal,
    onPrimary = Color.White,
    secondary = SecondaryIndigo,
    onSecondary = Color.White,
    background = DeepNavy,
    onBackground = TextPrimary,
    surface = SlateDark,
    onSurface = TextPrimary,
    surfaceVariant = BorderGlass,
    onSurfaceVariant = TextSecondary
)

private val LightColorScheme = lightColorScheme(
    primary = PrimaryTeal,
    onPrimary = Color.White,
    secondary = SecondaryIndigo,
    onSecondary = Color.White,
    background = DeepNavy,
    onBackground = TextPrimary,
    surface = SlateDark,
    onSurface = TextPrimary,
    surfaceVariant = BorderGlass,
    onSurfaceVariant = TextSecondary
)

@Composable
fun MedicalSorterTheme(
    darkTheme: Boolean = false, // Clean off-white themed by default
    dynamicColor: Boolean = false, // Disable dynamic colors to enforce branding
    content: @Composable () -> Unit
) {
    val colorScheme = LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
