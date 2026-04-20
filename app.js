const OPENROUTER_API_KEY = "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";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-flash-1.5";

async function generatePlan() {
  const name = plantName.value.trim();
  const soil = soil.value;
  const season = season.value;

  if (!name || !soil || !season) {
    alert("الرجاء إدخال اسم النبتة، نوع التربة، والفصل");
    return;
  }

  const result = document.getElementById("result");
  result.style.display = "block";
  result.innerHTML = "🌱 الذكاء الاصطناعي يخطط أفضل تسميد لنبتتك...";

  const systemPrompt = `
أنت خبير زراعي متخصص في التسميد المستدام.
تُخرج فقط JSON صحيح بدون أي نص إضافي.
`;

  const userPrompt = `
بيانات النبتة:
- الاسم: ${name}
- التربة: ${soil}
- الفصل: ${season}

أخرج JSON مطابق للبنية التالية فقط:

{
  "summary": "شرح مختصر لأهمية التسميد لهذه النبتة في هذا الفصل",
  "fertilizationTable": [
    {
      "period":"بداية الفصل",
      "fertilizer":"نوع السماد",
      "amount":"الكمية",
      "frequency":"التكرار",
      "purpose":"الهدف"
    },
    {
      "period":"منتصف الفصل",
      "fertilizer":"...",
      "amount":"...",
      "frequency":"...",
      "purpose":"..."
    }
  ],
  "sustainabilityTips":[
    "نصيحة",
    "نصيحة",
    "نصيحة"
  ]
}
`;

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "سماد",
        "HTTP-Referer": window.location.origin
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.6,
        max_tokens: 900,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const data = await res.json();
    const raw = data.choices[0].message.content.replace(/```json|```/g, "").trim();
    const ai = JSON.parse(raw);

    renderAIResult(ai, name);

  } catch (e) {
    result.innerHTML = "❌ حدث خطأ أثناء التحليل. تأكد من تشغيل الموقع عبر localhost.";
    console.error(e);
  }
}

function renderAIResult(ai, plantName) {
  const rows = ai.fertilizationTable.map(r => `
    <tr>
      <td>${r.period}</td>
      <td>${r.fertilizer}</td>
      <td>${r.amount}</td>
      <td>${r.frequency}</td>
      <td>${r.purpose}</td>
    </tr>
  `).join("");

  const tips = ai.sustainabilityTips.map(t => `<li>${t}</li>`).join("");

  document.getElementById("result").innerHTML = `
    <h2>📋 جدول تسميد ${plantName}</h2>
    <p>${ai.summary}</p>

    <table>
      <tr>
        <th>الفترة</th>
        <th>السماد</th>
        <th>الكمية</th>
        <th>التكرار</th>
        <th>الهدف</th>
      </tr>
      ${rows}
    </table>

    <h3>♻️ استدامة التسميد</h3>
    <ul>${tips}</ul>
  `;
}
``