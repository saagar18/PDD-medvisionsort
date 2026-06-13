package com.example.medicalsorter.data.api

import com.example.medicalsorter.data.model.MedicalImage
import com.example.medicalsorter.data.model.MedicalStats
import okhttp3.MultipartBody
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

interface MedicalApiService {
    @GET("api/stats")
    suspend fun getStats(): MedicalStats

    @GET("api/images")
    suspend fun getRecentImages(): List<MedicalImage>

    @Multipart
    @POST("api/classify")
    suspend fun classifyImage(
        @Part file: MultipartBody.Part
    ): MedicalImage
}
