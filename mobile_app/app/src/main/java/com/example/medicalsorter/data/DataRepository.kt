package com.example.medicalsorter.data

import com.example.medicalsorter.data.model.MedicalImage
import com.example.medicalsorter.data.model.MedicalStats
import com.example.medicalsorter.data.model.ModalityCounts
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.random.Random

interface DataRepository {
    val data: Flow<List<String>> // Compatibility for original template if needed

    fun getStatsFlow(): Flow<MedicalStats>
    fun getRecentImagesFlow(): Flow<List<MedicalImage>>
    suspend fun classifyImage(fileBytes: ByteArray, filename: String): MedicalImage
}

class DefaultDataRepository : DataRepository {
    override val data: Flow<List<String>> = flow {
        emit(listOf("Triage Dashboard", "Scan Upload", "Activity History"))
    }

    override fun getStatsFlow(): Flow<MedicalStats> = flow {
        val xrayCount = mockImages.count { it.type.lowercase() == "xray" }
        val mriCount = mockImages.count { it.type.lowercase() == "mri" }
        val ctCount = mockImages.count { it.type.lowercase() == "ct" }
        val unknownCount = mockImages.count { it.type.lowercase() == "unknown" }
        
        val total = mockImages.size
        val totalAccuracy = mockImages.filter { it.type != "unknown" }.sumOf { it.confidence }
        val avgAccuracy = if (total > unknownCount) {
            (totalAccuracy / (total - unknownCount)) * 100
        } else {
            99.4
        }

        emit(
            MedicalStats(
                totalImages = total,
                accuracy = Math.round(avgAccuracy * 10.0) / 10.0,
                processingTime = 0.45,
                modalities = 3,
                counts = ModalityCounts(
                    xray = xrayCount,
                    mri = mriCount,
                    ct = ctCount,
                    unknown = unknownCount
                )
            )
        )
    }

    override fun getRecentImagesFlow(): Flow<List<MedicalImage>> = flow {
        emit(mockImages.toList())
    }

    override suspend fun classifyImage(fileBytes: ByteArray, filename: String): MedicalImage {
        // Simulate deep learning neural network inference latency
        delay(2000)

        // Parse type based on filename keyword
        val type = when {
            filename.contains("xray", ignoreCase = true) || filename.contains("x-ray", ignoreCase = true) -> "xray"
            filename.contains("mri", ignoreCase = true) -> "mri"
            filename.contains("ct", ignoreCase = true) -> "ct"
            else -> listOf("xray", "mri", "ct").random()
        }

        // Dynamic local mapping from assets directory
        val url = when (type) {
            "xray" -> "file:///android_asset/xray/" + listOf(
                "00836f9405f2a9e52446d1ecb6f3223eec42edc6ee3be12bf91a12709597b2f2.jpeg",
                "07bbb40754b2a4cc14dd50bd334234198a3590000f9ba9475ae21b9bb7233e61.jpeg",
                "6c091e07139ee29e2b965f4b173d6a5d59ce25a35fdb392b7a9358025eb06967.jpeg",
                "bac3c78546df5e38d662a40ba6e31496cb4d18827f36cffbc334b475413b9dcd.jpeg",
                "e4c29ddcd3f4f9e6cbce2cc49b1f3a94258ecb1ef22ef01d57f7a58f67177729.jpeg"
            ).random()
            "mri" -> "file:///android_asset/mri/" + listOf(
                "381bca91a0e6df7f2fc2da69747a13cc1a43b8db453276485fa83e41e6b22eac.jpeg",
                "5fd753281812b8dd7c51d8a94ce740d0ac31f9bbbbedb610fd84bb95f941b309.jpeg",
                "7c30fba8107d964583f1461df2485cd04436355fbdb78552dd50448afe1cbb65.jpeg",
                "7e91d7d979de40a8fe1911d367d6b1dad5c9ffa2e0554d6e8f2c65950dbe9c12.jpeg",
                "cc1a91bbda5e22d629b9f0ff6533eb71a211597bb2aa5bfb77b7435fa74445ce.jpeg"
            ).random()
            else -> "file:///android_asset/ct/" + listOf(
                "1bfc84da53e827d3b9074401c3217f54eb7c55feb5b90a1e8e1d13a018c477d5.jpeg",
                "51545e1594fe05a23fb08c63feef1ec6c1aa2fbfc4fdd63bbc1765957c7e24d6.jpeg",
                "74e95084ef28f43d35c9311d58f59022a952f2006cc7266f9b90eff52d0ea339.jpeg",
                "8ec2e2ec52e290eed2c2fe6d07027d59c0cdc890b01ac26fd229d2b23d2b42fd.jpeg",
                "991a97be70ee9e560f56946520ffd7c53a78b96533fd8249f99b83d2c135d060.jpeg"
            ).random()
        }

        // Randomize patient data with Indian Names
        val patientNames = listOf(
            "Aarav Sharma", "Sneha Reddy", "Rohan Verma", "Ananya Iyer", "Vikram Patel",
            "Priya Nair", "Arjun Mehta", "Divya Choudhury", "Sanjay Gupta", "Kavita Joshi",
            "Rajesh Kumar", "Neha Saxena", "Vihaan Kapoor", "Tanvi Bhat", "Kabir Shah",
            "Riya Malhotra", "Siddharth Gill", "Krrish Singhal", "Avni Chaturvedi", "Varun Dhawan"
        )
        val patientName = patientNames.random()
        val patientId = "PT-" + Random.nextInt(1000, 9999)
        val dateString = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date())
        val confidence = Random.nextDouble(0.88, 0.999)

        val newImage = MedicalImage(
            id = java.util.UUID.randomUUID().toString().take(8),
            url = url,
            type = type,
            confidence = confidence,
            date = dateString,
            patientId = patientId,
            patientName = patientName,
            status = "sorted",
            originalFilename = filename,
            storagePath = "$type/$filename"
        )

        mockImages.add(0, newImage) // Add to the top of list
        return newImage
    }

    companion object {
        // Static thread-safe list to persist data during session
        private val mockImages = mutableListOf<MedicalImage>()

        init {
            val xrayFiles = listOf(
                "00836f9405f2a9e52446d1ecb6f3223eec42edc6ee3be12bf91a12709597b2f2.jpeg",
                "07bbb40754b2a4cc14dd50bd334234198a3590000f9ba9475ae21b9bb7233e61.jpeg",
                "6c091e07139ee29e2b965f4b173d6a5d59ce25a35fdb392b7a9358025eb06967.jpeg",
                "bac3c78546df5e38d662a40ba6e31496cb4d18827f36cffbc334b475413b9dcd.jpeg",
                "e4c29ddcd3f4f9e6cbce2cc49b1f3a94258ecb1ef22ef01d57f7a58f67177729.jpeg"
            )

            val mriFiles = listOf(
                "381bca91a0e6df7f2fc2da69747a13cc1a43b8db453276485fa83e41e6b22eac.jpeg",
                "5fd753281812b8dd7c51d8a94ce740d0ac31f9bbbbedb610fd84bb95f941b309.jpeg",
                "7c30fba8107d964583f1461df2485cd04436355fbdb78552dd50448afe1cbb65.jpeg",
                "7e91d7d979de40a8fe1911d367d6b1dad5c9ffa2e0554d6e8f2c65950dbe9c12.jpeg",
                "cc1a91bbda5e22d629b9f0ff6533eb71a211597bb2aa5bfb77b7435fa74445ce.jpeg"
            )

            val ctFiles = listOf(
                "1bfc84da53e827d3b9074401c3217f54eb7c55feb5b90a1e8e1d13a018c477d5.jpeg",
                "51545e1594fe05a23fb08c63feef1ec6c1aa2fbfc4fdd63bbc1765957c7e24d6.jpeg",
                "74e95084ef28f43d35c9311d58f59022a952f2006cc7266f9b90eff52d0ea339.jpeg",
                "8ec2e2ec52e290eed2c2fe6d07027d59c0cdc890b01ac26fd229d2b23d2b42fd.jpeg",
                "991a97be70ee9e560f56946520ffd7c53a78b96533fd8249f99b83d2c135d060.jpeg"
            )

            val indianNamesXray = listOf(
                "Aarav Sharma", "Sneha Reddy", "Rohan Verma", "Ananya Iyer", "Vikram Patel",
                "Priya Nair", "Arjun Mehta", "Divya Choudhury", "Sanjay Gupta", "Kavita Joshi",
                "Rajesh Kumar", "Aditi Rao", "Aditya Sen", "Meera Deshmukh", "Ishan Banerjee"
            )

            val indianNamesMri = listOf(
                "Vihaan Kapoor", "Tanvi Bhat", "Kabir Shah", "Riya Malhotra", "Siddharth Gill",
                "Neha Saxena", "Devansh Pandey", "Shruti Menon", "Harish Yadav", "Kiran Rao",
                "Sandeep Singh", "Pooja Hegde", "Rahul Bose", "Shalini Sharma", "Amit Trivedi"
            )

            val indianNamesCt = listOf(
                "Krrish Singhal", "Avni Chaturvedi", "Varun Dhawan", "Jyoti Mishra", "Akash Goel",
                "Deepa Balan", "Yashwant Sinha", "Prisha Deshpande", "Sunil Gavaskar", "Lata Mangeshkar",
                "Abhinav Bindra", "Shreya Ghoshal", "Sachin Tendulkar", "Priyanka Chopra", "Ranbir Kapoor"
            )

            // Generate 15 X-Rays
            for (i in 0 until 15) {
                val file = xrayFiles[i % xrayFiles.size]
                val name = indianNamesXray[i]
                val id = Random.nextInt(1000, 9999)
                val day = 30 + (i % 2)
                val hr = 8 + (i % 12)
                val min = 10 + (i * 3 % 45)
                val dateStr = "2026-05-$day ${String.format("%02d:%02d", hr, min)}"
                val conf = 0.94 + (i * 0.003)

                mockImages.add(
                    MedicalImage(
                        id = "xr-" + String.format("%04d", id),
                        url = "file:///android_asset/xray/$file",
                        type = "xray",
                        confidence = conf,
                        date = dateStr,
                        patientId = "PT-$id",
                        patientName = name,
                        status = "sorted",
                        originalFilename = file,
                        storagePath = "xray/$file"
                    )
                )
            }

            // Generate 15 MRIs
            for (i in 0 until 15) {
                val file = mriFiles[i % mriFiles.size]
                val name = indianNamesMri[i]
                val id = Random.nextInt(1000, 9999)
                val day = 30 + (i % 2)
                val hr = 8 + (i % 12)
                val min = 10 + (i * 3 % 45)
                val dateStr = "2026-05-$day ${String.format("%02d:%02d", hr, min)}"
                val conf = 0.90 + (i * 0.005)

                mockImages.add(
                    MedicalImage(
                        id = "mr-" + String.format("%04d", id),
                        url = "file:///android_asset/mri/$file",
                        type = "mri",
                        confidence = conf,
                        date = dateStr,
                        patientId = "PT-$id",
                        patientName = name,
                        status = "sorted",
                        originalFilename = file,
                        storagePath = "mri/$file"
                    )
                )
            }

            // Generate 15 CTs
            for (i in 0 until 15) {
                val file = ctFiles[i % ctFiles.size]
                val name = indianNamesCt[i]
                val id = Random.nextInt(1000, 9999)
                val day = 30 + (i % 2)
                val hr = 8 + (i % 12)
                val min = 10 + (i * 3 % 45)
                val dateStr = "2026-05-$day ${String.format("%02d:%02d", hr, min)}"
                val conf = 0.88 + (i * 0.007)

                mockImages.add(
                    MedicalImage(
                        id = "ct-" + String.format("%04d", id),
                        url = "file:///android_asset/ct/$file",
                        type = "ct",
                        confidence = conf,
                        date = dateStr,
                        patientId = "PT-$id",
                        patientName = name,
                        status = "sorted",
                        originalFilename = file,
                        storagePath = "ct/$file"
                    )
                )
            }

            // Sort descending by date
            mockImages.sortByDescending { it.date }
        }
    }
}

