package com.example.medicalsorter.ui.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.medicalsorter.data.DataRepository
import com.example.medicalsorter.data.api.ApiClient
import com.example.medicalsorter.data.model.MedicalImage
import com.example.medicalsorter.data.model.MedicalStats
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface UiState<out T> {
    object Idle : UiState<Nothing>
    object Loading : UiState<Nothing>
    data class Success<out T>(val data: T) : UiState<T>
    data class Error(val message: String) : UiState<Nothing>
}

enum class NavigationTab {
    DASHBOARD,
    UPLOAD,
    HISTORY,
    PROFILE
}

enum class AuthState {
    LOGIN,
    REGISTER,
    AUTHENTICATED
}

data class UserSession(
    val name: String,
    val email: String,
    val role: String = "Senior Radiologist",
    val department: String = "Triage & Radiology",
    val hospital: String = "Metro General Hospital"
)

class MainScreenViewModel(private val repository: DataRepository) : ViewModel() {

    // Authentication States
    private val _authState = MutableStateFlow(AuthState.LOGIN)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    private val _currentUser = MutableStateFlow<UserSession?>(null)
    val currentUser: StateFlow<UserSession?> = _currentUser.asStateFlow()

    private val _authError = MutableStateFlow<String?>(null)
    val authError: StateFlow<String?> = _authError.asStateFlow()

    // Navigation Tab State
    private val _currentTab = MutableStateFlow(NavigationTab.DASHBOARD)
    val currentTab: StateFlow<NavigationTab> = _currentTab.asStateFlow()

    private val _statsState = MutableStateFlow<UiState<MedicalStats>>(UiState.Loading)
    val statsState: StateFlow<UiState<MedicalStats>> = _statsState.asStateFlow()

    private val _historyState = MutableStateFlow<UiState<List<MedicalImage>>>(UiState.Loading)
    val historyState: StateFlow<UiState<List<MedicalImage>>> = _historyState.asStateFlow()

    private val _uploadState = MutableStateFlow<UiState<MedicalImage>>(UiState.Idle)
    val uploadState: StateFlow<UiState<MedicalImage>> = _uploadState.asStateFlow()

    private val _serverUrlState = MutableStateFlow(ApiClient.baseUrl)
    val serverUrlState: StateFlow<String> = _serverUrlState.asStateFlow()

    init {
        refreshAll()
    }

    // Authentication Actions
    fun login(email: String, password: String) {
        _authError.value = null
        if (email.isBlank() || password.isBlank()) {
            _authError.value = "Email and password cannot be blank."
            return
        }
        if (email.trim().lowercase() != "saagar@gmail.com") {
            _authError.value = "Access restricted to saagar@gmail.com"
            return
        }
        if (password != "admin123") {
            _authError.value = "Incorrect password."
            return
        }
        if (password.length < 6) {
            _authError.value = "Password must be at least 6 characters."
            return
        }
        // Mock authentication matching professional Doctor name
        val username = email.substringBefore("@").replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
        val displayName = if (username.lowercase().startsWith("dr")) username else "Dr. $username"
        
        _currentUser.value = UserSession(name = displayName, email = email)
        _authState.value = AuthState.AUTHENTICATED
        refreshAll()
    }

    fun register(name: String, email: String, password: String) {
        _authError.value = null
        if (name.isBlank() || email.isBlank() || password.isBlank()) {
            _authError.value = "All fields are required."
            return
        }
        if (email.trim().lowercase() != "saagar@gmail.com") {
            _authError.value = "Access restricted to saagar@gmail.com"
            return
        }
        if (password != "admin123") {
            _authError.value = "Incorrect password."
            return
        }
        if (password.length < 6) {
            _authError.value = "Password must be at least 6 characters."
            return
        }
        // Setup new session
        val displayName = if (name.lowercase().startsWith("dr")) name else "Dr. $name"
        _currentUser.value = UserSession(name = displayName, email = email)
        _authState.value = AuthState.AUTHENTICATED
        refreshAll()
    }

    fun logout() {
        _currentUser.value = null
        _authState.value = AuthState.LOGIN
        _currentTab.value = NavigationTab.DASHBOARD // Reset tab
        _authError.value = null
    }

    fun setAuthState(state: AuthState) {
        _authError.value = null
        _authState.value = state
    }

    // Navigation Tab Actions
    fun selectTab(tab: NavigationTab) {
        _currentTab.value = tab
        if (tab == NavigationTab.HISTORY) {
            refreshHistory()
        } else if (tab == NavigationTab.DASHBOARD) {
            refreshStats()
        }
    }

    fun refreshAll() {
        refreshStats()
        refreshHistory()
    }

    fun refreshStats() {
        viewModelScope.launch {
            _statsState.value = UiState.Loading
            try {
                repository.getStatsFlow().collect { stats ->
                    _statsState.value = UiState.Success(stats)
                }
            } catch (e: Exception) {
                _statsState.value = UiState.Error(e.localizedMessage ?: "Failed to fetch stats")
            }
        }
    }

    fun refreshHistory() {
        viewModelScope.launch {
            _historyState.value = UiState.Loading
            try {
                repository.getRecentImagesFlow().collect { list ->
                    _historyState.value = UiState.Success(list)
                }
            } catch (e: Exception) {
                _historyState.value = UiState.Error(e.localizedMessage ?: "Failed to fetch history")
            }
        }
    }

    fun resetUploadState() {
        _uploadState.value = UiState.Idle
    }

    fun uploadScan(fileBytes: ByteArray, filename: String) {
        viewModelScope.launch {
            _uploadState.value = UiState.Loading
            try {
                val result = repository.classifyImage(fileBytes, filename)
                _uploadState.value = UiState.Success(result)
                refreshAll()
            } catch (e: Exception) {
                _uploadState.value = UiState.Error(e.localizedMessage ?: "Classification upload failed")
            }
        }
    }

    fun updateServerAddress(ip: String, port: String) {
        ApiClient.updateIpAddress(ip, port)
        _serverUrlState.value = ApiClient.baseUrl
        refreshAll()
    }
}
