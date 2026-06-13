package com.example.medicalsorter.data.model

import kotlinx.serialization.Serializable

@Serializable
data class ModalityCounts(
    val xray: Int = 0,
    val mri: Int = 0,
    val ct: Int = 0,
    val unknown: Int = 0
)

@Serializable
data class MedicalStats(
    val totalImages: Int,
    val accuracy: Double,
    val processingTime: Double,
    val modalities: Int,
    val counts: ModalityCounts
)

@Serializable
data class MedicalImage(
    val id: String,
    val url: String,
    val type: String,
    val confidence: Double,
    val date: String,
    val patientId: String,
    val patientName: String,
    val status: String,
    val originalFilename: String,
    val storagePath: String
)
