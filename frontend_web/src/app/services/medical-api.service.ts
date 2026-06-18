import { Injectable, inject } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Firestore, collection, collectionData, doc, docData, query, orderBy } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { backendConfig } from '../backend-config';

export interface MedicalImage {
  id: string;
  url: string;
  type: 'X-Ray' | 'MRI' | 'CT Scan';
  confidence: number;
  date: string;
  patientId: string;
  patientName: string;
  status: 'Sorted' | 'Pending' | 'Flagged';
}

@Injectable({
  providedIn: 'root'
})
export class MockApiService {

  private mockImages: MedicalImage[] = [
    // 1. X-Ray
    {
      id: "xray1",
      url: "dataset/xray/00836f9405f2a9e52446d1ecb6f3223eec42edc6ee3be12bf91a12709597b2f2.jpeg",
      type: "X-Ray",
      confidence: 0.985,
      date: "2026-05-30",
      patientId: "PID-7452",
      patientName: "Aarav Sharma",
      status: "Sorted"
    },
    // 2. MRI
    {
      id: "mri1",
      url: "dataset/mri/381bca91a0e6df7f2fc2da69747a13cc1a43b8db453276485fa83e41e6b22eac.jpeg",
      type: "MRI",
      confidence: 0.953,
      date: "2026-05-30",
      patientId: "PID-6298",
      patientName: "Priya Patel",
      status: "Sorted"
    },
    // 3. CT Scan
    {
      id: "ct1",
      url: "dataset/ct/1bfc84da53e827d3b9074401c3217f54eb7c55feb5b90a1e8e1d13a018c477d5.jpeg",
      type: "CT Scan",
      confidence: 0.942,
      date: "2026-05-30",
      patientId: "PID-4521",
      patientName: "Rajesh Kumar",
      status: "Sorted"
    },
    // 4. X-Ray
    {
      id: "xray2",
      url: "dataset/xray/07bbb40754b2a4cc14dd50bd334234198a3590000f9ba9475ae21b9bb7233e61.jpeg",
      type: "X-Ray",
      confidence: 0.963,
      date: "2026-05-29",
      patientId: "PID-3304",
      patientName: "Anjali Mehta",
      status: "Sorted"
    },
    // 5. CT Scan
    {
      id: "ct2",
      url: "dataset/ct/51545e1594fe05a23fb08c63feef1ec6c1aa2fbfc4fdd63bbc1765957c7e24d6.jpeg",
      type: "CT Scan",
      confidence: 0.925,
      date: "2026-05-29",
      patientId: "PID-8932",
      patientName: "Sanjay Gupta",
      status: "Sorted"
    },
    // 6. MRI
    {
      id: "mri2",
      url: "dataset/mri/5fd753281812b8dd7c51d8a94ce740d0ac31f9bbbbedb610fd84bb95f941b309.jpeg",
      type: "MRI",
      confidence: 0.978,
      date: "2026-05-29",
      patientId: "PID-7215",
      patientName: "Sunita Rao",
      status: "Sorted"
    },
    // 7. X-Ray
    {
      id: "xray3",
      url: "dataset/xray/6c091e07139ee29e2b965f4b173d6a5d59ce25a35fdb392b7a9358025eb06967.jpeg",
      type: "X-Ray",
      confidence: 0.891,
      date: "2026-05-28",
      patientId: "PID-6671",
      patientName: "Vikram Singh",
      status: "Sorted"
    },
    // 8. MRI
    {
      id: "mri3",
      url: "dataset/mri/7c30fba8107d964583f1461df2485cd04436355fbdb78552dd50448afe1cbb65.jpeg",
      type: "MRI",
      confidence: 0.902,
      date: "2026-05-28",
      patientId: "PID-5091",
      patientName: "Aditi Joshi",
      status: "Sorted"
    },
    // 9. CT Scan
    {
      id: "ct3",
      url: "dataset/ct/74e95084ef28f43d35c9311d58f59022a952f2006cc7266f9b90eff52d0ea339.jpeg",
      type: "CT Scan",
      confidence: 0.887,
      date: "2026-05-28",
      patientId: "PID-1402",
      patientName: "Devendra Verma",
      status: "Sorted"
    },
    // 10. X-Ray
    {
      id: "xray4",
      url: "dataset/xray/bac3c78546df5e38d662a40ba6e31496cb4d18827f36cffbc334b475413b9dcd.jpeg",
      type: "X-Ray",
      confidence: 0.974,
      date: "2026-05-27",
      patientId: "PID-2245",
      patientName: "Neha Sharma",
      status: "Sorted"
    },
    // 11. CT Scan
    {
      id: "ct4",
      url: "dataset/ct/8ec2e2ec52e290eed2c2fe6d07027d59c0cdc890b01ac26fd229d2b23d2b42fd.jpeg",
      type: "CT Scan",
      confidence: 0.961,
      date: "2026-05-27",
      patientId: "PID-9042",
      patientName: "Rohan Das",
      status: "Sorted"
    },
    // 12. MRI
    {
      id: "mri4",
      url: "dataset/mri/7e91d7d979de40a8fe1911d367d6b1dad5c9ffa2e0554d6e8f2c65950dbe9c12.jpeg",
      type: "MRI",
      confidence: 0.935,
      date: "2026-05-27",
      patientId: "PID-1104",
      patientName: "Kiran Nair",
      status: "Sorted"
    },
    // 13. X-Ray
    {
      id: "xray5",
      url: "dataset/xray/e4c29ddcd3f4f9e6cbce2cc49b1f3a94258ecb1ef22ef01d57f7a58f67177729.jpeg",
      type: "X-Ray",
      confidence: 0.922,
      date: "2026-05-26",
      patientId: "PID-4491",
      patientName: "Amit Mishra",
      status: "Sorted"
    },
    // 14. CT Scan
    {
      id: "ct5",
      url: "dataset/ct/991a97be70ee9e560f56946520ffd7c53a78b96533fd8249f99b83d2c135d060.jpeg",
      type: "CT Scan",
      confidence: 0.914,
      date: "2026-05-26",
      patientId: "PID-3367",
      patientName: "Pooja Reddy",
      status: "Sorted"
    },
    // 15. MRI
    {
      id: "mri5",
      url: "dataset/mri/cc1a91bbda5e22d629b9f0ff6533eb71a211597bb2aa5bfb77b7435fa74445ce.jpeg",
      type: "MRI",
      confidence: 0.949,
      date: "2026-05-26",
      patientId: "PID-8910",
      patientName: "Rahul Saxena",
      status: "Sorted"
    },
    // 16. X-Ray
    {
      id: "xray6",
      url: "dataset/xray/00836f9405f2a9e52446d1ecb6f3223eec42edc6ee3be12bf91a12709597b2f2.jpeg",
      type: "X-Ray",
      confidence: 0.932,
      date: "2026-05-25",
      patientId: "PID-4105",
      patientName: "Vijay Yadav",
      status: "Sorted"
    },
    // 17. MRI
    {
      id: "mri6",
      url: "dataset/mri/381bca91a0e6df7f2fc2da69747a13cc1a43b8db453276485fa83e41e6b22eac.jpeg",
      type: "MRI",
      confidence: 0.912,
      date: "2026-05-25",
      patientId: "PID-1982",
      patientName: "Nisha Sen",
      status: "Sorted"
    },
    // 18. CT Scan
    {
      id: "ct6",
      url: "dataset/ct/1bfc84da53e827d3b9074401c3217f54eb7c55feb5b90a1e8e1d13a018c477d5.jpeg",
      type: "CT Scan",
      confidence: 0.965,
      date: "2026-05-25",
      patientId: "PID-8722",
      patientName: "Harish Pillai",
      status: "Sorted"
    },
    // 19. X-Ray
    {
      id: "xray7",
      url: "dataset/xray/07bbb40754b2a4cc14dd50bd334234198a3590000f9ba9475ae21b9bb7233e61.jpeg",
      type: "X-Ray",
      confidence: 0.941,
      date: "2026-05-24",
      patientId: "PID-9102",
      patientName: "Meera Nair",
      status: "Sorted"
    },
    // 20. MRI
    {
      id: "mri7",
      url: "dataset/mri/5fd753281812b8dd7c51d8a94ce740d0ac31f9bbbbedb610fd84bb95f941b309.jpeg",
      type: "MRI",
      confidence: 0.898,
      date: "2026-05-24",
      patientId: "PID-2394",
      patientName: "Deepak Chawla",
      status: "Sorted"
    },
    // 21. CT Scan
    {
      id: "ct7",
      url: "dataset/ct/51545e1594fe05a23fb08c63feef1ec6c1aa2fbfc4fdd63bbc1765957c7e24d6.jpeg",
      type: "CT Scan",
      confidence: 0.915,
      date: "2026-05-24",
      patientId: "PID-1029",
      patientName: "Ritu Kapoor",
      status: "Sorted"
    },
    // 22. X-Ray
    {
      id: "xray8",
      url: "dataset/xray/6c091e07139ee29e2b965f4b173d6a5d59ce25a35fdb392b7a9358025eb06967.jpeg",
      type: "X-Ray",
      confidence: 0.927,
      date: "2026-05-23",
      patientId: "PID-3829",
      patientName: "Alok Dwivedi",
      status: "Sorted"
    },
    // 23. MRI
    {
      id: "mri8",
      url: "dataset/mri/7c30fba8107d964583f1461df2485cd04436355fbdb78552dd50448afe1cbb65.jpeg",
      type: "MRI",
      confidence: 0.974,
      date: "2026-05-23",
      patientId: "PID-7301",
      patientName: "Shweta Tiwari",
      status: "Sorted"
    },
    // 24. CT Scan
    {
      id: "ct8",
      url: "dataset/ct/74e95084ef28f43d35c9311d58f59022a952f2006cc7266f9b90eff52d0ea339.jpeg",
      type: "CT Scan",
      confidence: 0.938,
      date: "2026-05-23",
      patientId: "PID-6490",
      patientName: "Preeti Shenoy",
      status: "Sorted"
    },
    // 25. X-Ray
    {
      id: "xray9",
      url: "dataset/xray/bac3c78546df5e38d662a40ba6e31496cb4d18827f36cffbc334b475413b9dcd.jpeg",
      type: "X-Ray",
      confidence: 0.954,
      date: "2026-05-22",
      patientId: "PID-9011",
      patientName: "Gaurav Malhotra",
      status: "Sorted"
    },
    // 26. MRI
    {
      id: "mri9",
      url: "dataset/mri/7e91d7d979de40a8fe1911d367d6b1dad5c9ffa2e0554d6e8f2c65950dbe9c12.jpeg",
      type: "MRI",
      confidence: 0.943,
      date: "2026-05-22",
      patientId: "PID-3092",
      patientName: "Kavita Rao",
      status: "Sorted"
    },
    // 27. CT Scan
    {
      id: "ct9",
      url: "dataset/ct/8ec2e2ec52e290eed2c2fe6d07027d59c0cdc890b01ac26fd229d2b23d2b42fd.jpeg",
      type: "CT Scan",
      confidence: 0.892,
      date: "2026-05-22",
      patientId: "PID-5021",
      patientName: "Siddharth Joshi",
      status: "Sorted"
    },
    // 28. X-Ray
    {
      id: "xray10",
      url: "dataset/xray/e4c29ddcd3f4f9e6cbce2cc49b1f3a94258ecb1ef22ef01d57f7a58f67177729.jpeg",
      type: "X-Ray",
      confidence: 0.918,
      date: "2026-05-21",
      patientId: "PID-4819",
      patientName: "Rohan Khanna",
      status: "Sorted"
    },
    // 29. MRI
    {
      id: "mri10",
      url: "dataset/mri/cc1a91bbda5e22d629b9f0ff6533eb71a211597bb2aa5bfb77b7435fa74445ce.jpeg",
      type: "MRI",
      confidence: 0.952,
      date: "2026-05-21",
      patientId: "PID-9104",
      patientName: "Aastha Aggarwal",
      status: "Sorted"
    },
    // 30. CT Scan
    {
      id: "ct10",
      url: "dataset/ct/991a97be70ee9e560f56946520ffd7c53a78b96533fd8249f99b83d2c135d060.jpeg",
      type: "CT Scan",
      confidence: 0.947,
      date: "2026-05-21",
      patientId: "PID-3392",
      patientName: "Manoj Bajpayee",
      status: "Sorted"
    },
    // 31. X-Ray
    {
      id: "xray11",
      url: "dataset/xray/00836f9405f2a9e52446d1ecb6f3223eec42edc6ee3be12bf91a12709597b2f2.jpeg",
      type: "X-Ray",
      confidence: 0.962,
      date: "2026-05-20",
      patientId: "PID-8012",
      patientName: "Tanya Sharma",
      status: "Sorted"
    },
    // 32. MRI
    {
      id: "mri11",
      url: "dataset/mri/381bca91a0e6df7f2fc2da69747a13cc1a43b8db453276485fa83e41e6b22eac.jpeg",
      type: "MRI",
      confidence: 0.931,
      date: "2026-05-20",
      patientId: "PID-1403",
      patientName: "Ashish Vidyarthi",
      status: "Sorted"
    },
    // 33. CT Scan
    {
      id: "ct11",
      url: "dataset/ct/1bfc84da53e827d3b9074401c3217f54eb7c55feb5b90a1e8e1d13a018c477d5.jpeg",
      type: "CT Scan",
      confidence: 0.916,
      date: "2026-05-20",
      patientId: "PID-9018",
      patientName: "Kunal Kemmu",
      status: "Sorted"
    },
    // 34. X-Ray
    {
      id: "xray12",
      url: "dataset/xray/07bbb40754b2a4cc14dd50bd334234198a3590000f9ba9475ae21b9bb7233e61.jpeg",
      type: "X-Ray",
      confidence: 0.887,
      date: "2026-05-19",
      patientId: "PID-4592",
      patientName: "Shabana Azmi",
      status: "Sorted"
    },
    // 35. MRI
    {
      id: "mri12",
      url: "dataset/mri/5fd753281812b8dd7c51d8a94ce740d0ac31f9bbbbedb610fd84bb95f941b309.jpeg",
      type: "MRI",
      confidence: 0.969,
      date: "2026-05-19",
      patientId: "PID-2019",
      patientName: "Pankaj Tripathi",
      status: "Sorted"
    },
    // 36. CT Scan
    {
      id: "ct12",
      url: "dataset/ct/51545e1594fe05a23fb08c63feef1ec6c1aa2fbfc4fdd63bbc1765957c7e24d6.jpeg",
      type: "CT Scan",
      confidence: 0.928,
      date: "2026-05-19",
      patientId: "PID-3301",
      patientName: "Nawazuddin Siddiqui",
      status: "Sorted"
    },
    // 37. X-Ray
    {
      id: "xray13",
      url: "dataset/xray/6c091e07139ee29e2b965f4b173d6a5d59ce25a35fdb392b7a9358025eb06967.jpeg",
      type: "X-Ray",
      confidence: 0.948,
      date: "2026-05-18",
      patientId: "PID-6623",
      patientName: "Radhika Apte",
      status: "Sorted"
    },
    // 38. MRI
    {
      id: "mri13",
      url: "dataset/mri/7c30fba8107d964583f1461df2485cd04436355fbdb78552dd50448afe1cbb65.jpeg",
      type: "MRI",
      confidence: 0.914,
      date: "2026-05-18",
      patientId: "PID-1039",
      patientName: "Rajkummar Rao",
      status: "Sorted"
    },
    // 39. CT Scan
    {
      id: "ct13",
      url: "dataset/ct/74e95084ef28f43d35c9311d58f59022a952f2006cc7266f9b90eff52d0ea339.jpeg",
      type: "CT Scan",
      confidence: 0.955,
      date: "2026-05-18",
      patientId: "PID-5020",
      patientName: "Ayushmann Khurrana",
      status: "Sorted"
    },
    // 40. X-Ray
    {
      id: "xray14",
      url: "dataset/xray/bac3c78546df5e38d662a40ba6e31496cb4d18827f36cffbc334b475413b9dcd.jpeg",
      type: "X-Ray",
      confidence: 0.971,
      date: "2026-05-17",
      patientId: "PID-4421",
      patientName: "Bhumi Pednekar",
      status: "Sorted"
    },
    // 41. MRI
    {
      id: "mri14",
      url: "dataset/mri/7e91d7d979de40a8fe1911d367d6b1dad5c9ffa2e0554d6e8f2c65950dbe9c12.jpeg",
      type: "MRI",
      confidence: 0.938,
      date: "2026-05-17",
      patientId: "PID-7732",
      patientName: "Sanya Malhotra",
      status: "Sorted"
    },
    // 42. CT Scan
    {
      id: "ct14",
      url: "dataset/ct/8ec2e2ec52e290eed2c2fe6d07027d59c0cdc890b01ac26fd229d2b23d2b42fd.jpeg",
      type: "CT Scan",
      confidence: 0.923,
      date: "2026-05-17",
      patientId: "PID-9013",
      patientName: "Fatima Sana Shaikh",
      status: "Sorted"
    },
    // 43. X-Ray
    {
      id: "xray15",
      url: "dataset/xray/e4c29ddcd3f4f9e6cbce2cc49b1f3a94258ecb1ef22ef01d57f7a58f67177729.jpeg",
      type: "X-Ray",
      confidence: 0.959,
      date: "2026-05-16",
      patientId: "PID-3382",
      patientName: "Taapsee Pannu",
      status: "Sorted"
    },
    // 44. MRI
    {
      id: "mri15",
      url: "dataset/mri/cc1a91bbda5e22d629b9f0ff6533eb71a211597bb2aa5bfb77b7435fa74445ce.jpeg",
      type: "MRI",
      confidence: 0.941,
      date: "2026-05-16",
      patientId: "PID-4932",
      patientName: "Vicky Kaushal",
      status: "Sorted"
    },
    // 45. CT Scan
    {
      id: "ct15",
      url: "dataset/ct/991a97be70ee9e560f56946520ffd7c53a78b96533fd8249f99b83d2c135d060.jpeg",
      type: "CT Scan",
      confidence: 0.908,
      date: "2026-05-16",
      patientId: "PID-8930",
      patientName: "Sobhita Dhulipala",
      status: "Sorted"
    }
  ];

  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private http = inject(HttpClient);

  constructor() {
    // V4-09 FIX: Removed automatic Firestore seeding of mock patient records.
    // Mock data must never be auto-written to a live Firebase project.
    // Use a separate offline/dev-only seed script if demo data is needed.
  }

  // V4-09 FIX: seedInitialDataIfNeeded() removed from production code.
  // Seeding mock patient records to live Firestore is a security and data
  // integrity risk. Use a separate dev-only seeding script if needed.

  getRecentImages(): Observable<MedicalImage[]> {
    return this.http.get<MedicalImage[]>(`${backendConfig.baseUrl}/api/images`);
  }

  getImageById(id: string): Observable<MedicalImage | undefined> {
    return this.getRecentImages().pipe(
      map(images => images.find(img => img.id === id))
    );
  }

  deleteImage(id: string): Observable<any> {
    return this.http.delete(`${backendConfig.baseUrl}/api/images/${id}`);
  }

  getStats(): Observable<any> {
    return this.getRecentImages().pipe(
      map(images => {
        const counts = { xray: 0, mri: 0, ct: 0, unknown: 0 };
        let totalAcc = 0;
        let validAccCount = 0;

        images.forEach(img => {
          const type = img.type.toLowerCase();
          if (type.includes('x-ray') || type === 'xray') counts.xray++;
          else if (type.includes('mri')) counts.mri++;
          else if (type.includes('ct')) counts.ct++;
          else counts.unknown++;

          totalAcc += img.confidence;
          validAccCount++;
        });

        const avgAccuracy = validAccCount > 0 ? (totalAcc / validAccCount) * 100 : 94.1;

        return {
          totalImages: images.length,
          accuracy: Math.round(avgAccuracy * 10) / 10,
          processingTime: 0.45,
          modalities: 3,
          counts: {
            xray: counts.xray,
            mri: counts.mri,
            ct: counts.ct
          }
        };
      })
    );
  }

  /**
   * V4-13 FIX: inject() moved out of Observable constructor callback.
   * Previously `inject(HttpClient)` was called inside the subscriber context
   * which is outside Angular's DI injection context and throws NG0203 at runtime.
   * HttpClient is now injected at the class field level (see constructor above).
   *
   * V4-09 / VULN-H: Classification is delegated entirely to the Flask backend.
   * The HTTP interceptor attaches the auth token automatically.
   */
  classifyImage(file: File): Observable<{type: string, confidence: number, timeTaken: number}> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{type: string, confidence: number, timeTaken: number}>(
      `${backendConfig.baseUrl}/api/classify`,
      formData
    );
  }
}
