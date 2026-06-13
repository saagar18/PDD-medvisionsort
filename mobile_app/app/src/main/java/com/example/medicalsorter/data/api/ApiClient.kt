package com.example.medicalsorter.data.api

import retrofit2.converter.kotlinx.serialization.asConverterFactory
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit

object ApiClient {
    // Default loopback IP for Android Emulator to access host machine's localhost (Flask backend)
    private var baseIp: String = "10.0.2.2"
    private var basePort: String = "5001"

    val baseUrl: String
        get() = "http://$baseIp:$basePort/"

    fun updateIpAddress(newIp: String, newPort: String = "5001") {
        baseIp = newIp
        basePort = newPort
        // Rebuild service
        apiService = createApiService()
    }

    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
    }

    private val okHttpClient: OkHttpClient by lazy {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    private fun createApiService(): MedicalApiService {
        val contentType = "application/json".toMediaType()
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory(contentType))
            .build()
            .create(MedicalApiService::class.java)
    }

    var apiService: MedicalApiService = createApiService()
        private set
}
