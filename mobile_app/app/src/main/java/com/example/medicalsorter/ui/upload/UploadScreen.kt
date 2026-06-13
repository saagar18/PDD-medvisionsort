package com.example.medicalsorter.ui.upload

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.medicalsorter.data.model.MedicalImage
import com.example.medicalsorter.ui.components.ModalityBadge
import com.example.medicalsorter.ui.main.UiState
import com.example.medicalsorter.theme.*
import com.example.medicalsorter.ui.components.GradientButton
import java.io.ByteArrayOutputStream

@Composable
fun UploadScreen(
    uploadState: UiState<MedicalImage>,
    onUpload: (fileBytes: ByteArray, filename: String) -> Unit,
    onResetUpload: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    var capturedBitmap by remember { mutableStateOf<Bitmap?>(null) }
    
    // Track if a demo preset is selected
    var selectedPresetName by remember { mutableStateOf<String?>(null) }

    // Launcher for picking image from gallery
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            selectedImageUri = uri
            capturedBitmap = null
            selectedPresetName = null
            onResetUpload()
        }
    }

    // Launcher for taking photo with camera
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap: Bitmap? ->
        if (bitmap != null) {
            capturedBitmap = bitmap
            selectedImageUri = null
            selectedPresetName = null
            onResetUpload()
        }
    }

    // Standard 1x1 Red Pixel PNG Byte Array (Valid image file for backend deep learning model)
    val dummyPngBytes = byteArrayOf(
        -119, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82,
        0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, -112, 119, 61,
        -7, 0, 0, 0, 12, 73, 68, 65, 84, 120, -100, 99, 100, -97, 0,
        2, 0, 0, 5, 0, 1, -47, 43, -115, -116, 0, 0, 0, 0, 73,
        69, 78, 68, -48, 66, 96, -126
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        // Page Title
        Column(modifier = Modifier.padding(vertical = 16.dp)) {
            Text(
                text = "AI Classifier",
                fontSize = 24.sp,
                fontWeight = FontWeight.ExtraBold,
                color = TextPrimary
            )
            Text(
                text = "Identify scans using deep learning",
                fontSize = 13.sp,
                color = TextSecondary
            )
        }

        // Selection / Action Cards
        if (selectedImageUri == null && capturedBitmap == null && selectedPresetName == null && uploadState is UiState.Idle) {
            // Futuristic glowing upload container
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(240.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(SlateDark.copy(alpha = 0.5f))
                    .border(
                        1.5.dp,
                        Brush.linearGradient(listOf(PrimaryTeal, SecondaryIndigo)),
                        RoundedCornerShape(20.dp)
                    )
                    .clickable { galleryLauncher.launch("image/*") },
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(24.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowUpward,
                        contentDescription = "Upload Icon",
                        tint = PrimaryTeal,
                        modifier = Modifier
                            .size(48.dp)
                            .padding(bottom = 12.dp)
                    )
                    Text(
                        text = "Select Medical Scan File",
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        fontSize = 18.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Supports JPEG, PNG, DICOM-converts",
                        color = TextSecondary,
                        fontSize = 13.sp,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "TAP TO BROWSE GALLERY",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryTealLight,
                        letterSpacing = 1.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Camera Option
            OutlinedButton(
                onClick = { cameraLauncher.launch(null) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = TextPrimary),
                border = ButtonDefaults.outlinedButtonBorder(true).copy(
                    width = 1.dp,
                    brush = Brush.linearGradient(listOf(BorderGlass, BorderGlass))
                )
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Share,
                        contentDescription = "Camera Capture",
                        tint = PrimaryTeal,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Capture New Scan with Camera", fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // DEMO PRESETS SECTION (Senior Developer touch for quick testing)
            Text(
                text = "DEMO PRESETS (QUICK SCAN TEST)",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = TextSecondary,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Preset 1: Xray
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable {
                            selectedPresetName = "chest_xray.png"
                            onResetUpload()
                        },
                    colors = CardDefaults.cardColors(containerColor = SlateDark.copy(alpha = 0.5f)),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(0.5.dp, BorderGlass)
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Chest X-Ray Preset",
                            tint = XrayTeal,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Chest X-Ray", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                        Text("1x1 Preset", fontSize = 10.sp, color = TextSecondary)
                    }
                }

                // Preset 2: MRI
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable {
                            selectedPresetName = "brain_mri.png"
                            onResetUpload()
                        },
                    colors = CardDefaults.cardColors(containerColor = SlateDark.copy(alpha = 0.5f)),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(0.5.dp, BorderGlass)
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Brain MRI Preset",
                            tint = MriIndigo,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Brain MRI", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                        Text("1x1 Preset", fontSize = 10.sp, color = TextSecondary)
                    }
                }

                // Preset 3: CT
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable {
                            selectedPresetName = "head_ct.png"
                            onResetUpload()
                        },
                    colors = CardDefaults.cardColors(containerColor = SlateDark.copy(alpha = 0.5f)),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(0.5.dp, BorderGlass)
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Head CT Preset",
                            tint = CtOrange,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Head CT", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                        Text("1x1 Preset", fontSize = 10.sp, color = TextSecondary)
                    }
                }
            }
        }

        // Preview Screen / Laser Scan Overlay
        if ((selectedImageUri != null || capturedBitmap != null || selectedPresetName != null) && uploadState !is UiState.Success) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = SlateDark),
                shape = RoundedCornerShape(20.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = if (selectedPresetName != null) "Demo Preset Selected" else "Scan Preview",
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        fontSize = 16.sp,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = TextAlign.Left
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    // Image Display with Laser Scanner Overlay
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(240.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(DeepNavy)
                            .border(1.dp, BorderGlass, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        if (selectedImageUri != null) {
                            AsyncImage(
                                model = selectedImageUri,
                                contentDescription = "Selected Scan",
                                contentScale = ContentScale.Fit,
                                modifier = Modifier.fillMaxSize()
                            )
                        } else if (capturedBitmap != null) {
                            Image(
                                bitmap = capturedBitmap!!.asImageBitmap(),
                                contentDescription = "Captured Scan",
                                contentScale = ContentScale.Fit,
                                modifier = Modifier.fillMaxSize()
                            )
                        } else if (selectedPresetName != null) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(
                                    imageVector = Icons.Default.List,
                                    contentDescription = "Preset selected",
                                    tint = PrimaryTeal,
                                    modifier = Modifier.size(48.dp)
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(selectedPresetName!!, color = TextPrimary, fontWeight = FontWeight.Bold)
                                Text("Click analyze to send valid PNG stream", color = TextSecondary, fontSize = 11.sp)
                            }
                        }

                        // Clinical target Guideline overlay
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(16.dp)
                        ) {
                            Text("[ ]", color = PrimaryTeal.copy(alpha = 0.4f), modifier = Modifier.align(Alignment.TopStart), fontSize = 12.sp)
                            Text("[ ]", color = PrimaryTeal.copy(alpha = 0.4f), modifier = Modifier.align(Alignment.TopEnd), fontSize = 12.sp)
                            Text("[ ]", color = PrimaryTeal.copy(alpha = 0.4f), modifier = Modifier.align(Alignment.BottomStart), fontSize = 12.sp)
                            Text("[ ]", color = PrimaryTeal.copy(alpha = 0.4f), modifier = Modifier.align(Alignment.BottomEnd), fontSize = 12.sp)
                        }

                        // Beautiful animated green laser line during loading state
                        if (uploadState is UiState.Loading) {
                            val infiniteTransition = rememberInfiniteTransition(label = "laser")
                            val laserProgress by infiniteTransition.animateFloat(
                                initialValue = 0f,
                                targetValue = 1f,
                                animationSpec = infiniteRepeatable(
                                    animation = tween(1500, easing = EaseInOutSine),
                                    repeatMode = RepeatMode.Reverse
                                ),
                                label = "laserLine"
                            )

                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .fillMaxHeight(0.02f)
                                    .align(Alignment.TopCenter)
                                    .offset(y = 240.dp * laserProgress)
                                    .background(
                                        Brush.horizontalGradient(
                                            listOf(
                                                Color.Transparent,
                                                XrayTeal,
                                                Color.White,
                                                XrayTeal,
                                                Color.Transparent
                                            )
                                        )
                                    )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Action buttons
                    if (uploadState is UiState.Loading) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(vertical = 8.dp)
                        ) {
                            LinearProgressIndicator(
                                color = PrimaryTeal,
                                trackColor = BorderGlass,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(4.dp)
                                    .clip(RoundedCornerShape(2.dp))
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "Running Neural Network Inference...",
                                fontSize = 13.sp,
                                color = PrimaryTealLight,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    } else {
                        Row(modifier = Modifier.fillMaxWidth()) {
                            OutlinedButton(
                                onClick = {
                                    selectedImageUri = null
                                    capturedBitmap = null
                                    selectedPresetName = null
                                    onResetUpload()
                                },
                                modifier = Modifier
                                    .weight(1f)
                                    .height(48.dp),
                                shape = RoundedCornerShape(percent = 50)
                            ) {
                                Text("Clear")
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            GradientButton(
                                text = "Analyze & Classify",
                                onClick = {
                                    try {
                                        val bytes: ByteArray
                                        val filename: String
                                        if (selectedImageUri != null) {
                                            val inputStream = context.contentResolver.openInputStream(selectedImageUri!!)
                                            bytes = inputStream?.readBytes() ?: ByteArray(0)
                                            filename = selectedImageUri!!.lastPathSegment ?: "scan.jpg"
                                        } else if (capturedBitmap != null) {
                                            val stream = ByteArrayOutputStream()
                                            capturedBitmap!!.compress(Bitmap.CompressFormat.JPEG, 95, stream)
                                            bytes = stream.toByteArray()
                                            filename = "scan_capture.jpg"
                                        } else {
                                            // Demo Preset
                                            bytes = dummyPngBytes
                                            filename = selectedPresetName ?: "demo_scan.png"
                                        }
                                        onUpload(bytes, filename)
                                    } catch (e: Exception) {
                                        // Error handling done by UI state
                                    }
                                },
                                modifier = Modifier
                                    .weight(2.5f)
                            )
                        }
                    }

                    // Display error if any
                    if (uploadState is UiState.Error) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = uploadState.message,
                            color = UnclassifiedRed,
                            fontSize = 13.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )
                    }
                }
            }
        }

        // Result Screen
        if (uploadState is UiState.Success) {
            val result = uploadState.data
            var revealResult by remember { mutableStateOf(false) }

            LaunchedEffect(result) {
                revealResult = true
            }

            AnimatedVisibility(visible = revealResult) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
                        .border(
                            1.dp,
                            Brush.linearGradient(listOf(PrimaryTeal, SecondaryIndigo)),
                            RoundedCornerShape(24.dp)
                        ),
                    colors = CardDefaults.cardColors(containerColor = SlateDark),
                    shape = RoundedCornerShape(24.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            Icons.Default.CheckCircle,
                            contentDescription = "Analysis Complete",
                            tint = PrimaryTealLight,
                            modifier = Modifier.size(56.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Analysis Successful",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Scan successfully cataloged in backend",
                            fontSize = 13.sp,
                            color = TextSecondary
                        )

                        Spacer(modifier = Modifier.height(24.dp))

                        // Classification results box
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(16.dp))
                                .background(DeepNavy)
                                .padding(16.dp)
                        ) {
                            Column {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "Scan Modality:",
                                        fontSize = 14.sp,
                                        color = TextSecondary
                                    )
                                    ModalityBadge(modality = result.type)
                                }

                                HorizontalDivider(
                                    color = BorderGlass.copy(alpha = 0.5f),
                                    modifier = Modifier.padding(vertical = 12.dp)
                                )

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "Model Confidence:",
                                        fontSize = 14.sp,
                                        color = TextSecondary
                                    )
                                    Text(
                                        text = String.format("%.1f%%", result.confidence * 100),
                                        fontWeight = FontWeight.ExtraBold,
                                        color = if (result.confidence >= 0.85) PrimaryTealLight else CtOrange
                                    )
                                }

                                HorizontalDivider(
                                    color = BorderGlass.copy(alpha = 0.5f),
                                    modifier = Modifier.padding(vertical = 12.dp)
                                )

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "Assigned Patient:",
                                        fontSize = 14.sp,
                                        color = TextSecondary
                                    )
                                    Text(
                                        text = "${result.patientName} (${result.patientId})",
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary
                                    )
                                }

                                HorizontalDivider(
                                    color = BorderGlass.copy(alpha = 0.5f),
                                    modifier = Modifier.padding(vertical = 12.dp)
                                )

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "Original File:",
                                        fontSize = 14.sp,
                                        color = TextSecondary
                                    )
                                    Text(
                                        text = result.originalFilename,
                                        color = TextPrimary,
                                        fontSize = 13.sp,
                                        maxLines = 1
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        GradientButton(
                            text = "Scan Another Image",
                            onClick = {
                                selectedImageUri = null
                                capturedBitmap = null
                                selectedPresetName = null
                                onResetUpload()
                            },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}
