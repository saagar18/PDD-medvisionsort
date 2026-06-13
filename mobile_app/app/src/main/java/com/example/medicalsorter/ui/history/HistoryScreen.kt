package com.example.medicalsorter.ui.history

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.medicalsorter.data.api.ApiClient
import com.example.medicalsorter.data.model.MedicalImage
import com.example.medicalsorter.ui.components.ModalityBadge
import com.example.medicalsorter.ui.components.ShimmerSkeletonItem
import com.example.medicalsorter.ui.main.UiState
import com.example.medicalsorter.theme.*
import com.example.medicalsorter.ui.components.GradientButton

enum class SortMode {
    DATE_DESC,
    DATE_ASC,
    CONFIDENCE_DESC,
    CONFIDENCE_ASC
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(
    historyState: UiState<List<MedicalImage>>,
    onRefresh: () -> Unit,
    serverBaseUrl: String,
    modifier: Modifier = Modifier
) {
    var selectedImageForDetail by remember { mutableStateOf<MedicalImage?>(null) }
    
    // Search, Filter & Sort States
    var searchQuery by remember { mutableStateOf("") }
    var selectedFilterModality by remember { mutableStateOf("All") }
    var currentSortMode by remember { mutableStateOf(SortMode.DATE_DESC) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        // Page Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                     text = "Reports",
                     fontSize = 24.sp,
                     fontWeight = FontWeight.ExtraBold,
                     color = TextPrimary
                )
                Text(
                     text = "Historical reports of parsed scans",
                     fontSize = 13.sp,
                     color = TextSecondary
                )
            }

            IconButton(onClick = onRefresh) {
                Icon(Icons.Default.Refresh, contentDescription = "Refresh history", tint = PrimaryTealLight)
            }
        }

        // Search Bar Input
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search by patient name, ID, or file...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = TextSecondary) },
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary,
                focusedBorderColor = PrimaryTeal,
                unfocusedBorderColor = BorderGlass,
                focusedContainerColor = SlateDark.copy(alpha = 0.3f),
                unfocusedContainerColor = SlateDark.copy(alpha = 0.3f)
            ),
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp)
        )

        // Horizontal Category Filter Chips
        val filters = listOf("All", "MRI", "CT Scan", "X-Ray", "Unclassified")
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp)
        ) {
            items(filters) { filter ->
                val isSelected = selectedFilterModality == filter
                FilterChip(
                    selected = isSelected,
                    onClick = { selectedFilterModality = filter },
                    label = { Text(filter, fontWeight = FontWeight.Bold, fontSize = 12.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = PrimaryTeal,
                        selectedLabelColor = Color.White,
                        containerColor = SlateDark,
                        labelColor = TextSecondary
                    ),
                    border = FilterChipDefaults.filterChipBorder(
                        borderColor = BorderGlass,
                        selectedBorderColor = PrimaryTealLight,
                        enabled = true,
                        selected = isSelected
                    )
                )
            }
        }

        // Sorting & Results Bar summary
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (historyState is UiState.Success) {
                val totalResults = historyState.data.size
                Text(
                    text = "$totalResults records found",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextSecondary
                )
            }

            // Quick Sort Dropdown Trigger
            var sortExpanded by remember { mutableStateOf(false) }
            Box {
                TextButton(onClick = { sortExpanded = true }) {
                    val sortLabel = when (currentSortMode) {
                        SortMode.DATE_DESC -> "Newest First"
                        SortMode.DATE_ASC -> "Oldest First"
                        SortMode.CONFIDENCE_DESC -> "High Confidence"
                        SortMode.CONFIDENCE_ASC -> "Low Confidence"
                    }
                    Text("Sort: $sortLabel ▾", fontSize = 12.sp, color = PrimaryTealLight, fontWeight = FontWeight.Bold)
                }

                DropdownMenu(
                    expanded = sortExpanded,
                    onDismissRequest = { sortExpanded = false },
                    modifier = Modifier.background(SlateDark)
                ) {
                    DropdownMenuItem(
                        text = { Text("Newest First", color = TextPrimary) },
                        onClick = { currentSortMode = SortMode.DATE_DESC; sortExpanded = false }
                    )
                    DropdownMenuItem(
                        text = { Text("Oldest First", color = TextPrimary) },
                        onClick = { currentSortMode = SortMode.DATE_ASC; sortExpanded = false }
                    )
                    DropdownMenuItem(
                        text = { Text("Confidence: High ➔ Low", color = TextPrimary) },
                        onClick = { currentSortMode = SortMode.CONFIDENCE_DESC; sortExpanded = false }
                    )
                    DropdownMenuItem(
                        text = { Text("Confidence: Low ➔ High", color = TextPrimary) },
                        onClick = { currentSortMode = SortMode.CONFIDENCE_ASC; sortExpanded = false }
                    )
                }
            }
        }

        // Screen State Rendering
        when (historyState) {
            is UiState.Idle, is UiState.Loading -> {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(6) {
                        ShimmerSkeletonItem(height = 84.dp, shape = RoundedCornerShape(14.dp))
                    }
                }
            }
            is UiState.Error -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = null,
                            tint = UnclassifiedRed,
                            modifier = Modifier.size(56.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Failed to load records",
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = historyState.message,
                            color = TextSecondary,
                            fontSize = 13.sp
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        GradientButton(
                            text = "Retry Loading",
                            onClick = onRefresh,
                            modifier = Modifier.width(180.dp)
                        )
                    }
                }
            }
            is UiState.Success -> {
                val rawList = historyState.data

                // 1. Apply Search Query Filter
                var filteredList = if (searchQuery.isBlank()) {
                    rawList
                } else {
                    rawList.filter {
                        it.patientName.contains(searchQuery, ignoreCase = true) ||
                        it.patientId.contains(searchQuery, ignoreCase = true) ||
                        it.originalFilename.contains(searchQuery, ignoreCase = true) ||
                        it.id.contains(searchQuery, ignoreCase = true)
                    }
                }

                // 2. Apply Modality Chip Filter
                if (selectedFilterModality != "All") {
                    filteredList = filteredList.filter {
                        it.type.equals(selectedFilterModality, ignoreCase = true)
                    }
                }

                // 3. Apply Sorting
                val sortedList = when (currentSortMode) {
                    SortMode.DATE_DESC -> filteredList.sortedByDescending { it.date }
                    SortMode.DATE_ASC -> filteredList.sortedBy { it.date }
                    SortMode.CONFIDENCE_DESC -> filteredList.sortedByDescending { it.confidence }
                    SortMode.CONFIDENCE_ASC -> filteredList.sortedBy { it.confidence }
                }

                if (sortedList.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(32.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = null,
                                tint = TextSecondary,
                                modifier = Modifier.size(56.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "No Records Found",
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary,
                                fontSize = 18.sp
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Try adjusting your search criteria or filter chips.",
                                color = TextSecondary,
                                fontSize = 13.sp,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                        }
                    }
                } else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(sortedList) { image ->
                            HistoryItem(
                                image = image,
                                serverBaseUrl = serverBaseUrl,
                                onClick = { selectedImageForDetail = image }
                            )
                        }
                        // Bottom spacer
                        item {
                            Spacer(modifier = Modifier.height(24.dp))
                        }
                    }
                }
            }
        }
    }

    // Detail Dialog Overlay
    selectedImageForDetail?.let { image ->
        ImageDetailDialog(
            image = image,
            serverBaseUrl = serverBaseUrl,
            onDismiss = { selectedImageForDetail = null }
        )
    }
}

@Composable
fun HistoryItem(
    image: MedicalImage,
    serverBaseUrl: String,
    onClick: () -> Unit
) {
    // Map URL correctly for Android Emulator vs localhost
    val imageUrl = image.url.replace("http://localhost:5001/", serverBaseUrl)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = SlateDark.copy(alpha = 0.6f))
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Thumbnail Loaded Asynchronously via Coil
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(DeepNavy),
                contentAlignment = Alignment.Center
            ) {
                AsyncImage(
                    model = imageUrl,
                    contentDescription = "Scan Thumbnail",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Details Column
            Column(
                modifier = Modifier.weight(1.2f)
            ) {
                Text(
                    text = image.patientName,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary,
                    fontSize = 14.sp
                )
                Text(
                    text = image.originalFilename,
                    fontSize = 12.sp,
                    color = TextSecondary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = "${image.patientId} • ${image.date}",
                    fontSize = 10.sp,
                    color = TextSecondary,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Badges Column
            Column(
                horizontalAlignment = Alignment.End
            ) {
                ModalityBadge(modality = image.type)
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = String.format("%.1f%%", image.confidence * 100),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = if (image.confidence >= 0.85) PrimaryTealLight else CtOrange
                )
            }
        }
    }
}

@Composable
fun ImageDetailDialog(
    image: MedicalImage,
    serverBaseUrl: String,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val imageUrl = image.url.replace("http://localhost:5001/", serverBaseUrl)

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Clinical Scan Record",
                    fontWeight = FontWeight.Black,
                    color = TextPrimary,
                    fontSize = 20.sp
                )
                IconButton(
                    onClick = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        val clip = ClipData.newPlainText("Patient Record", "Patient: ${image.patientName}\nID: ${image.patientId}\nModality: ${image.type}\nConfidence: ${String.format("%.2f%%", image.confidence * 100)}")
                        clipboard.setPrimaryClip(clip)
                        Toast.makeText(context, "Copied details to clipboard", Toast.LENGTH_SHORT).show()
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.Share,
                        contentDescription = "Copy Details",
                        tint = PrimaryTeal,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
            ) {
                // High-res Image preview with clean clinical overlay
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(DeepNavy)
                        .border(1.dp, BorderGlass, RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    AsyncImage(
                        model = imageUrl,
                        contentDescription = "Full Scan",
                        contentScale = ContentScale.Fit,
                        modifier = Modifier.fillMaxSize()
                    )
                    
                    // Subtle clinical scan guideline overlay (Senior UI UX touch)
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .border(0.5.dp, PrimaryTeal.copy(alpha = 0.2f), RoundedCornerShape(12.dp))
                            .padding(16.dp)
                    ) {
                        // Tiny corners
                        Text("[ ]", color = PrimaryTeal.copy(alpha = 0.3f), modifier = Modifier.align(Alignment.TopStart), fontSize = 10.sp)
                        Text("[ ]", color = PrimaryTeal.copy(alpha = 0.3f), modifier = Modifier.align(Alignment.TopEnd), fontSize = 10.sp)
                        Text("[ ]", color = PrimaryTeal.copy(alpha = 0.3f), modifier = Modifier.align(Alignment.BottomStart), fontSize = 10.sp)
                        Text("[ ]", color = PrimaryTeal.copy(alpha = 0.3f), modifier = Modifier.align(Alignment.BottomEnd), fontSize = 10.sp)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Metadata list
                Column(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(DeepNavy.copy(alpha = 0.6f))
                        .padding(14.dp)
                ) {
                    DetailRow(label = "Patient ID", value = image.patientId)
                    DetailRow(label = "Patient Name", value = image.patientName)
                    DetailRow(label = "Modality", value = image.type)
                    DetailRow(label = "Confidence Score", value = String.format("%.2f%%", image.confidence * 100))
                    DetailRow(label = "Processed On", value = image.date)
                    DetailRow(label = "Original Filename", value = image.originalFilename)
                    DetailRow(label = "Database Record UUID", value = image.id)
                    DetailRow(label = "Storage Location", value = image.storagePath)
                }
            }
        },
        confirmButton = {
            GradientButton(
                text = "Close Record",
                onClick = onDismiss,
                modifier = Modifier.fillMaxWidth()
            )
        },
        containerColor = SlateDark,
        shape = RoundedCornerShape(24.dp)
    )
}

@Composable
fun DetailRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            fontSize = 12.sp,
            color = TextSecondary,
            fontWeight = FontWeight.SemiBold
        )
        Text(
            text = value,
            fontSize = 12.sp,
            color = TextPrimary,
            fontWeight = FontWeight.Bold,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.padding(start = 16.dp)
        )
    }
}
