import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

// A simplified ML model simulation: forecast biasRisk based on 7-30 day trends
export const predictFairness = onSchedule(
  { schedule: "0 3 * * *", region: "asia-southeast1", timeoutSeconds: 300 },
  async () => {
    const db = admin.firestore();
    const metricsSnap = await db.collection("metrics_daily").orderBy("ts", "desc").limit(90).get();
    if (metricsSnap.empty) {
        console.log("No metrics data found for prediction.");
        return;
    }

    const data = metricsSnap.docs.map(d => d.data() as any);

    // Group metrics by partnerId
    const partnerMetrics = data.reduce((acc: any, m: any) => {
        if (!acc[m.partnerId]) {
            acc[m.partnerId] = { partnerId: m.partnerId, series: [] };
        }
        // A simple risk indicator: deviation from ideal performance
        acc[m.partnerId].series.push((1 - m.uptime) + (1 - m.verifyRate));
        return acc;
    }, {});

    const forecast = Object.values(partnerMetrics).map((p: any) => {
      if (p.series.length < 2) {
        return { partnerId: p.partnerId, riskForecast: 0 };
      }
      const avg = p.series.reduce((s: number, x: number) => s + x, 0) / p.series.length;
      // Simple trend calculation (latest - oldest)
      const trend = p.series[0] - p.series[p.series.length - 1]; 
      
      // Forecast = current average + half of the trend
      const riskForecast = Math.max(0, avg + trend / 2);
      
      return { 
        partnerId: p.partnerId, 
        riskForecast: Number(riskForecast.toFixed(4)) 
      };
    });
    
    const reportId = new Date().toISOString().slice(0, 10);
    await db.collection("predictions").doc(reportId).set({ 
        createdAt: new Date(),
        forecast 
    });

    console.log(`Predictive fairness forecast saved for ${forecast.length} partners.`);
  }
);
