package com.example.medicalsorter.ui.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.medicalsorter.data.model.MedicalStats
import com.example.medicalsorter.ui.components.AccuracyGauge
import com.example.medicalsorter.ui.components.ConnectionStatusPill
import com.example.medicalsorter.ui.components.ShimmerSkeletonItem
import com.example.medicalsorter.ui.components.StatsCard
import com.example.medicalsorter.ui.main.UiState
import com.example.medicalsorter.theme.*
import com.example.medicalsorter.ui.components.GradientButton

@Composable
fun DashboardScreen(
    statsState: UiState<MedicalStats>,
    onRefresh: () -> Unit,
    onConfigureServer: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isOnline = statsState is UiState.Success

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        // App Title and Settings Action
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Dashboard",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(4.dp))
                ConnectionStatusPill(isOnline = isOnline)
            }
            Row {
                IconButton(onClick = onRefresh) {
                    Icon(Icons.Default.Refresh, contentDescription = "Refresh stats", tint = PrimaryTealLight)
                }
                IconButton(onClick = onConfigureServer) {
                    Icon(Icons.Default.Settings, contentDescription = "Backend Settings", tint = SecondaryIndigoLight)
                }
            }
        }

        when (statsState) {
            is UiState.Loading -> {
                Column(modifier = Modifier.padding(vertical = 16.dp)) {
                    // Accuracy Gauge Skeleton
                    ShimmerSkeletonItem(height = 160.dp, modifier = Modifier.padding(vertical = 8.dp))
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // Stats Cards Skeleton Grid
                    Row(modifier = Modifier.fillMaxWidth()) {
                        ShimmerSkeletonItem(height = 100.dp, modifier = Modifier.weight(1f))
                        Spacer(modifier = Modifier.width(12.dp))
                        ShimmerSkeletonItem(height = 100.dp, modifier = Modifier.weight(1f))
                    }
                    Spacer(modifier = Modifier.height(20.dp))
                    Row(modifier = Modifier.fillMaxWidth()) {
                        ShimmerSkeletonItem(height = 100.dp, modifier = Modifier.weight(1f))
                        Spacer(modifier = Modifier.width(12.dp))
                        ShimmerSkeletonItem(height = 100.dp, modifier = Modifier.weight(1f))
                    }
                    Spacer(modifier = Modifier.height(20.dp))
                    Row(modifier = Modifier.fillMaxWidth()) {
                        ShimmerSkeletonItem(height = 100.dp, modifier = Modifier.weight(1f))
                        Spacer(modifier = Modifier.width(12.dp))
                        ShimmerSkeletonItem(height = 100.dp, modifier = Modifier.weight(1f))
                    }
                }
            }
            is UiState.Error -> {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 24.dp),
                    colors = CardDefaults.cardColors(containerColor = UnclassifiedRed.copy(alpha = 0.1f))
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Connection Offline",
                            fontWeight = FontWeight.Black,
                            color = UnclassifiedRed,
                            fontSize = 18.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Could not communicate with the Flask backend. Ensure the server is running on your Mac at port 5001.",
                            color = TextSecondary,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            fontSize = 13.sp,
                            lineHeight = 18.sp
                        )
                        Spacer(modifier = Modifier.height(20.dp))
                        GradientButton(
                            text = "Retry Connection",
                            onClick = onRefresh,
                            modifier = Modifier.width(200.dp)
                        )
                    }
                }
            }
            is UiState.Success -> {
                val stats = statsState.data

                // Accuracy Gauge Module
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    colors = CardDefaults.cardColors(containerColor = SlateDark.copy(alpha = 0.5f))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1.2f)) {
                            Text(
                                text = "Deep Learning Model",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    color = TextPrimary,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "MobileNetV2 CNN classifier trained on X-Rays, MRIs, and CT Scans.",
                                style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary),
                                lineHeight = 16.sp
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Confidence threshold: 85%",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = PrimaryTealLight
                            )
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        AccuracyGauge(
                            percentage = stats.accuracy.toFloat(),
                            modifier = Modifier.weight(0.8f)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Stats Section Header
                Text(
                    text = "SCAN STATISTICS",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextSecondary,
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                // Grid of statistics
                Row(modifier = Modifier.fillMaxWidth()) {
                    StatsCard(
                        title = "Total Sorted",
                        value = "${stats.totalImages}",
                        subtitle = "Images processed",
                        icon = Icons.Default.List,
                        modifier = Modifier.weight(1f),
                        gradientColors = listOf(PrimaryTeal, PrimaryTealLight)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    StatsCard(
                        title = "Inference Speed",
                        value = "${stats.processingTime}s",
                        subtitle = "Average speed",
                        icon = Icons.Default.Refresh,
                        modifier = Modifier.weight(1f),
                        gradientColors = listOf(SecondaryIndigo, SecondaryIndigoLight)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "CLASSIFIED MODALITIES",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextSecondary,
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                // MRI / CT / Xray counts
                Row(modifier = Modifier.fillMaxWidth()) {
                    StatsCard(
                        title = "MRI Scans",
                        value = "${stats.counts.mri}",
                        subtitle = "Brain/Spine scans",
                        icon = Icons.Default.Person,
                        modifier = Modifier.weight(1f),
                        gradientColors = listOf(MriIndigo, SecondaryIndigoLight)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    StatsCard(
                        title = "CT Scans",
                        value = "${stats.counts.ct}",
                        subtitle = "Tomography records",
                        icon = Icons.Default.Settings,
                        modifier = Modifier.weight(1f),
                        gradientColors = listOf(CtOrange, Color(0xFFFFB703))
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(modifier = Modifier.fillMaxWidth()) {
                    StatsCard(
                        title = "X-Rays",
                        value = "${stats.counts.xray}",
                        subtitle = "Chest/Bone scans",
                        icon = Icons.Default.CheckCircle,
                        modifier = Modifier.weight(1f),
                        gradientColors = listOf(XrayTeal, PrimaryTealLight)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    StatsCard(
                        title = "Unclassified",
                        value = "${stats.counts.unknown}",
                        subtitle = "Pending / Unknown",
                        icon = Icons.Default.Warning,
                        modifier = Modifier.weight(1f),
                        gradientColors = listOf(UnclassifiedRed, Color(0xFFF87171))
                    )
                }

                Spacer(modifier = Modifier.height(32.dp))
            }
            else -> {}
        }
    }
}
