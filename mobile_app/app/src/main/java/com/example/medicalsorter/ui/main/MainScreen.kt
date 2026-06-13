package com.example.medicalsorter.ui.main

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation3.runtime.NavKey
import com.example.medicalsorter.data.DefaultDataRepository
import com.example.medicalsorter.ui.auth.LoginScreen
import com.example.medicalsorter.ui.auth.RegisterScreen
import com.example.medicalsorter.ui.dashboard.DashboardScreen
import com.example.medicalsorter.ui.history.HistoryScreen
import com.example.medicalsorter.ui.upload.UploadScreen
import com.example.medicalsorter.ui.profile.ProfileScreen
import com.example.medicalsorter.ui.components.ServerSettingsDialog
import com.example.medicalsorter.theme.*

@Composable
fun MainScreen(
    onItemClick: (NavKey) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: MainScreenViewModel = viewModel { MainScreenViewModel(DefaultDataRepository()) },
) {
    val authState by viewModel.authState.collectAsStateWithLifecycle()
    val currentUser by viewModel.currentUser.collectAsStateWithLifecycle()
    val authError by viewModel.authError.collectAsStateWithLifecycle()

    val currentTab by viewModel.currentTab.collectAsStateWithLifecycle()
    val statsState by viewModel.statsState.collectAsStateWithLifecycle()
    val historyState by viewModel.historyState.collectAsStateWithLifecycle()
    val uploadState by viewModel.uploadState.collectAsStateWithLifecycle()
    val serverUrl by viewModel.serverUrlState.collectAsStateWithLifecycle()

    var showServerSettings by remember { mutableStateOf(false) }

    when (authState) {
        AuthState.LOGIN -> {
            LoginScreen(
                onLogin = { email, password -> viewModel.login(email, password) },
                onNavigateToRegister = { viewModel.setAuthState(AuthState.REGISTER) },
                authError = authError,
                modifier = modifier
            )
        }
        AuthState.REGISTER -> {
            RegisterScreen(
                onRegister = { name, email, password -> viewModel.register(name, email, password) },
                onNavigateToLogin = { viewModel.setAuthState(AuthState.LOGIN) },
                authError = authError,
                modifier = modifier
            )
        }
        AuthState.AUTHENTICATED -> {
            Scaffold(
                modifier = modifier.fillMaxSize(),
                containerColor = DeepNavy,
                bottomBar = {
                    NavigationBar(
                        containerColor = SlateDark,
                        tonalElevation = 8.dp,
                        modifier = Modifier.height(72.dp)
                    ) {
                        NavigationBarItem(
                            selected = currentTab == NavigationTab.DASHBOARD,
                            onClick = { viewModel.selectTab(NavigationTab.DASHBOARD) },
                            icon = { Icon(Icons.Default.Home, contentDescription = "Dashboard") },
                            label = { Text("Metrics", fontWeight = FontWeight.Bold) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = TextPrimary,
                                selectedTextColor = TextPrimary,
                                indicatorColor = PrimaryTeal,
                                unselectedIconColor = TextSecondary,
                                unselectedTextColor = TextSecondary
                            )
                        )

                        NavigationBarItem(
                            selected = currentTab == NavigationTab.UPLOAD,
                            onClick = { viewModel.selectTab(NavigationTab.UPLOAD) },
                            icon = { Icon(Icons.Default.Share, contentDescription = "Scan Upload") },
                            label = { Text("AI Scan", fontWeight = FontWeight.Bold) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = TextPrimary,
                                selectedTextColor = TextPrimary,
                                indicatorColor = PrimaryTeal,
                                unselectedIconColor = TextSecondary,
                                unselectedTextColor = TextSecondary
                            )
                        )

                        NavigationBarItem(
                            selected = currentTab == NavigationTab.HISTORY,
                            onClick = { viewModel.selectTab(NavigationTab.HISTORY) },
                            icon = { Icon(Icons.Default.DateRange, contentDescription = "History Log") },
                            label = { Text("Reports", fontWeight = FontWeight.Bold) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = TextPrimary,
                                selectedTextColor = TextPrimary,
                                indicatorColor = PrimaryTeal,
                                unselectedIconColor = TextSecondary,
                                unselectedTextColor = TextSecondary
                            )
                        )

                        NavigationBarItem(
                            selected = currentTab == NavigationTab.PROFILE,
                            onClick = { viewModel.selectTab(NavigationTab.PROFILE) },
                            icon = { Icon(Icons.Default.Person, contentDescription = "Clinician Profile") },
                            label = { Text("Profile", fontWeight = FontWeight.Bold) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = TextPrimary,
                                selectedTextColor = TextPrimary,
                                indicatorColor = PrimaryTeal,
                                unselectedIconColor = TextSecondary,
                                unselectedTextColor = TextSecondary
                            )
                        )
                    }
                }
            ) { innerPadding ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                        .background(DeepNavy)
                ) {
                    when (currentTab) {
                        NavigationTab.DASHBOARD -> {
                            DashboardScreen(
                                statsState = statsState,
                                onRefresh = { viewModel.refreshStats() },
                                onConfigureServer = { showServerSettings = true }
                            )
                        }
                        NavigationTab.UPLOAD -> {
                            UploadScreen(
                                uploadState = uploadState,
                                onUpload = { bytes, name -> viewModel.uploadScan(bytes, name) },
                                onResetUpload = { viewModel.resetUploadState() }
                            )
                        }
                        NavigationTab.HISTORY -> {
                            HistoryScreen(
                                historyState = historyState,
                                onRefresh = { viewModel.refreshHistory() },
                                serverBaseUrl = serverUrl
                            )
                        }
                        NavigationTab.PROFILE -> {
                            ProfileScreen(
                                userSession = currentUser,
                                serverUrl = serverUrl,
                                onLogout = { viewModel.logout() }
                            )
                        }
                    }
                }
            }

            // Modal server configuration overlay
            if (showServerSettings) {
                ServerSettingsDialog(
                    currentUrl = serverUrl,
                    onDismiss = { showServerSettings = false },
                    onSave = { ip, port ->
                        viewModel.updateServerAddress(ip, port)
                        showServerSettings = false
                    }
                )
            }
        }
    }
}
