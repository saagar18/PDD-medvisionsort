package com.example.medicalsorter.ui.profile

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.medicalsorter.ui.main.UserSession
import com.example.medicalsorter.theme.*

@Composable
fun ProfileScreen(
    userSession: UserSession?,
    serverUrl: String,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    val session = userSession ?: UserSession(name = "Dr. Saagar", email = "dr.saagar@medvisionsort.com")

    // Extract professional clinical initials
    val initials = session.name
        .replace("Dr.", "", ignoreCase = true)
        .replace("Dr", "", ignoreCase = true)
        .trim()
        .split(" ")
        .filter { it.isNotEmpty() }
        .map { it.first().uppercase() }
        .joinToString("")
        .take(2)

    var showEditDialog by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        Spacer(modifier = Modifier.height(20.dp))

        // Large Professional Doctor Initials Profile Badge with Neon Gradient Border
        Box(
            modifier = Modifier
                .size(110.dp)
                .clip(CircleShape)
                .background(PrimaryTeal.copy(alpha = 0.08f))
                .border(2.dp, Brush.linearGradient(listOf(PrimaryTeal, SecondaryIndigo)), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = if (initials.isNotEmpty()) initials else "MD",
                fontSize = 38.sp,
                fontWeight = FontWeight.Black,
                color = PrimaryTeal,
                letterSpacing = 1.sp
            )
        }

        // Clinician details styled as clean minimalist block
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = session.name,
                fontSize = 24.sp,
                fontWeight = FontWeight.ExtraBold,
                color = TextPrimary
            )
            Text(
                text = session.role,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = PrimaryTealLight
            )
            Text(
                text = session.department,
                fontSize = 12.sp,
                color = TextSecondary,
                fontWeight = FontWeight.Medium
            )
            Text(
                text = session.email,
                fontSize = 12.sp,
                color = TextMuted,
                fontWeight = FontWeight.Normal
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Actions Section (Minimalist controls)
        Column(
            modifier = Modifier.fillMaxWidth(0.85f),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            OutlinedButton(
                onClick = { showEditDialog = true },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(percent = 50),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = TextPrimary),
                border = BorderStroke(1.5.dp, PrimaryTeal.copy(alpha = 0.5f))
            ) {
                Text(
                    text = "EDIT PROFILE",
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 13.sp,
                    letterSpacing = 1.sp
                )
            }

            Button(
                onClick = onLogout,
                colors = ButtonDefaults.buttonColors(containerColor = UnclassifiedRed),
                shape = RoundedCornerShape(percent = 50),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            ) {
                Text(
                    text = "CLOSE WORKSTATION SESSION",
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 13.sp,
                    letterSpacing = 1.sp,
                    color = Color.White
                )
            }
        }

        // Station indicator at bottom
        Text(
            text = "Active Clinical Session Node // MedSys V2.0",
            fontSize = 10.sp,
            color = TextMuted,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(top = 40.dp)
        )
    }

    if (showEditDialog) {
        AlertDialog(
            onDismissRequest = { showEditDialog = false },
            title = { Text("Edit Credentials", fontWeight = FontWeight.Bold, color = TextPrimary) },
            text = { Text("Profile editing is locked by active institutional directory uplink. Contact administrator to change credentials.", color = TextSecondary) },
            confirmButton = {
                TextButton(onClick = { showEditDialog = false }) {
                    Text("OK", color = PrimaryTeal, fontWeight = FontWeight.Bold)
                }
            },
            containerColor = SlateDark,
            shape = RoundedCornerShape(24.dp)
        )
    }
}

