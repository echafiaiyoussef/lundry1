import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route - Twilio send WhatsApp proxy
  app.post("/api/twilio/send", async (req, res) => {
    try {
      const { accountSid, authToken, fromNumber, toPhone, message } = req.body;
      
      if (!accountSid || !authToken || !fromNumber || !toPhone || !message) {
        return res.status(400).json({ success: false, error: "Missing required Twilio parameters." });
      }

      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      
      const bodyParams = new URLSearchParams();
      bodyParams.append('To', toPhone);
      bodyParams.append('From', fromNumber);
      bodyParams.append('Body', message);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Twilio API Error:", errorData);
        return res.status(response.status).json({ success: false, error: errorData });
      }

      const responseData = await response.json();
      return res.json({ success: true, data: responseData });
    } catch (error: any) {
      console.error("Twilio Proxy Server Error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // API Route - Gemini prompt generation proxy
  app.post("/api/gemini/generate-reminder", async (req, res) => {
    try {
      const { order, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        console.error("GEMINI_API_KEY is missing on the server.");
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const fallbackMessages = {
        RECEIVED: `مرحباً ${order?.customer_name || ''} نود إعلامكم بأننا استلمنا طلبكم رقم ${order?.order_number || ''} ونحن نعمل عليه الآن لضمان تقديمه بأفضل جودة. إجمالي قيمة الطلب هي ${(order?.total || 0).toFixed(2)} ريال سعودي. شكراً لاختياركم لنا ويسعدنا دائماً خدمتكم.`,
        READY: `مرحباً ${order?.customer_name || ''} نود إعلامكم بأن طلبكم رقم ${order?.order_number || ''} قد تم الانتهاء منه وهو جاهز تماماً وبانتظاركم لاستلامه الآن. إجمالي المبلغ هو ${(order?.total || 0).toFixed(2)} ريال سعودي. يسعدنا حضوركم.`,
        REMINDER: `مرحباً ${order?.customer_name || ''}، نود تذكيركم بأن طلبكم رقم ${order?.order_number || ''} جاهز للاستلام. نسعد بزيارتكم.`
      };

      let specificContext = "";
      if (context === 'RECEIVED') {
        specificContext = `رسالة استلام طلب: "${fallbackMessages.RECEIVED}"`;
      } else if (context === 'READY') {
        specificContext = `رسالة جاهزية طلب: "${fallbackMessages.READY}"`;
      } else {
        specificContext = fallbackMessages.REMINDER;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
          Generate a polite WhatsApp message in Arabic for a laundry customer.
          Context: ${specificContext}
          
          RULES:
          1. Use plain text only.
          2. Keep the same meaning and information as the provided context.
          3. Start with "مرحباً [Name]".
        `,
      });

      const text = response.text || (context === 'RECEIVED' ? fallbackMessages.RECEIVED : fallbackMessages.READY);
      return res.json({ text });
    } catch (error: any) {
      console.error("Gemini server error for reminder:", error);
      const { order, context } = req.body;
      const fallbackMessages = {
        RECEIVED: `مرحباً ${order?.customer_name || ''} نود إعلامكم بأننا استلمنا طلبكم رقم ${order?.order_number || ''} ونحن نعمل عليه الآن لضمان تقديمه بأفضل جودة. إجمالي قيمة الطلب هي ${(order?.total || 0).toFixed(2)} ريال سعودي. شكراً لاختياركم لنا ويسعدنا دائماً خدمتكم.`,
        READY: `مرحباً ${order?.customer_name || ''} نود إعلامكم بأن طلبكم رقم ${order?.order_number || ''} قد تم الانتهاء منه وهو جاهز تماماً وبانتظاركم لاستلامه الآن. إجمالي المبلغ هو ${(order?.total || 0).toFixed(2)} ريال سعودي. يسعدنا حضوركم.`,
        REMINDER: `مرحباً ${order?.customer_name || ''}، نود تذكيركم بأن طلبكم رقم ${order?.order_number || ''} جاهز للاستلام. نسعد بزيارتكم.`
      };

      const text = context === 'RECEIVED' ? fallbackMessages.RECEIVED : (context === 'READY' ? fallbackMessages.READY : fallbackMessages.REMINDER);
      return res.json({ text });
    }
  });

  // API Route - Gemini financial summary proxy
  app.post("/api/gemini/financial-summary", async (req, res) => {
    try {
      const { orders, inventory } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const totalRevenue = orders.reduce((acc: number, o: any) => acc + (o.total || 0), 0);
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze: Total Revenue ${totalRevenue} SAR. Summary in Arabic plain text.`,
      });

      return res.json({ text: response.text || "المؤشرات المالية مستقرة." });
    } catch (error: any) {
      console.error("Gemini server error for financial summary:", error);
      return res.json({ text: "لا يمكن حالياً تحليل البيانات المالية." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
