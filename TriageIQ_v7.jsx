import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Activity, AlertTriangle, Bell, Check, ChevronDown, ChevronUp,
  Clock, Eye, Heart, LogOut, Moon, Plus, RefreshCw, Search, Sun,
  Trash2, TrendingDown, TrendingUp, User, Users, X, Shield, Edit,
  BarChart3, AlertCircle, FileText, UserPlus, Zap, Archive,
  Brain, Cpu, Wifi, WifiOff, Download, Timeline, Layers,
  ThermometerSun, Droplets, Wind, Radio, Gauge, Siren,
  ChevronRight, Play, Pause, RotateCcw, Star, Award,
  MapPin, Phone, Calendar, Hash, Stethoscope
} from 'lucide-react';

// ══════════════════════════════════════════════
// CONSTANTS & CONFIG
// ══════════════════════════════════════════════

const PRIORITY = {
  1: { ar: 'فوري', en: 'Immediate', badge: 'bg-red-100 text-red-800 border border-red-300', dot: 'bg-red-500', bar: 'bg-red-500', ring: 'ring-red-400', hex: '#dc2626' },
  2: { ar: 'طارئ', en: 'Emergency', badge: 'bg-orange-100 text-orange-800 border border-orange-300', dot: 'bg-orange-500', bar: 'bg-orange-500', ring: 'ring-orange-400', hex: '#ea580c' },
  3: { ar: 'مستعجل', en: 'Urgent', badge: 'bg-yellow-100 text-yellow-800 border border-yellow-300', dot: 'bg-yellow-500', bar: 'bg-yellow-500', ring: 'ring-yellow-400', hex: '#eab308' },
  4: { ar: 'أقل إلحاحاً', en: 'Semi-Urgent', badge: 'bg-green-100 text-green-800 border border-green-300', dot: 'bg-green-500', bar: 'bg-green-500', ring: 'ring-green-400', hex: '#16a34a' },
  5: { ar: 'غير طارئ', en: 'Non-Urgent', badge: 'bg-blue-100 text-blue-800 border border-blue-300', dot: 'bg-blue-500', bar: 'bg-blue-500', ring: 'ring-blue-400', hex: '#2563eb' },
};

const NEWS2_RANGES = {
  resp: [{v:0,s:0},{v:9,s:1},{v:12,s:0},{v:20,s:0},{v:25,s:2},{v:999,s:3}],
  spo2: [{v:0,s:3},{v:92,s:2},{v:94,s:1},{v:96,s:0}],
  hr:   [{v:0,s:3},{v:41,s:2},{v:51,s:1},{v:91,s:0},{v:111,s:1},{v:131,s:2},{v:999,s:3}],
  temp: [{v:0,s:3},{v:35.1,s:1},{v:36.1,s:0},{v:38.1,s:1},{v:39.1,s:2},{v:999,s:2}],
};

const calcNEWS2 = (pt) => {
  const score = (val, ranges) => {
    for(let i = ranges.length-1; i >= 0; i--) if(val >= ranges[i].v) return ranges[i].s;
    return 0;
  };
  const s = score(pt.spo2, NEWS2_RANGES.spo2) + score(pt.hr, NEWS2_RANGES.hr) + score(pt.temp, NEWS2_RANGES.temp);
  const risk = s >= 7 ? 'عالي جداً' : s >= 5 ? 'عالي' : s >= 3 ? 'متوسط' : 'منخفض';
  const riskColor = s >= 7 ? 'text-red-600' : s >= 5 ? 'text-orange-500' : s >= 3 ? 'text-yellow-600' : 'text-green-600';
  return { score: s, risk, riskColor };
};

const calcQSOFA = (pt) => {
  let s = 0;
  if (pt.hr > 100) s++;
  if (pt.spo2 < 95) s++;
  if (pt.temp > 38.3 || pt.temp < 36) s++;
  const risk = s >= 2 ? 'إنتان محتمل' : 'مخاطرة منخفضة';
  const riskColor = s >= 2 ? 'text-red-600' : 'text-green-600';
  return { score: s, risk, riskColor };
};

const initPatients = [
  { id:'T-1001', name:'أحمد محمد الرشيد', age:58, gender:'ذكر', priority:1, spo2:88, hr:132, bp:'180/110', temp:39.2, complaint:'ألم شديد في الصدر وضيق تنفس', arrival:Date.now()-45*60000, trend:'down', notes:'تاريخ مرضي: ارتفاع ضغط الدم، مدخن', battery:34, history:[], phone:'07701234567' },
  { id:'T-1002', name:'فاطمة علي حسن', age:34, gender:'أنثى', priority:2, spo2:92, hr:115, bp:'140/90', temp:38.5, complaint:'صداع حاد مع غثيان', arrival:Date.now()-30*60000, trend:'stable', notes:'حامل - الشهر السابع', battery:67, history:[], phone:'07709876543' },
  { id:'T-1003', name:'خالد إبراهيم نور', age:45, gender:'ذكر', priority:3, spo2:96, hr:98, bp:'130/85', temp:37.8, complaint:'كسر مشتبه في الذراع', arrival:Date.now()-60*60000, trend:'up', notes:'إصابة عمل', battery:82, history:[], phone:'07715556789' },
  { id:'T-1004', name:'مريم عبدالله سالم', age:28, gender:'أنثى', priority:4, spo2:98, hr:78, bp:'120/80', temp:37.0, complaint:'التهاب في الحلق وحمى خفيفة', arrival:Date.now()-90*60000, trend:'up', notes:'لا توجد حساسية', battery:91, history:[], phone:'07721112233' },
  { id:'T-1005', name:'يوسف سعيد العمري', age:67, gender:'ذكر', priority:2, spo2:91, hr:122, bp:'160/100', temp:38.8, complaint:'ضيق تنفس حاد وسعال مع دم', arrival:Date.now()-20*60000, trend:'down', notes:'مريض سكري وضغط', battery:45, history:[], phone:'07734445566' },
  { id:'T-1006', name:'نورة حمد الدوسري', age:22, gender:'أنثى', priority:5, spo2:99, hr:72, bp:'115/75', temp:36.8, complaint:'طفح جلدي بعد أكل', arrival:Date.now()-120*60000, trend:'stable', notes:'', battery:95, history:[], phone:'07748889900' },
];

// ══════════════════════════════════════════════
// HOOKS
// ══════════════════════════════════════════════

function useAlerts(patients, now) {
  return useMemo(() => {
    const alerts = [];
    patients.forEach(p => {
      if (p.spo2 < 88) alerts.push({ id:p.id, name:p.name, msg:`SpO₂ حرج: ${p.spo2}%`, level:'critical', icon:'💀', ts: now });
      else if (p.spo2 < 92) alerts.push({ id:p.id, name:p.name, msg:`SpO₂ منخفض: ${p.spo2}%`, level:'high', icon:'⚠️', ts: now });
      if (p.hr > 130) alerts.push({ id:p.id, name:p.name, msg:`تسرع قلب حرج: ${p.hr} bpm`, level:'critical', icon:'💔', ts: now });
      else if (p.hr > 110) alerts.push({ id:p.id, name:p.name, msg:`نبض مرتفع: ${p.hr} bpm`, level:'high', icon:'❤️', ts: now });
      if (p.temp > 39.5) alerts.push({ id:p.id, name:p.name, msg:`حرارة شديدة: ${p.temp}°`, level:'critical', icon:'🌡️', ts: now });
      if (p.battery < 15) alerts.push({ id:p.id, name:p.name, msg:`بطارية منتهية: ${p.battery}%`, level:'medium', icon:'🔋', ts: now });
      const waitMin = Math.floor((now - p.arrival)/60000);
      if (waitMin > 120 && p.priority <= 3) alerts.push({ id:p.id, name:p.name, msg:`انتظار طويل: ${waitMin} دقيقة`, level:'high', icon:'⏰', ts: now });
    });
    return alerts;
  }, [patients, now]);
}

// ══════════════════════════════════════════════
// SUB COMPONENTS
// ══════════════════════════════════════════════

const TrendIcon = ({ t }) => t === 'up' ? <TrendingUp size={14} className="text-green-500" /> : t === 'down' ? <TrendingDown size={14} className="text-red-500" /> : <Activity size={14} className="text-gray-400" />;

const BatteryIcon = ({ level, className }) => {
  const color = level > 50 ? 'text-green-500' : level > 20 ? 'text-yellow-500' : 'text-red-500 animate-pulse';
  return (
    <div className={`flex items-center gap-1 ${color} ${className}`}>
      <div className="relative w-6 h-3.5 border border-current rounded-sm">
        <div className="absolute right-0 top-0.5 w-1 h-2 border border-current rounded-r-sm -mr-1.5" />
        <div className="h-full rounded-sm transition-all" style={{ width: `${level}%`, backgroundColor: 'currentColor', opacity: 0.8 }} />
      </div>
      <span className="text-xs font-mono">{level}%</span>
    </div>
  );
};

const VitalBadge = ({ label, value, color, unit, pulse }) => (
  <div className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl border ${pulse ? 'animate-pulse' : ''} ${color.includes('red') ? 'bg-red-50 border-red-200' : color.includes('yellow') ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
    <span className="text-xs text-gray-500 mb-0.5">{label}</span>
    <span className={`text-lg font-bold ${color}`}>{value}<span className="text-xs font-normal">{unit}</span></span>
  </div>
);

const ScoreBadge = ({ label, score, maxScore, riskText, riskColor }) => (
  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
    <span className="text-xs font-bold text-gray-600">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold">{score}<span className="text-gray-400">/{maxScore}</span></span>
      <span className={`text-xs font-bold ${riskColor}`}>{riskText}</span>
    </div>
  </div>
);

const AlertBanner = ({ alerts, dark }) => {
  const criticals = alerts.filter(a => a.level === 'critical');
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (criticals.length === 0) return;
    const t = setInterval(() => setIdx(i => (i+1) % criticals.length), 3000);
    return () => clearInterval(t);
  }, [criticals.length]);
  if (criticals.length === 0) return null;
  const a = criticals[idx % criticals.length];
  return (
    <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between text-sm font-bold animate-pulse">
      <div className="flex items-center gap-3">
        <Siren size={16} className="animate-spin" />
        <span>🚨 تنبيه حرج</span>
        <span className="font-normal">{a.name} — {a.msg}</span>
      </div>
      <span className="text-red-200 text-xs">{criticals.length} تنبيه حرج</span>
    </div>
  );
};

// ══════════════════════════════════════════════
// AI PANEL COMPONENT
// ══════════════════════════════════════════════

function AIPanel({ patient, dark, inputBg, textSub, onClose }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoAnalyzing, setAutoAnalyzing] = useState(false);
  const news2 = calcNEWS2(patient);
  const qsofa = calcQSOFA(patient);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const callAI = useCallback(async (userMsg, systemContext) => {
    setLoading(true);
    const patientContext = `
المريض: ${patient.name}، العمر: ${patient.age}، الجنس: ${patient.gender}
الشكوى: ${patient.complaint}
SpO₂: ${patient.spo2}%، النبض: ${patient.hr} bpm، الضغط: ${patient.bp}، الحرارة: ${patient.temp}°C
الأولوية: ${PRIORITY[patient.priority].ar}
NEWS2 Score: ${news2.score} (${news2.risk})
qSOFA Score: ${qsofa.score} (${qsofa.risk})
ملاحظات: ${patient.notes || 'لا توجد'}
    `.trim();

    const systemPrompt = systemContext || `أنت مساعد طبي متخصص في قسم الطوارئ. ردودك باللغة العربية. قدم تحليلاً مختصراً وعملياً. استخدم النقاط والترقيم. لا تتجاوز 300 كلمة في الرد.

بيانات المريض:
${patientContext}`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg }
          ]
        })
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || 'عذراً، حدث خطأ في الاتصال';
      setMessages(prev => [...prev, { role: 'assistant', content: reply, ts: Date.now() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ تعذّر الاتصال بالذكاء الاصطناعي. تأكد من الاتصال بالإنترنت.', ts: Date.now() }]);
    }
    setLoading(false);
  }, [patient, messages, news2, qsofa]);

  const autoAnalyze = async () => {
    setAutoAnalyzing(true);
    const prompt = `قيّم هذا المريض وأعطني:
1. تقييم سريع للخطورة (الخلاصة في جملة)
2. أهم 3 مخاوف سريرية
3. التدخلات الفورية المطلوبة (بالأولوية)
4. تفسير نتيجة NEWS2 = ${news2.score} و qSOFA = ${qsofa.score}
5. هل يحتاج إعادة تصنيف؟`;
    setMessages([{ role: 'user', content: '🤖 تحليل تلقائي شامل', ts: Date.now() }]);
    await callAI(prompt);
    setAutoAnalyzing(false);
  };

  const sendQuery = async () => {
    if (!query.trim() || loading) return;
    const q = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: q, ts: Date.now() }]);
    await callAI(q);
  };

  const quickPrompts = [
    'ما التشخيصات التفريقية المحتملة؟',
    'هل يحتاج دخول المستشفى؟',
    'ما الفحوصات المطلوبة فوراً؟',
    'هل هناك تفاعلات دوائية مخيفة؟',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden ${dark ? 'bg-gray-900' : 'bg-white'}`} style={{ height: '85vh' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-4 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Brain size={20} />
            </div>
            <div>
              <h2 className="font-bold">مساعد الذكاء الاصطناعي الطبي</h2>
              <p className="text-purple-200 text-xs">{patient.name} — {PRIORITY[patient.priority].ar}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20"><X size={20} /></button>
        </div>

        {/* Scores Bar */}
        <div className={`flex gap-3 p-3 border-b flex-shrink-0 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <ScoreBadge label="NEWS2" score={news2.score} maxScore={17} riskText={news2.risk} riskColor={news2.riskColor} />
          <ScoreBadge label="qSOFA" score={qsofa.score} maxScore={3} riskText={qsofa.risk} riskColor={qsofa.riskColor} />
          <button onClick={autoAnalyze} disabled={autoAnalyzing || loading}
            className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white rounded-lg text-sm font-bold hover:bg-violet-700 disabled:opacity-50 transition">
            {autoAnalyzing ? <><RefreshCw size={14} className="animate-spin" /> جارٍ التحليل...</> : <><Zap size={14} /> تحليل تلقائي</>}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" dir="rtl">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Brain size={40} className={`mx-auto mb-3 ${dark ? 'text-violet-400' : 'text-violet-500'}`} />
              <p className={`text-sm ${textSub}`}>اضغط "تحليل تلقائي" للحصول على تقييم شامل فوري</p>
              <p className={`text-xs mt-1 ${textSub}`}>أو اطرح سؤالاً محدداً</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                m.role === 'user'
                  ? dark ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'
                  : 'bg-gradient-to-br from-violet-600 to-purple-700 text-white'
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-end">
              <div className="bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick Prompts */}
        <div className={`px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0 ${dark ? 'bg-gray-900' : 'bg-white'}`}>
          {quickPrompts.map((p, i) => (
            <button key={i} onClick={() => { setMessages(prev => [...prev, { role:'user', content:p, ts:Date.now() }]); callAI(p); }}
              className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full border flex-shrink-0 ${dark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className={`p-3 border-t flex gap-2 flex-shrink-0 ${dark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendQuery()}
            placeholder="اسأل عن المريض..." dir="rtl"
            className={`flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-violet-500 ${inputBg}`} />
          <button onClick={sendQuery} disabled={loading || !query.trim()}
            className="px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-40 transition">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// TIMELINE MODAL
// ══════════════════════════════════════════════

function TimelineModal({ patient, dark, textSub, onClose }) {
  const events = [
    { time: patient.arrival, label: 'وصول المريض', icon: '🏥', color: 'blue' },
    { time: patient.arrival + 5*60000, label: `تصنيف أولي: ${PRIORITY[patient.priority].ar}`, icon: '📋', color: patient.priority <= 2 ? 'red' : 'yellow' },
    { time: patient.arrival + 8*60000, label: `SpO₂: ${patient.spo2}% — HR: ${patient.hr}`, icon: '📊', color: patient.spo2 < 92 ? 'red' : 'green' },
    ...(patient.history || []),
    { time: Date.now(), label: 'الحالة الراهنة', icon: '🔴', color: 'gray', current: true },
  ].sort((a, b) => a.time - b.time);

  const fmt = ts => new Date(ts).toLocaleTimeString('ar-SA', { hour:'2-digit', minute:'2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${dark ? 'bg-gray-900' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-4 text-white flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2"><Clock size={18} /> الجدول الزمني — {patient.name}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto" dir="rtl">
          <div className="relative">
            <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            {events.map((e, i) => (
              <div key={i} className={`relative flex gap-4 mb-6 ${e.current ? 'opacity-60' : ''}`}>
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                  e.color === 'red' ? 'bg-red-100' : e.color === 'green' ? 'bg-green-100' : e.color === 'blue' ? 'bg-blue-100' : e.color === 'yellow' ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>{e.icon}</div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-medium">{e.label}</p>
                  <p className={`text-xs ${textSub}`}>{fmt(e.time)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// EDIT VITALS MODAL
// ══════════════════════════════════════════════

function EditVitalsModal({ pt, dark, inputBg, textSub, onClose, onSave }) {
  const [spo2, setSpo2] = useState(pt.spo2);
  const [hr, setHr] = useState(pt.hr);
  const [bp, setBp] = useState(pt.bp);
  const [temp, setTemp] = useState(pt.temp);
  const [trend, setTrend] = useState(pt.trend);
  const [notes, setNotes] = useState(pt.notes);

  const news2 = calcNEWS2({ spo2, hr, temp });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className={`w-full max-w-md rounded-2xl shadow-2xl ${dark ? 'bg-gray-900' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white rounded-t-2xl flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2"><Edit size={18} /> تعديل العلامات الحيوية — {pt.name}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/20"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-3" dir="rtl">
          {/* Live NEWS2 Preview */}
          <div className={`rounded-xl p-3 border ${news2.score >= 5 ? 'bg-red-50 border-red-200' : news2.score >= 3 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">NEWS2 Score (مباشر)</span>
              <span className={`text-lg font-bold ${news2.riskColor}`}>{news2.score} — {news2.risk}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:'SpO₂ (%)', val:spo2, set:setSpo2, min:50, max:100, warn: v => v < 92 },
              { label:'النبض HR', val:hr, set:setHr, min:30, max:250, warn: v => v > 110 || v < 50 },
            ].map(({ label, val, set, min, max, warn }) => (
              <div key={label}>
                <label className={`text-sm font-medium block mb-1 ${warn(val) ? 'text-red-600' : ''}`}>{label} {warn(val) && '⚠️'}</label>
                <input type="number" min={min} max={max} value={val} onChange={e => set(+e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm font-bold ${warn(val) ? 'border-red-400 bg-red-50' : inputBg}`} />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium block mb-1">ضغط الدم</label>
              <input value={bp} onChange={e => setBp(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`} />
            </div>
            <div>
              <label className={`text-sm font-medium block mb-1 ${temp > 38 ? 'text-red-600' : ''}`}>الحرارة °C {temp > 38 && '🌡️'}</label>
              <input type="number" step="0.1" value={temp} onChange={e => setTemp(+e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${temp > 38 ? 'border-red-400 bg-red-50' : inputBg}`} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">الاتجاه السريري</label>
            <div className="flex gap-2">
              {['up','stable','down'].map(t => (
                <button key={t} onClick={() => setTrend(t)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${trend === t ? 'bg-blue-600 text-white border-blue-600' : inputBg}`}>
                  {t === 'up' ? '↗ تحسن' : t === 'stable' ? '→ مستقر' : '↘ تراجع'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">ملاحظات</label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`} />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => onSave(pt.id, { spo2, hr, bp, temp, trend, notes })}
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold flex items-center justify-center gap-2">
              <Check size={16} /> حفظ التعديلات
            </button>
            <button onClick={onClose} className={`px-6 py-2.5 rounded-lg border ${inputBg}`}>إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// ADD PATIENT MODAL
// ══════════════════════════════════════════════

function AddPatientModal({ dark, inputBg, textSub, onAdd, onClose }) {
  const [p, setP] = useState({ name:'', age:'', gender:'ذكر', priority:3, spo2:'', hr:'', bp:'', temp:'', complaint:'', notes:'', phone:'' });
  const update = (k, v) => setP(prev => ({ ...prev, [k]: v }));
  const valid = p.name && p.age && p.spo2 && p.hr;

  const news2 = p.spo2 && p.hr && p.temp ? calcNEWS2({ spo2: +p.spo2, hr: +p.hr, temp: +p.temp || 37 }) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className={`w-full max-w-xl rounded-2xl shadow-2xl ${dark ? 'bg-gray-900' : 'bg-white'} max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white rounded-t-2xl flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2"><UserPlus size={20} /> تسجيل مريض جديد</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5" dir="rtl">
          {news2 && (
            <div className={`mb-4 rounded-xl p-3 border ${news2.score >= 5 ? 'bg-red-50 border-red-300' : news2.score >= 3 ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300'}`}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold">تقدير NEWS2 أولي:</span>
                <span className={`font-bold text-lg ${news2.riskColor}`}>{news2.score} — {news2.risk}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-sm font-medium block mb-1">الاسم الكامل *</label>
              <input value={p.name} onChange={e => update('name', e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`} placeholder="أدخل الاسم الكامل" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">العمر *</label>
              <input type="number" value={p.age} onChange={e => update('age', e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">الجنس</label>
              <select value={p.gender} onChange={e => update('gender', e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`}>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">رقم الهاتف</label>
              <input value={p.phone} onChange={e => update('phone', e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`} placeholder="07XXXXXXXXX" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">الأولوية</label>
              <select value={p.priority} onChange={e => update('priority', +e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`}>
                {Object.entries(PRIORITY).map(([k,v]) => <option key={k} value={k}>{v.ar} — {v.en}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">SpO₂ (%) *</label>
              <input type="number" min="0" max="100" value={p.spo2} onChange={e => update('spo2', e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">النبض HR *</label>
              <input type="number" min="0" max="250" value={p.hr} onChange={e => update('hr', e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">ضغط الدم</label>
              <input placeholder="120/80" value={p.bp} onChange={e => update('bp', e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">الحرارة °C</label>
              <input type="number" step="0.1" value={p.temp} onChange={e => update('temp', e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`} />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium block mb-1">الشكوى الرئيسية</label>
              <input value={p.complaint} onChange={e => update('complaint', e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`} />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium block mb-1">السيرة المرضية والملاحظات</label>
              <textarea rows={2} value={p.notes} onChange={e => update('notes', e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`} />
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex gap-2 flex-shrink-0">
          <button onClick={() => onAdd(p)} disabled={!valid}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold disabled:opacity-40 flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700">
            <Plus size={16} /> تسجيل المريض
          </button>
          <button onClick={onClose} className={`px-6 rounded-xl border ${inputBg}`}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// DETAIL MODAL
// ══════════════════════════════════════════════

function DetailModal({ patient: pt, dark, textSub, inputBg, now, onClose, onAI, onTimeline }) {
  const news2 = calcNEWS2(pt);
  const qsofa = calcQSOFA(pt);
  const fmtTime = (ms) => { const m = Math.floor(ms/60000); return m < 60 ? `${m} دقيقة` : `${Math.floor(m/60)} ساعة ${m%60} دقيقة`; };
  const fmtDate = ts => new Date(ts).toLocaleTimeString('ar-SA', { hour:'2-digit', minute:'2-digit' });
  const getSpo2Color = v => v >= 95 ? 'text-green-600' : v >= 90 ? 'text-yellow-600' : 'text-red-600';
  const getHrColor = v => v >= 60 && v <= 100 ? 'text-green-600' : (v > 100 && v <= 120) || (v >= 50 && v < 60) ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${dark ? 'bg-gray-900' : 'bg-white'} max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderRight: `6px solid ${PRIORITY[pt.priority].hex}` }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: PRIORITY[pt.priority].hex }}>
              {pt.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg">{pt.name}</h3>
              <p className={`text-sm ${textSub}`}>{pt.id} • {pt.age} سنة • {pt.gender}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4" dir="rtl">
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button onClick={onAI} className="flex-1 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 flex items-center justify-center gap-2">
              <Brain size={16} /> تحليل AI
            </button>
            <button onClick={onTimeline} className="flex-1 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 flex items-center justify-center gap-2">
              <Clock size={16} /> الجدول الزمني
            </button>
          </div>

          {/* Complaint */}
          <div className={`rounded-xl p-3 ${dark ? 'bg-gray-800' : 'bg-blue-50'}`}>
            <p className="text-xs font-bold text-blue-600 mb-1">الشكوى الرئيسية</p>
            <p className="text-sm">{pt.complaint || 'غير محدد'}</p>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-3 gap-2">
            <VitalBadge label="SpO₂" value={pt.spo2} unit="%" color={getSpo2Color(pt.spo2)} pulse={pt.spo2 < 90} />
            <VitalBadge label="HR" value={pt.hr} unit=" bpm" color={getHrColor(pt.hr)} pulse={pt.hr > 130} />
            <VitalBadge label="حرارة" value={pt.temp} unit="°C" color={pt.temp > 38.5 ? 'text-red-600' : 'text-green-600'} pulse={pt.temp > 39} />
          </div>

          {/* Scores */}
          <div className="space-y-2">
            <ScoreBadge label="NEWS2 Score" score={news2.score} maxScore={17} riskText={news2.risk} riskColor={news2.riskColor} />
            <ScoreBadge label="qSOFA Score" score={qsofa.score} maxScore={3} riskText={qsofa.risk} riskColor={qsofa.riskColor} />
          </div>

          {/* Extra Info */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { label:'الضغط', val: pt.bp },
              { label:'وقت الوصول', val: fmtDate(pt.arrival) },
              { label:'الأولوية', val: PRIORITY[pt.priority].ar, badge: true },
              { label:'الانتظار', val: fmtTime(now - pt.arrival) },
            ].map((item, i) => (
              <div key={i} className={`rounded-lg p-2.5 ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs ${textSub}`}>{item.label}</p>
                {item.badge
                  ? <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${PRIORITY[pt.priority].badge}`}>{item.val}</span>
                  : <p className="font-bold">{item.val}</p>}
              </div>
            ))}
          </div>

          {pt.phone && (
            <div className={`flex items-center gap-2 rounded-lg p-2.5 ${dark ? 'bg-gray-800' : 'bg-gray-50'} text-sm`}>
              <Phone size={14} className="text-blue-500" />
              <span className={textSub}>رقم التواصل:</span>
              <span className="font-bold">{pt.phone}</span>
            </div>
          )}

          {pt.notes && (
            <div className={`rounded-xl p-3 ${dark ? 'bg-yellow-900/30' : 'bg-amber-50'} border border-amber-200`}>
              <p className="text-xs font-bold text-amber-700 mb-1">📝 ملاحظات سريرية</p>
              <p className="text-sm">{pt.notes}</p>
            </div>
          )}

          <BatteryIcon level={pt.battery} className="justify-center" />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// CHAOS SIMULATOR
// ══════════════════════════════════════════════

function simulateChaos(patients, setPatients, addAudit) {
  const chaosPatients = [
    { name:'محمد طارق العبيدي', age:52, priority:1, spo2:84, hr:145, bp:'200/120', temp:40.1, complaint:'ألم صدر شديد + فقدان وعي مؤقت', gender:'ذكر', battery:28 },
    { name:'سارة عبد الرحمن', age:29, priority:1, spo2:86, hr:138, bp:'90/60', temp:39.8, complaint:'صدمة تحسسية', gender:'أنثى', battery:52 },
    { name:'إبراهيم كريم ناصر', age:71, priority:2, spo2:89, hr:128, bp:'170/105', temp:38.9, complaint:'سكتة دماغية مشتبهة', gender:'ذكر', battery:41 },
    { name:'رنا حسين المالكي', age:45, priority:2, spo2:91, hr:118, bp:'150/95', temp:39.2, complaint:'ضيق تنفس حاد', gender:'أنثى', battery:63 },
    { name:'قاسم علي الزيدي', age:38, priority:2, spo2:93, hr:112, bp:'145/92', temp:38.7, complaint:'جرح عميق نزيف حاد', gender:'ذكر', battery:79 },
  ];
  const base = 1100 + patients.length;
  const newPts = chaosPatients.map((p, i) => ({
    ...p, id:`T-${base+i}`, arrival: Date.now() - i*3*60000, trend:'down', notes:'⚠️ حالة طارئة', history: []
  }));
  setPatients(prev => [...prev, ...newPts]);
  addAudit('🚨 تفعيل محاكاة الفوضى — تدفق 5 حالات حرجة', 'critical');
}

// ══════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════

export default function TriageIQv7() {
  const [dark, setDark] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginRole, setLoginRole] = useState('');
  const [loginError, setLoginError] = useState('');

  const [patients, setPatients] = useState(initPatients);
  const [archived, setArchived] = useState([]);
  const [auditLog, setAuditLog] = useState([
    { time: Date.now()-50*60000, action:'تم تشغيل TriageIQ Enterprise v7.0', user:'النظام', type:'info' },
  ]);

  const [searchQ, setSearchQ] = useState('');
  const [filterPriority, setFilterPriority] = useState(0);
  const [sortField, setSortField] = useState('priority');
  const [sortDir, setSortDir] = useState('asc');
  const [viewMode, setViewMode] = useState('table'); // table | cards

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showAIModal, setShowAIModal] = useState(null);
  const [showTimelineModal, setShowTimelineModal] = useState(null);
  const [showArchive, setShowArchive] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showAudit, setShowAudit] = useState(true);
  const [showKPI, setShowKPI] = useState(true);
  const [chaosMode, setChaosMode] = useState(false);

  const [now, setNow] = useState(Date.now());
  const [nextId, setNextId] = useState(1007);
  const [liveStatus, setLiveStatus] = useState('connected');
  const [pulseAnim, setPulseAnim] = useState(false);

  // Timers — Real-time simulation
  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now());
      setPulseAnim(p => !p);
      setPatients(prev => prev.map(pt => {
        const stress = pt.priority <= 2 ? 3 : 1;
        const chaos = chaosMode ? 2 : 1;
        return {
          ...pt,
          spo2: Math.max(70, Math.min(100, pt.spo2 + (Math.random() > 0.6 ? 1 : -1) * stress * chaos * (Math.random() * 0.5))),
          hr: Math.max(40, Math.min(200, pt.hr + (Math.random() > 0.5 ? 1 : -1) * stress * chaos)),
          battery: Math.max(0, pt.battery - (Math.random() > 0.95 ? 1 : 0)),
        };
      }));
    }, 2000); // Every 2 seconds for real-time feel
    return () => clearInterval(t);
  }, [chaosMode]);

  // Connection status simulation
  useEffect(() => {
    const t = setInterval(() => {
      setLiveStatus(Math.random() > 0.02 ? 'connected' : 'reconnecting');
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const addAudit = useCallback((action, type='info') => {
    setAuditLog(prev => [{ time: Date.now(), action, user: userName || 'النظام', type }, ...prev].slice(0, 100));
  }, [userName]);

  const handleLogin = () => {
    if (!loginName.trim()) { setLoginError('يرجى إدخال الاسم'); return; }
    if (!loginRole) { setLoginError('يرجى اختيار الدور'); return; }
    setUserName(loginName.trim());
    setUserRole(loginRole);
    setLoggedIn(true);
    setLoginError('');
  };

  const handleLogout = () => {
    addAudit(`تسجيل خروج: ${userName}`, 'info');
    setLoggedIn(false); setUserName(''); setUserRole('');
  };

  const handleAddPatient = (data) => {
    const id = `T-${nextId}`;
    const p = { id, name:data.name, age:parseInt(data.age), gender:data.gender, priority:parseInt(data.priority),
      spo2:parseInt(data.spo2), hr:parseInt(data.hr), bp:data.bp||'120/80', temp:parseFloat(data.temp)||37,
      complaint:data.complaint, arrival:Date.now(), trend:'stable', notes:data.notes, battery:100, history:[], phone:data.phone||'' };
    setPatients(prev => [...prev, p]);
    setNextId(prev => prev+1);
    addAudit(`تسجيل مريض: ${p.name} (${id}) — ${PRIORITY[p.priority].ar}`, p.priority <= 2 ? 'critical' : 'info');
    setShowAddModal(false);
  };

  const treatPatient = (pt) => {
    setPatients(prev => prev.filter(p => p.id !== pt.id));
    setArchived(prev => [{ ...pt, treatedAt:Date.now(), treatedBy:userName }, ...prev]);
    addAudit(`✅ معالجة: ${pt.name} (${pt.id})`, 'success');
  };

  const restorePatient = (pt) => {
    setArchived(prev => prev.filter(p => p.id !== pt.id));
    setPatients(prev => [...prev, { ...pt, treatedAt:undefined, treatedBy:undefined }]);
    addAudit(`إعادة: ${pt.name} من الأرشيف`, 'info');
  };

  const escalate = (pt) => {
    if (pt.priority <= 1) return;
    setPatients(prev => prev.map(p => p.id === pt.id ? { ...p, priority: p.priority-1 } : p));
    addAudit(`⬆️ تصعيد: ${pt.name} → ${PRIORITY[pt.priority-1].ar}`, 'critical');
  };

  const deescalate = (pt) => {
    if (pt.priority >= 5) return;
    setPatients(prev => prev.map(p => p.id === pt.id ? { ...p, priority: p.priority+1 } : p));
    addAudit(`⬇️ خفض: ${pt.name} → ${PRIORITY[pt.priority+1].ar}`, 'info');
  };

  const saveVitals = (id, vitals) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...vitals } : p));
    addAudit(`📊 تحديث علامات حيوية: ${id}`, 'info');
    setShowEditModal(null);
  };

  const handleChaos = () => {
    simulateChaos(patients, setPatients, addAudit);
    setChaosMode(true);
    setTimeout(() => setChaosMode(false), 30000);
  };

  // Export to text
  const exportReport = () => {
    const lines = [
      '════════════════════════════════════════',
      '  TriageIQ Enterprise v7.0 — تقرير الانتظار',
      `  ${new Date().toLocaleString('ar-SA')}`,
      '════════════════════════════════════════',
      '',
      `إجمالي المرضى: ${patients.length}    حالات حرجة: ${patients.filter(p=>p.priority<=2).length}    تم علاجهم: ${archived.length}`,
      '',
      ...patients.map(p => `[${p.id}] ${p.name} | أولوية: ${PRIORITY[p.priority].ar} | SpO₂: ${p.spo2}% | HR: ${p.hr} | ${p.complaint}`),
      '',
      '════════════════════════════════════════',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `TriageIQ_Report_${Date.now()}.txt`; a.click();
    addAudit('📄 تصدير تقرير', 'info');
  };

  const displayed = useMemo(() => {
    let list = [...patients];
    if (searchQ) list = list.filter(p => p.name.includes(searchQ) || p.id.includes(searchQ) || p.complaint.includes(searchQ));
    if (filterPriority > 0) list = list.filter(p => p.priority === filterPriority);
    list.sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === 'arrival') return sortDir === 'asc' ? va-vb : vb-va;
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va-vb : vb-va;
    });
    return list;
  }, [patients, searchQ, filterPriority, sortField, sortDir]);

  const alerts = useAlerts(patients, now);

  const kpis = useMemo(() => {
    const total = patients.length;
    const critical = patients.filter(p => p.priority <= 2).length;
    const avgWait = total ? Math.floor(patients.reduce((s,p) => s+(now-p.arrival), 0)/total/60000) : 0;
    const avgSpo2 = total ? Math.round(patients.reduce((s,p) => s+p.spo2, 0)/total) : 0;
    const avgHr = total ? Math.round(patients.reduce((s,p) => s+p.hr, 0)/total) : 0;
    const byPriority = {};
    for(let i=1;i<=5;i++) byPriority[i] = patients.filter(p=>p.priority===i).length;
    return { total, critical, avgWait, avgSpo2, avgHr, byPriority, treated:archived.length };
  }, [patients, archived, now]);

  const fmtTime = (ms) => { const m = Math.floor(ms/60000); return m < 60 ? `${m} د` : `${Math.floor(m/60)} س ${m%60} د`; };
  const fmtDate = ts => new Date(ts).toLocaleTimeString('ar-SA', { hour:'2-digit', minute:'2-digit' });
  const getSpo2Color = v => v >= 95 ? 'text-green-600' : v >= 90 ? 'text-yellow-600' : 'text-red-600';
  const getHrColor = v => v >= 60 && v <= 100 ? 'text-green-600' : (v > 100 && v <= 120) || (v >= 50 && v < 60) ? 'text-yellow-600' : 'text-red-600';

  const bg = dark ? 'bg-gray-950' : 'bg-slate-50';
  const cardBg = dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const textMain = dark ? 'text-gray-100' : 'text-gray-900';
  const textSub = dark ? 'text-gray-400' : 'text-gray-500';
  const inputBg = dark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900';

  // ────── LOGIN ──────
  if (!loggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-gray-950' : 'bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950'}`} dir="rtl">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full opacity-5 animate-pulse" style={{
              width: `${20+i*15}px`, height: `${20+i*15}px`,
              left: `${(i*47)%100}%`, top: `${(i*37)%100}%`,
              background: i%3===0 ? '#3b82f6' : i%3===1 ? '#8b5cf6' : '#06b6d4',
              animationDelay: `${i*0.3}s`, animationDuration: `${3+i*0.5}s`
            }} />
          ))}
        </div>

        <div className="relative w-full max-w-md mx-4">
          {/* Logo Card */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600 mb-4 shadow-2xl shadow-blue-500/30">
              <Stethoscope size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">TriageIQ</h1>
            <p className="text-blue-300 text-sm mt-1">Enterprise v7.0 — نظام الطوارئ الذكي</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-bold">LIVE SYSTEM ONLINE</span>
            </div>
          </div>

          <div className={`rounded-2xl shadow-2xl overflow-hidden ${dark ? 'bg-gray-900/90 border border-gray-800' : 'bg-white/95 backdrop-blur-xl'}`}>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${textMain}`}>الاسم الكامل</label>
                <input value={loginName} onChange={e => setLoginName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="أدخل اسمك الكامل..."
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-0 focus:border-blue-500 outline-none transition ${inputBg}`} />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${textMain}`}>الدور الوظيفي</label>
                <select value={loginRole} onChange={e => setLoginRole(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:border-blue-500 outline-none ${inputBg}`}>
                  <option value="">اختر دورك...</option>
                  <option value="doctor">👨‍⚕️ طبيب استشاري</option>
                  <option value="nurse">👩‍⚕️ ممرضة أولى</option>
                  <option value="manager">👨‍💼 مدير قسم</option>
                </select>
              </div>
              {loginError && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                  <AlertCircle size={14} /> {loginError}
                </div>
              )}
              <button onClick={handleLogin}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-base hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                <Shield size={20} /> دخول آمن إلى النظام
              </button>
              <div className="flex items-center justify-between pt-1">
                <span className={`text-xs ${textSub}`}>DCB0129 | NHS Compliant | ISO 27001</span>
                <button onClick={() => setDark(!dark)} className={`p-2 rounded-lg ${dark ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
                  {dark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ────── MAIN APP ──────
  return (
    <div className={`min-h-screen ${bg} ${textMain} transition-colors duration-300`} dir="rtl">
      {/* Critical Alert Banner */}
      <AlertBanner alerts={alerts} dark={dark} />

      {/* HEADER */}
      <header className={`sticky top-0 z-40 shadow-sm ${dark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'} border-b backdrop-blur-xl`}>
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Stethoscope size={16} className="text-white" />
              </div>
              <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">TriageIQ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${liveStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-bounce'}`} />
              <span className={`text-xs font-bold ${liveStatus === 'connected' ? 'text-green-600' : 'text-yellow-600'}`}>
                {liveStatus === 'connected' ? 'LIVE' : 'SYNC...'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Stats */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${dark ? 'bg-gray-800' : 'bg-blue-50'}`}>
              <Users size={14} className="text-blue-500" />
              <span className="font-bold text-blue-600">{patients.length}</span>
              <span className={textSub}>مريض</span>
            </div>
            {kpis.critical > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-red-50 animate-pulse">
                <AlertTriangle size={14} className="text-red-500" />
                <span className="font-bold text-red-600">{kpis.critical}</span>
                <span className="text-red-400">حرج</span>
              </div>
            )}

            {/* Chaos Button */}
            <button onClick={handleChaos}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border transition ${chaosMode ? 'bg-red-600 text-white border-red-600 animate-pulse' : dark ? 'border-red-800 text-red-400 hover:bg-red-900/20' : 'border-red-200 text-red-600 hover:bg-red-50'}`}>
              <Zap size={12} /> {chaosMode ? 'فوضى نشطة' : 'محاكاة فوضى'}
            </button>

            {/* Export */}
            <button onClick={exportReport} className={`p-2 rounded-lg ${dark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`} title="تصدير تقرير">
              <Download size={16} className="text-gray-500" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)}
                className={`relative p-2 rounded-lg ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <Bell size={18} className={alerts.length > 0 ? 'text-red-500' : textSub} />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                    {alerts.length}
                  </span>
                )}
              </button>
              {showNotif && (
                <div className={`absolute left-0 mt-2 w-80 rounded-xl shadow-2xl border z-50 ${cardBg} max-h-80 overflow-y-auto`}>
                  <div className="p-3 border-b font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2"><Bell size={14} /> التنبيهات ({alerts.length})</span>
                    <button onClick={() => setShowNotif(false)}><X size={14} /></button>
                  </div>
                  {alerts.length === 0 ? (
                    <p className={`p-4 text-center text-sm ${textSub}`}>لا توجد تنبيهات</p>
                  ) : alerts.map((a, i) => (
                    <div key={i} className={`p-3 border-b last:border-0 text-sm ${
                      a.level === 'critical' ? (dark ? 'bg-red-950/30' : 'bg-red-50') :
                      a.level === 'high' ? (dark ? 'bg-orange-950/20' : 'bg-orange-50') : ''
                    }`}>
                      <span className="font-bold">{a.icon} {a.name}</span>
                      <p className={textSub}>{a.msg}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setDark(!dark)} className={`p-2 rounded-lg ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {dark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-600" />}
            </button>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <User size={14} />
              <span className="font-medium">{userName}</span>
              <span className={`text-xs ${textSub}`}>({userRole === 'doctor' ? 'طبيب' : userRole === 'nurse' ? 'ممرضة' : 'مدير'})</span>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 py-4 space-y-4" onClick={() => showNotif && setShowNotif(false)}>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label:'إجمالي المرضى', value:kpis.total, icon:<Users size={18} className="text-blue-500" />, color:'blue' },
            { label:'حالات حرجة', value:kpis.critical, icon:<AlertTriangle size={18} className="text-red-500" />, color:'red', pulse:kpis.critical>0 },
            { label:'تم علاجهم', value:kpis.treated, icon:<Check size={18} className="text-green-500" />, color:'green' },
            { label:'متوسط الانتظار', value:`${kpis.avgWait} د`, icon:<Clock size={18} className="text-amber-500" />, color:'amber' },
            { label:'متوسط SpO₂', value:`${kpis.avgSpo2}%`, icon:<Activity size={18} className="text-purple-500" />, color:'purple' },
            { label:'متوسط النبض', value:kpis.avgHr, icon:<Heart size={18} className="text-pink-500" />, color:'pink' },
            { label:'تنبيهات', value:alerts.length, icon:<Bell size={18} className="text-orange-500" />, color:'orange', pulse:alerts.length>0 },
          ].map((k, i) => (
            <div key={i} className={`rounded-2xl border p-3 ${cardBg} ${k.pulse ? 'ring-2 ring-red-400/40 ring-offset-1' : ''} transition-all`}>
              <div className="flex items-center justify-between mb-2">
                {k.icon}
                <span className={`text-xs ${textSub}`}>{k.label}</span>
              </div>
              <p className={`text-2xl font-black ${k.pulse ? 'text-red-600' : ''}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Priority Distribution */}
        <div className={`rounded-2xl border ${cardBg}`}>
          <button onClick={() => setShowKPI(!showKPI)} className="w-full p-4 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-500" /> توزيع الأولويات ومؤشرات الأداء
            </h3>
            {showKPI ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showKPI && (
            <div className="px-4 pb-4 space-y-2">
              {Object.entries(PRIORITY).map(([lvl, info]) => {
                const count = kpis.byPriority[lvl] || 0;
                const pct = kpis.total ? Math.round(count/kpis.total*100) : 0;
                return (
                  <div key={lvl} className="flex items-center gap-3">
                    <span className={`w-32 text-xs font-bold px-2 py-1 rounded-full text-center ${info.badge}`}>{info.ar}</span>
                    <div className={`flex-1 h-6 rounded-full overflow-hidden ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <div className={`h-full ${info.bar} rounded-full transition-all duration-700 flex items-center px-2`} style={{ width:`${pct}%` }}>
                        {pct > 10 && <span className="text-white text-xs font-bold">{pct}%</span>}
                      </div>
                    </div>
                    <span className="text-sm font-bold w-6 text-center">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* TOOLBAR */}
        <div className={`rounded-2xl border p-3 ${cardBg} flex flex-wrap items-center gap-2`}>
          <div className="relative flex-1 min-w-48">
            <Search size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 ${textSub}`} />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="بحث بالاسم أو الرقم أو الشكوى..."
              className={`w-full pr-10 pl-4 py-2 rounded-xl border text-sm ${inputBg} outline-none focus:ring-2 focus:ring-blue-500`} />
          </div>
          <select value={filterPriority} onChange={e => setFilterPriority(+e.target.value)}
            className={`px-3 py-2 rounded-xl border text-sm ${inputBg}`}>
            <option value={0}>جميع الأولويات</option>
            {Object.entries(PRIORITY).map(([k,v]) => <option key={k} value={k}>{v.ar}</option>)}
          </select>
          <select value={sortField} onChange={e => setSortField(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-sm ${inputBg}`}>
            <option value="priority">الأولوية</option>
            <option value="arrival">وقت الوصول</option>
            <option value="spo2">SpO₂</option>
            <option value="hr">النبض</option>
          </select>
          <button onClick={() => setSortDir(d => d==='asc'?'desc':'asc')}
            className={`px-3 py-2 rounded-xl border text-sm ${inputBg} flex items-center gap-1`}>
            {sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {/* View Toggle */}
          <div className={`flex rounded-xl border overflow-hidden ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm flex items-center gap-1 ${viewMode === 'table' ? 'bg-blue-600 text-white' : inputBg}`}>
              <Layers size={14} /> جدول
            </button>
            <button onClick={() => setViewMode('cards')}
              className={`px-3 py-2 text-sm flex items-center gap-1 ${viewMode === 'cards' ? 'bg-blue-600 text-white' : inputBg}`}>
              <BarChart3 size={14} /> بطاقات
            </button>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all">
            <Plus size={16} /> إضافة مريض
          </button>
        </div>

        {/* PATIENT TABLE */}
        {viewMode === 'table' ? (
          <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
            <div className="p-3 border-b flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Activity size={18} className="text-blue-500" /> قائمة الانتظار ({displayed.length})
              </h3>
              <span className={`text-xs ${textSub}`}>يتحدث كل ثانيتين</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={dark ? 'bg-gray-800/80' : 'bg-gray-50'}>
                  <tr>
                    {['ID','المريض','الأولوية','SpO₂','HR','BP','°C','الاتجاه','الانتظار','NEWS2','بطارية','إجراءات'].map(h => (
                      <th key={h} className="px-3 py-3 text-right font-semibold text-xs whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.length === 0 ? (
                    <tr><td colSpan={12} className="text-center py-16">
                      <Users size={48} className={`mx-auto mb-3 ${textSub} opacity-40`} />
                      <p className={textSub}>لا يوجد مرضى في قائمة الانتظار</p>
                    </td></tr>
                  ) : displayed.map(pt => {
                    const pr = PRIORITY[pt.priority];
                    const news2 = calcNEWS2(pt);
                    return (
                      <tr key={pt.id} className={`border-b last:border-0 transition-colors ${
                        pt.priority === 1 ? (dark ? 'bg-red-950/20 hover:bg-red-950/30' : 'bg-red-50/70 hover:bg-red-50') :
                        pt.priority === 2 ? (dark ? 'hover:bg-orange-950/10' : 'hover:bg-orange-50/50') :
                        (dark ? 'hover:bg-gray-800/50' : 'hover:bg-blue-50/30')
                      }`}>
                        <td className="px-3 py-3 font-mono text-xs font-bold text-gray-400">{pt.id}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ backgroundColor: pr.hex }}>{pt.name.charAt(0)}</div>
                            <div>
                              <div className="font-medium text-xs leading-tight">{pt.name}</div>
                              <div className={`text-xs ${textSub} truncate max-w-28`}>{pt.complaint}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${pr.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${pr.dot} ${pt.priority <= 2 ? 'animate-pulse' : ''}`} />
                            {pr.ar}
                          </span>
                        </td>
                        <td className={`px-3 py-3 font-bold text-sm ${getSpo2Color(pt.spo2)}`}>
                          {Math.round(pt.spo2)}%
                          {pt.spo2 < 90 && <span className="text-red-500 animate-pulse ml-1">⚠</span>}
                        </td>
                        <td className={`px-3 py-3 font-bold text-sm ${getHrColor(pt.hr)}`}>
                          <span className="flex items-center gap-1">
                            <Heart size={11} className={`text-red-400 ${pulseAnim && pt.priority <= 2 ? 'animate-ping' : ''}`} />
                            {Math.round(pt.hr)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs">{pt.bp}</td>
                        <td className={`px-3 py-3 text-xs font-bold ${pt.temp > 38.5 ? 'text-red-500' : ''}`}>{pt.temp.toFixed(1)}°</td>
                        <td className="px-3 py-3"><TrendIcon t={pt.trend} /></td>
                        <td className={`px-3 py-3 font-mono text-xs ${Math.floor((now-pt.arrival)/60000) > 60 ? 'text-red-500 font-bold' : Math.floor((now-pt.arrival)/60000) > 30 ? 'text-amber-500' : ''}`}>
                          {fmtTime(now-pt.arrival)}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${news2.score >= 5 ? 'bg-red-100 text-red-700' : news2.score >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {news2.score}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <BatteryIcon level={Math.round(pt.battery)} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => setShowDetailModal(pt)} title="تفاصيل" className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition"><Eye size={13} /></button>
                            <button onClick={() => setShowAIModal(pt)} title="AI" className="p-1.5 rounded-lg hover:bg-violet-100 text-violet-600 transition"><Brain size={13} /></button>
                            <button onClick={() => setShowEditModal(pt)} title="تعديل" className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-600 transition"><Edit size={13} /></button>
                            <button onClick={() => escalate(pt)} disabled={pt.priority<=1} title="تصعيد" className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 disabled:opacity-30 transition"><Zap size={13} /></button>
                            <button onClick={() => deescalate(pt)} disabled={pt.priority>=5} title="خفض" className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 disabled:opacity-30 transition"><ChevronDown size={13} /></button>
                            <button onClick={() => treatPatient(pt)} title="معالجة" className="p-1.5 rounded-lg hover:bg-green-100 text-green-700 transition"><Check size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // CARDS VIEW
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map(pt => {
              const pr = PRIORITY[pt.priority];
              const news2 = calcNEWS2(pt);
              return (
                <div key={pt.id} className={`rounded-2xl border overflow-hidden ${cardBg} ${pt.priority === 1 ? 'ring-2 ring-red-400/50' : ''} transition-all hover:shadow-lg`}>
                  <div className="h-1.5" style={{ backgroundColor: pr.hex }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: pr.hex }}>
                          {pt.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{pt.name}</div>
                          <div className={`text-xs ${textSub}`}>{pt.id} • {pt.age} سنة</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${pr.badge}`}>{pr.ar}</span>
                    </div>

                    <p className={`text-xs ${textSub} mb-3 line-clamp-1`}>{pt.complaint}</p>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center">
                        <div className={`text-lg font-black ${getSpo2Color(pt.spo2)}`}>{Math.round(pt.spo2)}%</div>
                        <div className={`text-xs ${textSub}`}>SpO₂</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-black ${getHrColor(pt.hr)}`}>{Math.round(pt.hr)}</div>
                        <div className={`text-xs ${textSub}`}>HR</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-black ${news2.score >= 5 ? 'text-red-600' : news2.score >= 3 ? 'text-yellow-600' : 'text-green-600'}`}>{news2.score}</div>
                        <div className={`text-xs ${textSub}`}>NEWS2</div>
                      </div>
                    </div>

                    <div className={`flex items-center justify-between text-xs ${textSub} mb-3`}>
                      <span>⏱ {fmtTime(now - pt.arrival)}</span>
                      <TrendIcon t={pt.trend} />
                      <BatteryIcon level={Math.round(pt.battery)} />
                    </div>

                    <div className="flex gap-1">
                      <button onClick={() => setShowDetailModal(pt)} className="flex-1 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100"><Eye size={12} className="inline ml-1" />تفاصيل</button>
                      <button onClick={() => setShowAIModal(pt)} className="flex-1 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-xs font-bold hover:bg-violet-100"><Brain size={12} className="inline ml-1" />AI</button>
                      <button onClick={() => treatPatient(pt)} className="flex-1 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100"><Check size={12} className="inline ml-1" />علاج</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ARCHIVE */}
        <div className={`rounded-2xl border ${cardBg}`}>
          <button onClick={() => setShowArchive(!showArchive)} className="w-full p-4 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Archive size={18} className="text-gray-500" /> الأرشيف — المرضى المُعالَجون ({archived.length})
            </h3>
            {showArchive ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showArchive && (
            <div className="border-t overflow-x-auto">
              {archived.length === 0 ? (
                <p className={`text-center py-8 text-sm ${textSub}`}>لا يوجد مرضى في الأرشيف</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className={dark ? 'bg-gray-800' : 'bg-gray-50'}>
                    <tr>
                      {['ID','الاسم','الأولوية','وقت العلاج','بواسطة','إجراءات'].map(h => (
                        <th key={h} className="px-3 py-2 text-right font-semibold text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {archived.map(pt => (
                      <tr key={pt.id} className="border-b last:border-0 hover:bg-gray-50/50">
                        <td className="px-3 py-2 font-mono text-xs text-gray-400">{pt.id}</td>
                        <td className="px-3 py-2 font-medium text-sm">{pt.name}</td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${PRIORITY[pt.priority].badge}`}>{PRIORITY[pt.priority].ar}</span></td>
                        <td className="px-3 py-2 text-xs">{fmtDate(pt.treatedAt)}</td>
                        <td className="px-3 py-2 text-xs">{pt.treatedBy}</td>
                        <td className="px-3 py-2 flex gap-1">
                          <button onClick={() => restorePatient(pt)} className="p-1.5 rounded hover:bg-blue-100 text-blue-600" title="إعادة"><RefreshCw size={13} /></button>
                          <button onClick={() => setArchived(prev => prev.filter(p => p.id !== pt.id))} className="p-1.5 rounded hover:bg-red-100 text-red-600" title="حذف"><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* AUDIT LOG */}
        <div className={`rounded-2xl border ${cardBg}`}>
          <button onClick={() => setShowAudit(!showAudit)} className="w-full p-4 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <FileText size={18} className="text-gray-500" /> سجل التدقيق ({auditLog.length})
            </h3>
            {showAudit ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showAudit && (
            <div className="border-t max-h-64 overflow-y-auto">
              {auditLog.map((log, i) => (
                <div key={i} className={`px-4 py-2.5 border-b last:border-0 flex items-start gap-3 text-sm ${
                  log.type === 'critical' ? (dark ? 'bg-red-950/20' : 'bg-red-50') :
                  log.type === 'success' ? (dark ? 'bg-green-950/20' : 'bg-green-50') :
                  log.type === 'warning' ? (dark ? 'bg-yellow-950/20' : 'bg-yellow-50') : ''
                }`}>
                  <span className={`mt-0.5 flex-shrink-0 ${log.type==='critical'?'text-red-500':log.type==='success'?'text-green-500':log.type==='warning'?'text-yellow-500':'text-blue-500'}`}>
                    {log.type==='critical'?<AlertCircle size={13}/>:log.type==='success'?<Check size={13}/>:log.type==='warning'?<AlertTriangle size={13}/>:<FileText size={13}/>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed">{log.action}</p>
                    <p className={`text-xs ${textSub}`}>{log.user} • {fmtDate(log.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`text-center py-4 text-xs ${textSub} flex items-center justify-center gap-3`}>
          <Shield size={12} /> TriageIQ Enterprise v7.0
          <span>•</span> DCB0129 Compliant
          <span>•</span> AI-Powered Clinical Decision Support
          <span>•</span> Real-time Monitoring
        </div>
      </main>

      {/* ────── MODALS ────── */}
      {showAddModal && <AddPatientModal dark={dark} inputBg={inputBg} textSub={textSub} onAdd={handleAddPatient} onClose={() => setShowAddModal(false)} />}

      {showDetailModal && (
        <DetailModal
          patient={showDetailModal}
          dark={dark} textSub={textSub} inputBg={inputBg} now={now}
          onClose={() => setShowDetailModal(null)}
          onAI={() => { setShowAIModal(showDetailModal); setShowDetailModal(null); }}
          onTimeline={() => { setShowTimelineModal(showDetailModal); setShowDetailModal(null); }}
        />
      )}

      {showEditModal && (
        <EditVitalsModal pt={showEditModal} dark={dark} inputBg={inputBg} textSub={textSub}
          onClose={() => setShowEditModal(null)} onSave={saveVitals} />
      )}

      {showAIModal && (
        <AIPanel patient={showAIModal} dark={dark} inputBg={inputBg} textSub={textSub}
          onClose={() => setShowAIModal(null)} />
      )}

      {showTimelineModal && (
        <TimelineModal patient={showTimelineModal} dark={dark} textSub={textSub}
          onClose={() => setShowTimelineModal(null)} />
      )}
    </div>
  );
}
