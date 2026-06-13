package com.example.medicalsorter.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.medicalsorter.theme.*

// Shimmer Animation for elegant Skeleton Screens
fun Modifier.shimmerEffect(): Modifier = composed {
    val transition = rememberInfiniteTransition(label = "shimmer")
    val translateAnim by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmerTranslate"
    )

    val shimmerColors = listOf(
        SlateDark.copy(alpha = 0.6f),
        BorderGlass.copy(alpha = 0.4f),
        SlateDark.copy(alpha = 0.6f),
    )

    val brush = Brush.linearGradient(
        colors = shimmerColors,
        start = Offset.Zero,
        end = Offset(x = translateAnim, y = translateAnim)
    )
    background(brush = brush)
}

@Composable
fun ShimmerSkeletonItem(
    modifier: Modifier = Modifier,
    height: Dp = 80.dp,
    shape: RoundedCornerShape = RoundedCornerShape(12.dp)
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(height)
            .clip(shape)
            .shimmerEffect()
    )
}

@Composable
fun ConnectionStatusPill(
    isOnline: Boolean,
    modifier: Modifier = Modifier
) {
    val (color, text) = if (isOnline) {
        Pair(XrayTeal, "Connected to Flask API")
    } else {
        Pair(UnclassifiedRed, "Offline Mode")
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .background(color.copy(alpha = 0.1f))
            .border(1.dp, color.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
            .padding(horizontal = 12.dp, vertical = 6.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(color)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = text,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = color,
                letterSpacing = 0.5.sp
            )
        }
    }
}

@Composable
fun StatsCard(
    title: String,
    value: String,
    subtitle: String,
    icon: ImageVector, // Professional vector graphics instead of emojis
    modifier: Modifier = Modifier,
    gradientColors: List<Color> = listOf(PrimaryTeal, SecondaryIndigo)
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .border(1.dp, Brush.linearGradient(gradientColors), RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = SlateDark.copy(alpha = 0.8f))
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = title.uppercase(),
                    style = MaterialTheme.typography.labelMedium.copy(
                        color = TextSecondary,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                )
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = gradientColors.first(),
                    modifier = Modifier.size(20.dp)
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium.copy(
                    color = TextPrimary,
                    fontWeight = FontWeight.ExtraBold
                )
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
            )
        }
    }
}

@Composable
fun ModalityBadge(
    modality: String,
    modifier: Modifier = Modifier
) {
    val (backgroundColor, textColor, label) = when (modality.lowercase()) {
        "mri" -> Triple(MriIndigo.copy(alpha = 0.15f), MriIndigo, "MRI")
        "ct", "ct scan" -> Triple(CtOrange.copy(alpha = 0.15f), CtOrange, "CT SCAN")
        "xray", "x-ray" -> Triple(XrayTeal.copy(alpha = 0.15f), XrayTeal, "X-RAY")
        else -> Triple(UnclassifiedRed.copy(alpha = 0.15f), UnclassifiedRed, "UNCLASSIFIED")
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(backgroundColor)
            .border(0.5.dp, textColor.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
            .padding(horizontal = 10.dp, vertical = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = textColor,
            letterSpacing = 0.5.sp
        )
    }
}

@Composable
fun AccuracyGauge(
    percentage: Float,
    modifier: Modifier = Modifier,
    size: Dp = 140.dp,
    strokeWidth: Dp = 12.dp
) {
    var animationPlayed by remember { mutableStateOf(false) }
    val animateNumber by animateFloatAsState(
        targetValue = if (animationPlayed) percentage else 0f,
        animationSpec = tween(durationMillis = 1500, delayMillis = 200),
        label = "gaugeSweep"
    )

    LaunchedEffect(key1 = percentage) {
        animationPlayed = true
    }

    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier.size(size)
    ) {
        Canvas(modifier = Modifier.size(size)) {
            // Background track
            drawCircle(
                color = BorderGlass.copy(alpha = 0.5f),
                style = Stroke(width = strokeWidth.toPx(), cap = StrokeCap.Round)
            )
            // Foreground animated gauge
            drawArc(
                brush = Brush.sweepGradient(
                    colors = listOf(PrimaryTeal, SecondaryIndigo, PrimaryTeal)
                ),
                startAngle = -90f,
                sweepAngle = 360 * (animateNumber / 100),
                useCenter = false,
                style = Stroke(width = strokeWidth.toPx(), cap = StrokeCap.Round)
            )
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = String.format("%.1f%%", animateNumber),
                style = MaterialTheme.typography.headlineMedium.copy(
                    color = TextPrimary,
                    fontWeight = FontWeight.Black
                ),
                textAlign = TextAlign.Center
            )
            Text(
                text = "Accuracy",
                style = MaterialTheme.typography.labelSmall.copy(color = TextSecondary),
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun ServerSettingsDialog(
    currentUrl: String,
    onDismiss: () -> Unit,
    onSave: (ip: String, port: String) -> Unit
) {
    var ipInput by remember { mutableStateOf("") }
    var portInput by remember { mutableStateOf("5001") }

    // Parse currentUrl to set initial states
    LaunchedEffect(currentUrl) {
        val cleaned = currentUrl.replace("http://", "").replace("/", "")
        val parts = cleaned.split(":")
        if (parts.isNotEmpty()) ipInput = parts[0]
        if (parts.size > 1) portInput = parts[1]
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Backend Server Connection",
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            ) {
                Text(
                    text = "Configure Flask backend API connection settings. Default for Android Emulator is 10.0.2.2.",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                OutlinedTextField(
                    value = ipInput,
                    onValueChange = { ipInput = it },
                    label = { Text("Server IP Address") },
                    placeholder = { Text("e.g. 10.0.2.2") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = PrimaryTeal,
                        unfocusedBorderColor = BorderGlass,
                        focusedContainerColor = SlateDark.copy(alpha = 0.3f),
                        unfocusedContainerColor = SlateDark.copy(alpha = 0.3f)
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = portInput,
                    onValueChange = { portInput = it },
                    label = { Text("Server Port") },
                    placeholder = { Text("e.g. 5001") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = PrimaryTeal,
                        unfocusedBorderColor = BorderGlass,
                        focusedContainerColor = SlateDark.copy(alpha = 0.3f),
                        unfocusedContainerColor = SlateDark.copy(alpha = 0.3f)
                    ),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            GradientButton(
                text = "Save Address",
                onClick = { onSave(ipInput, portInput) },
                modifier = Modifier.width(160.dp)
            )
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = TextSecondary, fontWeight = FontWeight.Bold)
            }
        },
        containerColor = SlateDark,
        shape = RoundedCornerShape(24.dp)
    )
}

@Composable
fun GradientButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    val colors = if (enabled) {
        listOf(PrimaryTeal, SecondaryIndigo)
    } else {
        listOf(TextMuted.copy(alpha = 0.5f), TextMuted.copy(alpha = 0.3f))
    }
    
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier
            .height(48.dp)
            .clip(RoundedCornerShape(percent = 50)),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color.Transparent,
            disabledContainerColor = Color.Transparent
        ),
        contentPadding = PaddingValues()
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Brush.linearGradient(colors)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = text.uppercase(),
                color = Color.White,
                fontWeight = FontWeight.ExtraBold,
                fontSize = 13.sp,
                letterSpacing = 1.sp
            )
        }
    }
}

