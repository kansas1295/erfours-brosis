import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  TrendingUp, 
  RefreshCcw, 
  Scale, 
  Users, 
  Beef, 
  Info, 
  FileText,
  Save,
  Activity,
  ArrowUpRight,
  History,
  Trash2,
  Download,
  BarChart3,
  Calendar,
  Plus,
  X,
  Printer,
  Clock,
  Smartphone,
  Check,
  Share2,
  Percent,
  Package,
  Truck,
  Sparkles,
  Brain,
  Database,
  Upload,
  Search,
  Filter,
  TrendingDown,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Legend,
  ComposedChart
} from 'recharts';
import { format } from 'date-fns';
import { AgePicker } from './components/AgePicker';
import Markdown from 'react-markdown';

interface FlockRecord {
  id: string;
  date: string;
  initialPop: number;
  currentPop: number;
  totalWeight: number;
  totalFeed: number;
  age: number;
  fcr: number;
  ip: number;
  mortality: number;
  dailyFcr?: number | null;
  adg: number;
  dailyAdg?: number | null;
  dailyDeaths?: number;
  dailyFeed?: number;
  totalDeaths?: number;
  weeklyDeaths?: number;
}

interface WeighingDraft {
  id: string;
  birds: number;
  weight: number; // in kg
}

interface WeighingDraftInput {
  id: string;
  birds: number | string;
  weight: number | string;
}

interface HarvestRecord {
  id: string;
  date: string;
  birds: number;
  avgWeight: number;
  totalWeight: number;
  age: number;
  ip: number;
  notes?: string;
  weighingDrafts?: WeighingDraft[];
  dataTimbangNo?: string;
  spbNo?: string;
  timeArrived?: string;
  timeLoaded?: string;
  timeCompleted?: string;
  takenBy?: string;
  driverName?: string;
  plateNo?: string;
  driverSim?: string;
  stnkNo?: string;
  diserahkanNama?: string;
  diserahkanTgl?: string;
  diambilNama?: string;
  diambilTgl?: string;
  securityNama?: string;
  securityTgl?: string;
}

interface FeedTransaction {
  id: string;
  date: string;
  type: 'masuk' | 'keluar';
  quantity: number; // in SAK
  feedType: string; // BR-1 Starter etc
  docNo?: string; // SJ No
  notes?: string;
}

interface DocCheckIn {
  id: string;
  date: string;
  boxCount: number;
  popCount: number;
  weightAvg: number; // gr
  supplier: string;
  condition: 'Sangat Baik' | 'Baik' | 'Kurang Baik' | 'Buruk';
  notes?: string;
}

const parseWeight = (val: any): number => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  const str = val.toString().replace(/,/g, '.');
  return parseFloat(str) || 0;
};

const formatIndoDate = (dateString: string): string => {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    const day = d.getDate();
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateString;
  }
};

const getDaysBetween = (date1Str: string, date2Str: string): number => {
  if (!date1Str || !date2Str) return 0;
  const [y1, m1, d1] = date1Str.split('-').map(Number);
  const [y2, m2, d2] = date2Str.split('-').map(Number);
  const d1Local = new Date(y1, m1 - 1, d1);
  const d2Local = new Date(y2, m2 - 1, d2);
  const diffTime = d1Local.getTime() - d2Local.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

const addDaysToDate = (dateStr: string, days: number): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const localDate = new Date(y, m - 1, d);
  localDate.setDate(localDate.getDate() + days);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  // PWA Install States & Hook
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidModal, setShowAndroidModal] = useState<boolean>(false);
  const [isWebAppInstalled, setIsWebAppInstalled] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Automatically prompt or show badge on load on Android
      console.log('[PWA] beforeinstallprompt event captured');
    };
    const handleAppInstalled = () => {
      setIsWebAppInstalled(true);
      setDeferredPrompt(null);
      console.log('[PWA] Erfours Android App was successfully installed!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Initial check for standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsWebAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Scroll Optimization Ref for the Horizontal Dashboard Table
  const dailyTableScrollRef = useRef<HTMLDivElement>(null);

  const scrollDailyTable = (direction: 'left' | 'right') => {
    if (dailyTableScrollRef.current) {
      const scrollAmount = 350; // Scroll columns smoothly
      dailyTableScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Input State
  const [initialPop, setInitialPop] = useState<string>(() => {
    return localStorage.getItem('broiler_initial_pop') || '10000';
  });
  const [currentPop, setCurrentPop] = useState<string>(() => {
    return localStorage.getItem('broiler_current_pop') || '9720';
  });
  const [totalWeight, setTotalWeight] = useState<string>(() => {
    return localStorage.getItem('broiler_total_weight') || '20900';
  });
  const [totalFeed, setTotalFeed] = useState<string>(() => {
    return localStorage.getItem('broiler_total_feed') || '30514';
  });
  const [age, setAge] = useState<string>(() => {
    return localStorage.getItem('broiler_age') || '35';
  });
  
  // App State
  const [view, setView] = useState<'daily' | 'cumulative' | 'history' | 'harvest' | 'weighing' | 'inventory'>('daily');
  const [history, setHistory] = useState<FlockRecord[]>([]);
  const [harvestHistory, setHarvestHistory] = useState<HarvestRecord[]>([]);
  const [harvestActiveTab, setHarvestActiveTab] = useState<'sheet' | 'history'>('sheet');
  const [historySelectedWeek, setHistorySelectedWeek] = useState<number | 'all'>('all');

  // Daily Dashboard States
  const [activeDailyChartTab, setActiveDailyChartTab] = useState<'feed' | 'growth'>('feed');
  const [dailyTableSearch, setDailyTableSearch] = useState('');
  const [dailyTableWeekFilter, setDailyTableWeekFilter] = useState<number | 'all'>('all');

  // Inventory & DOC states
  const [feedTransactions, setFeedTransactions] = useState<FeedTransaction[]>([]);
  const [docCheckIns, setDocCheckIns] = useState<DocCheckIn[]>([]);
  const [inventoryActiveTab, setInventoryActiveTab] = useState<'pakan' | 'doc'>('pakan');
  
  // Forms states
  const [feedDate, setFeedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [feedTypeAction, setFeedTypeAction] = useState<'masuk' | 'keluar'>('masuk');
  const [feedQty, setFeedQty] = useState<string>('');
  const [feedBrand, setFeedBrand] = useState<string>('8201');
  const [feedDocNo, setFeedDocNo] = useState<string>('');
  const [feedNotes, setFeedNotes] = useState<string>('');

  const [docDate, setDocDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [docBoxes, setDocBoxes] = useState<string>('100');
  const [docPop, setDocPop] = useState<string>('10200'); // boxes * 102
  const [docWeight, setDocWeight] = useState<string>('42'); // gr
  const [docSupplier, setDocSupplier] = useState<string>('PT. Japfa Comfeed');
  const [docCondition, setDocCondition] = useState<'Sangat Baik' | 'Baik' | 'Kurang Baik' | 'Buruk'>('Sangat Baik');
  const [docNotes, setDocNotes] = useState<string>('');

  // IP Simulator States
  const [simAge, setSimAge] = useState<string>('35');
  const [simMortality, setSimMortality] = useState<string>('2.5'); // %
  const [simWeight, setSimWeight] = useState<string>('1800'); // gram
  const [simFcr, setSimFcr] = useState<string>('1.45');

  const simulatedIp = useMemo(() => {
    const ageVal = parseFloat(simAge) || 1;
    const mortVal = parseFloat(simMortality) || 0;
    const wtVal = (parseFloat(simWeight) || 0) / 1000; // to kg
    const fcrVal = parseFloat(simFcr) || 1;
    
    if (ageVal <= 0 || fcrVal <= 0) return 0;
    const ipVal = (((100 - mortVal) * wtVal) / (fcrVal * ageVal)) * 100;
    return Math.round(Math.max(0, ipVal));
  }, [simAge, simMortality, simWeight, simFcr]);

  const simulatedIpStatus = useMemo(() => {
    if (simulatedIp >= 400) return { label: 'PREMIUM GRADE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20 font-bold', desc: 'Luar biasa! Efisiensi pakan sangat tinggi dengan tingkat kematian minimal.' };
    if (simulatedIp >= 350) return { label: 'EXCELLENT', color: 'bg-teal-500/20 text-teal-300 border-teal-500/20 font-bold', desc: 'Sangat baik, memenuhi kriteria kemitraan premium utama!' };
    if (simulatedIp >= 300) return { label: 'STANDARD', color: 'bg-blue-500/20 text-blue-300 border-blue-500/20 font-bold', desc: 'Performa rata-rata sehat dan mencukupi standar teknis.' };
    return { label: 'UNDERPERFORM', color: 'bg-rose-500/20 text-rose-300 border-rose-500/20 font-bold', desc: 'Perlu evaluasi ketat manajemen pemeliharaan, pakan, & sanitasi.' };
  }, [simulatedIp]);

  // Gemini AI Recommendation States
  const [geminiRecommendation, setGeminiRecommendation] = useState<string | null>(() => {
    return localStorage.getItem('gemini_feed_recommendation') || null;
  });
  const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  const fetchGeminiRecommendation = async () => {
    setIsGeminiLoading(true);
    setGeminiError(null);
    try {
      const currentStatus = {
        age: parseFloat(dailyAge || age) || 0,
        avgWeight: stats ? (parseFloat(stats.avgWeight) / 1000).toFixed(3) : '0.000',
        fcr: stats ? stats.fcr : '0.00',
        totalMortality: (parseFloat(initialPop) || 0) - (parseFloat(currentPop) || 0)
      };

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, currentStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mendapatkan rekomendasi.");
      }

      const data = await response.json();
      setGeminiRecommendation(data.recommendation);
      localStorage.setItem('gemini_feed_recommendation', data.recommendation);
    } catch (err: any) {
      console.error(err);
      setGeminiError(err.message || "Gagal terhubung ke server atau API Gemini.");
    } finally {
      setIsGeminiLoading(false);
    }
  };

  const availableWeeks = useMemo(() => {
    const weeks = new Set<number>();
    history.forEach(r => weeks.add(Math.ceil(r.age / 7)));
    return Array.from(weeks).sort((a, b) => b - a);
  }, [history]);

  const feedStockStats = useMemo(() => {
    const totalIn = feedTransactions.filter(tx => tx.type === 'masuk').reduce((sum, tx) => sum + tx.quantity, 0);
    const totalOut = feedTransactions.filter(tx => tx.type === 'keluar').reduce((sum, tx) => sum + tx.quantity, 0);
    return {
      totalIn,
      totalOut,
      balance: totalIn - totalOut,
      balanceKg: (totalIn - totalOut) * 50
    };
  }, [feedTransactions]);

  const latestDocCheckIn = useMemo(() => {
    if (docCheckIns.length === 0) return null;
    return [...docCheckIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [docCheckIns]);

  const docBaseDate = useMemo(() => {
    if (docCheckIns.length === 0) return null;
    const sorted = [...docCheckIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted[0].date;
  }, [docCheckIns]);

  const activeHistoryWeek = historySelectedWeek === 'all' ? null : historySelectedWeek;

  const overallMortality = useMemo(() => {
    const latest = [...history].sort((a, b) => a.age - b.age).pop();
    return latest ? (latest.totalDeaths || (latest.initialPop - latest.currentPop)) : 0;
  }, [history]);

  const overallFeed = useMemo(() => {
    const latest = [...history].sort((a, b) => a.age - b.age).pop();
    return latest ? latest.totalFeed : 0;
  }, [history]);

  const historyWeeklyMortality = useMemo(() => {
    if (!activeHistoryWeek) return 0;
    const sorted = [...history].sort((a, b) => a.age - b.age);
    const weekLastRecord = sorted.filter(r => Math.ceil(r.age / 7) === activeHistoryWeek).pop();
    const prevWeekLastRecord = sorted.filter(r => Math.ceil(r.age / 7) < activeHistoryWeek).pop();
    
    if (!weekLastRecord) return 0;
    
    const currentTotalDeaths = weekLastRecord.totalDeaths || (weekLastRecord.initialPop - weekLastRecord.currentPop);
    const prevTotalDeaths = prevWeekLastRecord ? (prevWeekLastRecord.totalDeaths || (prevWeekLastRecord.initialPop - prevWeekLastRecord.currentPop)) : 0;
    
    return currentTotalDeaths - prevTotalDeaths;
  }, [history, activeHistoryWeek]);

  const historyWeeklyFeed = useMemo(() => {
    if (!activeHistoryWeek) return 0;
    const sorted = [...history].sort((a, b) => a.age - b.age);
    const weekLastRecord = sorted.filter(r => Math.ceil(r.age / 7) === activeHistoryWeek).pop();
    const prevWeekLastRecord = sorted.filter(r => Math.ceil(r.age / 7) < activeHistoryWeek).pop();
    
    if (!weekLastRecord) return 0;
    
    const currentTotalFeed = weekLastRecord.totalFeed;
    const prevTotalFeed = prevWeekLastRecord ? prevWeekLastRecord.totalFeed : 0;
    
    return currentTotalFeed - prevTotalFeed;
  }, [history, activeHistoryWeek]);

  const filteredHistory = useMemo(() => {
    if (!activeHistoryWeek) return history;
    return history.filter(r => Math.ceil(r.age / 7) === activeHistoryWeek);
  }, [history, activeHistoryWeek]);

  const weeklySummaryData = useMemo(() => {
    const summary: Record<number, { deaths: number; feed: number }> = {};
    
    // Sort history by age to correctly identify week-over-week changes
    const sortedHistory = [...history].sort((a, b) => a.age - b.age);
    
    availableWeeks.forEach(week => {
      const weekLastRecord = sortedHistory.filter(r => Math.ceil(r.age / 7) === week).pop();
      const prevWeekLastRecord = sortedHistory.filter(r => Math.ceil(r.age / 7) < week).pop();
      
      if (weekLastRecord) {
        const currentTotalFeed = weekLastRecord.totalFeed;
        const prevTotalFeed = prevWeekLastRecord ? prevWeekLastRecord.totalFeed : 0;
        
        const currentTotalDeaths = weekLastRecord.totalDeaths || (weekLastRecord.initialPop - weekLastRecord.currentPop);
        const prevTotalDeaths = prevWeekLastRecord ? (prevWeekLastRecord.totalDeaths || (prevWeekLastRecord.initialPop - prevWeekLastRecord.currentPop)) : 0;
        
        summary[week] = {
          feed: currentTotalFeed - prevTotalFeed,
          deaths: currentTotalDeaths - prevTotalDeaths
        };
      }
    });

    return Object.entries(summary)
      .map(([week, data]) => ({ week: parseInt(week), ...data }))
      .sort((a, b) => b.week - a.week);
  }, [history, availableWeeks]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('broiler_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
    
    const savedHarvest = localStorage.getItem('broiler_harvest_history');
    if (savedHarvest) {
      try {
        setHarvestHistory(JSON.parse(savedHarvest));
      } catch (e) {
        console.error('Failed to load harvest history', e);
      }
    }

    const savedFeed = localStorage.getItem('broiler_feed_transactions');
    if (savedFeed) {
      try {
        setFeedTransactions(JSON.parse(savedFeed));
      } catch (e) {
        console.error('Failed to load feed transactions', e);
      }
    } else {
      const initialTransactions: FeedTransaction[] = [
        {
          id: 'init-feed-1',
          date: format(new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          type: 'masuk',
          quantity: 300,
          feedType: '8201',
          docNo: 'SJ-2026-00192',
          notes: 'Penerimaan pakan 8201 awal siklus'
        },
        {
          id: 'init-feed-2',
          date: format(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          type: 'masuk',
          quantity: 300,
          feedType: '811',
          docNo: 'SJ-2026-00441',
          notes: 'Penerimaan pakan 811 fase 2'
        }
      ];
      setFeedTransactions(initialTransactions);
      localStorage.setItem('broiler_feed_transactions', JSON.stringify(initialTransactions));
    }

    const savedDoc = localStorage.getItem('broiler_doc_checkins');
    if (savedDoc) {
      try {
        setDocCheckIns(JSON.parse(savedDoc));
      } catch (e) {
        console.error('Failed to load doc checkins', e);
      }
    } else {
      const initialDocs: DocCheckIn[] = [
        {
          id: 'init-doc-1',
          date: format(new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          boxCount: 98,
          popCount: 10000,
          weightAvg: 41,
          supplier: 'PT. Japfa Comfeed',
          condition: 'Sangat Baik',
          notes: 'DOC Berasal dari Hatchery Super. Lincah dan seragam.'
        }
      ];
      setDocCheckIns(initialDocs);
      localStorage.setItem('broiler_doc_checkins', JSON.stringify(initialDocs));
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('broiler_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('broiler_harvest_history', JSON.stringify(harvestHistory));
  }, [harvestHistory]);

  useEffect(() => {
    localStorage.setItem('broiler_feed_transactions', JSON.stringify(feedTransactions));
  }, [feedTransactions]);

  useEffect(() => {
    localStorage.setItem('broiler_doc_checkins', JSON.stringify(docCheckIns));
  }, [docCheckIns]);

  // Persist initialPop & currentPop to localStorage
  useEffect(() => {
    localStorage.setItem('broiler_initial_pop', initialPop);
  }, [initialPop]);

  useEffect(() => {
    localStorage.setItem('broiler_current_pop', currentPop);
  }, [currentPop]);

  // Persist cumulative inputs to localStorage
  useEffect(() => {
    localStorage.setItem('broiler_total_weight', totalWeight);
  }, [totalWeight]);

  useEffect(() => {
    localStorage.setItem('broiler_total_feed', totalFeed);
  }, [totalFeed]);

  useEffect(() => {
    localStorage.setItem('broiler_age', age);
  }, [age]);

  // Daily Monitoring State
  const [dailyFeedSak, setDailyFeedSak] = useState<string>(''); // Sak (1 sak = 50kg)
  const [dailyWeight, setDailyWeight] = useState<string>(''); // gr/bird (Current weight)
  const [prevWeight, setPrevWeight] = useState<string>(''); // gr/bird (Yesterday's weight)
  const [dailyDeathsInput, setDailyDeathsInput] = useState<string>(''); // birds (Deaths today)
  const [dailyAge, setDailyAge] = useState<string>('');
  const [dailyDate, setDailyDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Synchronize dailyAge and dailyDate when docBaseDate changes
  useEffect(() => {
    if (docBaseDate) {
      if (dailyDate) {
        const daysDiff = getDaysBetween(dailyDate, docBaseDate);
        const calculatedAge = daysDiff + 1;
        if (calculatedAge > 0) {
          setDailyAge(calculatedAge.toString());
        } else {
          setDailyAge('1');
          setDailyDate(docBaseDate);
        }
      } else {
        setDailyAge('1');
        setDailyDate(docBaseDate);
      }
    }
  }, [docBaseDate]);

  const handleDailyDateChange = (newDateStr: string) => {
    setDailyDate(newDateStr);
    if (docBaseDate && newDateStr) {
      const daysDiff = getDaysBetween(newDateStr, docBaseDate);
      const calculatedAge = daysDiff + 1;
      if (calculatedAge > 0) {
        setDailyAge(calculatedAge.toString());
      } else {
        setDailyAge('1');
        setDailyDate(docBaseDate);
      }
    }
  };

  const handleDailyAgeChange = (newAgeStr: string) => {
    setDailyAge(newAgeStr);
    if (docBaseDate && newAgeStr) {
      const ageNum = parseInt(newAgeStr) || 1;
      const calculatedDate = addDaysToDate(docBaseDate, ageNum - 1);
      setDailyDate(calculatedDate);
    }
  };

  // Harvest State
  const [harvestBirds, setHarvestBirds] = useState<string>('');
  const [harvestAvgWeight, setHarvestAvgWeight] = useState<string>('');
  const [harvestTotalWeight, setHarvestTotalWeight] = useState<string>('');
  const [harvestDate, setHarvestDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [harvestAge, setHarvestAge] = useState<string>('');

  // Weighing drafts state (Data Timbang Panen - fixed 90 entries table)
  const [activeDrafts, setActiveDrafts] = useState<WeighingDraftInput[]>(() => 
    Array.from({ length: 90 }, (_, i) => ({
      id: `draft-${i}`,
      birds: '',
      weight: ''
    }))
  );
  const [draftBirds, setDraftBirds] = useState<string>('15'); // default 15 ekor per crate
  const [draftWeight, setDraftWeight] = useState<string>(''); // kg weight on single draft
  const [crateTare, setCrateTare] = useState<string>('1.5'); // default empty crate tare weight (e.g. 1.5kg)
  const [selectedRecordDrafts, setSelectedRecordDrafts] = useState<HarvestRecord | null>(null);

  // Document Metadata States (Data Timbang Form fields mimicking paper)
  const [dataTimbangNo, setDataTimbangNo] = useState<string>('PFL 109282');
  const [spbNo, setSpbNo] = useState<string>('');
  const [timeArrived, setTimeArrived] = useState<string>('');
  const [timeLoaded, setTimeLoaded] = useState<string>('');
  const [timeCompleted, setTimeCompleted] = useState<string>('');
  const [takenBy, setTakenBy] = useState<string>('');
  const [driverName, setDriverName] = useState<string>('');
  const [plateNo, setPlateNo] = useState<string>('');
  const [driverSim, setDriverSim] = useState<string>('');
  const [stnkNo, setStnkNo] = useState<string>('');
  
  // Signatures
  const [diserahkanNama, setDiserahkanNama] = useState<string>('');
  const [diserahkanTgl, setDiserahkanTgl] = useState<string>('');
  const [diambilNama, setDiambilNama] = useState<string>('');
  const [diambilTgl, setDiambilTgl] = useState<string>('');
  const [securityNama, setSecurityNama] = useState<string>('');
  const [securityTgl, setSecurityTgl] = useState<string>('');

  // Sync active weighing drafts calculations directly to main harvest inputs
  useEffect(() => {
    const validDrafts = activeDrafts.filter(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0);
    if (validDrafts.length > 0) {
      const totalB = validDrafts.reduce((sum, d) => sum + (parseInt(d.birds as any) || 0), 0);
      const totalW = validDrafts.reduce((sum, d) => sum + parseWeight(d.weight), 0);
      setHarvestBirds(totalB.toString());
      setHarvestTotalWeight(totalW.toFixed(2));
      const avgW = totalB > 0 ? (totalW / totalB) : 0;
      setHarvestAvgWeight(avgW.toFixed(3));
    }
  }, [activeDrafts]);

  // Handle adding raw draft to drafts list
  const handleAddDraft = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const b = parseInt(draftBirds) || 0;
    const grossVal = parseFloat(draftWeight) || 0;
    const tareVal = parseFloat(crateTare) || 0;

    if (b <= 0 || grossVal <= 0) {
      alert('Masukkan jumlah ekor dan berat kotor keranjang yang valid.');
      return;
    }

    if (grossVal <= tareVal) {
      alert('Berat kotor harus lebih besar dari berat tara keranjang.');
      return;
    }

    const netWeight = parseFloat((grossVal - tareVal).toFixed(2));

    const newDraft: WeighingDraft = {
      id: crypto.randomUUID(),
      birds: b,
      weight: netWeight
    };

    setActiveDrafts(prev => {
      // Find the first empty slot
      const idx = prev.findIndex(d => (parseInt(d.birds as any) || 0) === 0 && parseWeight(d.weight) === 0);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          birds: b,
          weight: netWeight
        };
        return next;
      }
      alert('Semua 90 slot timbangan di lembar ini sudah penuh!');
      return prev;
    });
    setDraftWeight('');

    // Quick auto-focus support for rapid entry
    setTimeout(() => {
      const el = document.getElementById('draft-weight-input');
      if (el) el.focus();
    }, 50);
  };

  const handleRemoveDraft = (id: string) => {
    setActiveDrafts(prev => {
      const next = prev.map(d => d.id === id ? { ...d, birds: '', weight: '' } : d);
      const activeCount = next.filter(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0).length;
      if (activeCount === 0) {
        setHarvestBirds('');
        setHarvestTotalWeight('');
        setHarvestAvgWeight('');
      }
      return next;
    });
  };

  const handleCellChange = (index: number, field: 'birds' | 'weight', val: string) => {
    setActiveDrafts(prev => {
      const next = [...prev];
      let sanitizedVal = val;
      if (field === 'weight') {
        // Replace comma with dot
        sanitizedVal = val.replace(/,/g, '.');
        // Prevent typing multiple dots or non-digits
        sanitizedVal = sanitizedVal.replace(/[^0-9.]/g, '');
        const parts = sanitizedVal.split('.');
        if (parts.length > 2) {
          sanitizedVal = parts[0] + '.' + parts.slice(1).join('');
        }
      } else if (field === 'birds') {
        sanitizedVal = val.replace(/[^0-9]/g, '');
      }
      next[index] = {
        ...next[index],
        [field]: sanitizedVal
      };
      
      // If we cleared both birds and weight to empty, we check if we should reset harvest inputs
      const activeCount = next.filter(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0).length;
      if (activeCount === 0) {
        setHarvestBirds('');
        setHarvestTotalWeight('');
        setHarvestAvgWeight('');
      }
      return next;
    });
  };

  // Projection Simulation State
  const [customProjectionAdg, setCustomProjectionAdg] = useState<string>('');
  const [customProjectionFcr, setCustomProjectionFcr] = useState<string>('');

  // Sync harvest age & weight with daily/main state if empty
  useEffect(() => {
    const hasWeighings = activeDrafts.some(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0);
    if (hasWeighings) return; // Skip if scale calculator is active
    if (!harvestAge && (dailyAge || age)) setHarvestAge(dailyAge || age);
    if (!harvestAvgWeight && dailyWeight) {
      setHarvestAvgWeight(dailyWeight);
      const b = parseFloat(harvestBirds) || 0;
      const aw = parseFloat(dailyWeight) || 0;
      if (b > 0 && aw > 0) {
        setHarvestTotalWeight((b * aw / 1000).toFixed(2));
      }
    }
  }, [age, harvestAge, dailyAge, dailyWeight, harvestAvgWeight, harvestBirds, activeDrafts]);

  // Synchronize Daily Input Form with History
  useEffect(() => {
    if (view === 'daily' && dailyAge) {
      const targetAge = parseFloat(dailyAge);
      if (isNaN(targetAge) || targetAge <= 0) return;

      const existingRecord = history.find(r => r.age === targetAge);
      if (existingRecord) {
        // Load existing record values
        setDailyFeedSak((existingRecord.dailyFeed ? existingRecord.dailyFeed / 50 : 0).toString());
        
        const avgW = existingRecord.totalWeight && existingRecord.currentPop
          ? Math.round((existingRecord.totalWeight / existingRecord.currentPop) * 1000)
          : 0;
        setDailyWeight(avgW > 0 ? avgW.toString() : '');
        setDailyDeathsInput((existingRecord.dailyDeaths ?? 0).toString());
        setCurrentPop(existingRecord.currentPop.toString());
        if (existingRecord.date) {
          setDailyDate(existingRecord.date.split('T')[0]);
        }

        // Load prev weight for this age
        const prevRecord = [...history]
          .filter(r => r.age < targetAge)
          .sort((a, b) => b.age - a.age)[0];
        if (prevRecord) {
          const prevAvgW = prevRecord.totalWeight && prevRecord.currentPop
            ? Math.round((prevRecord.totalWeight / prevRecord.currentPop) * 1000)
            : 0;
          setPrevWeight(prevAvgW > 0 ? prevAvgW.toString() : '');
        } else {
          setPrevWeight('');
        }
      } else {
        // Reset daily input fields for fresh entry on this age
        setDailyFeedSak('');
        setDailyWeight('');
        setDailyDeathsInput('');
        
        // Auto-calculate starting currentPop based on prior cumulative deaths
        const p1 = parseFloat(initialPop) || 0;
        const histDeaths = history
          .filter(r => r.age < targetAge)
          .reduce((sum, r) => sum + (r.dailyDeaths || 0), 0);
        setCurrentPop(Math.max(0, p1 - histDeaths).toString());

        // Auto-calculate prevWeight from the previous record
        const prevRecord = [...history]
          .filter(r => r.age < targetAge)
          .sort((a, b) => b.age - a.age)[0];
        if (prevRecord) {
          const prevAvgW = prevRecord.totalWeight && prevRecord.currentPop
            ? Math.round((prevRecord.totalWeight / prevRecord.currentPop) * 1000)
            : 0;
          setPrevWeight(prevAvgW > 0 ? prevAvgW.toString() : '');
        } else {
          setPrevWeight('');
        }
      }
    }
  }, [dailyAge, view, history, initialPop]);

  // Auto-fetch previous weight for cumulative view
  useEffect(() => {
    if (view === 'cumulative') {
      const currentDay = parseFloat(age) || 0;
      if (currentDay > 0 && !prevWeight && history.length > 0) {
        const prevRecord = [...history]
          .filter(r => r.age < currentDay)
          .sort((a, b) => b.age - a.age)[0];
        if (prevRecord) {
          const weightKg = prevRecord.totalWeight / prevRecord.currentPop;
          setPrevWeight(Math.round(weightKg * 1000).toString());
        }
      }
    }
  }, [view, age, history, prevWeight]);

  const stats = useMemo(() => {
    const p1 = parseFloat(initialPop) || 0;
    const p2 = parseFloat(currentPop) || 0;
    const currentDay = view === 'daily' ? (parseFloat(dailyAge || age) || 0) : (parseFloat(age) || 0);
    const a = currentDay;
    const dw = parseFloat(dailyWeight) || 0;
    const pw = parseFloat(prevWeight) || 0;
    const df = (parseFloat(dailyFeedSak) || 0) * 50; 
    const currentWeek = Math.ceil(currentDay / 7);
    
    // Derived from history - specifically for records PRIOR to the current age being viewed
    const lastRecordBeforeToday = [...history]
      .filter(r => r.age < currentDay)
      .sort((a, b) => b.age - a.age)[0];
    
    const histFeedBeforeToday = lastRecordBeforeToday ? lastRecordBeforeToday.totalFeed : 0;
    const histDeathsBeforeToday = lastRecordBeforeToday ? (lastRecordBeforeToday.initialPop - lastRecordBeforeToday.currentPop) : 0;
    
    const openingPopToday = p1 - histDeathsBeforeToday;
    const pp = openingPopToday;

    if (p1 === 0 || a === 0) return null;

    // Smartly derive total feed if not explicitly set
    let fValue = parseFloat(totalFeed);
    if (isNaN(fValue)) {
      fValue = histFeedBeforeToday + df;
    } else if (view === 'daily' && df > 0) {
      fValue = histFeedBeforeToday + df;
    }

    // Smartly derive total weight if not explicitly set
    let wValue = parseFloat(totalWeight);
    if (isNaN(wValue)) {
      wValue = dw > 0 ? (dw * p2) / 1000 : (lastRecordBeforeToday ? lastRecordBeforeToday.totalWeight : 0);
    } else if (view === 'daily' && dw > 0) {
      wValue = (dw * p2) / 1000;
    }

    const mortality = ((p1 - p2) / p1) * 100;
    const avgWeightKg = p2 > 0 ? (wValue / p2) : 0;
    const fcr = wValue > 0 ? (fValue / wValue) : 0;
    const ip = (p2 > 0 && fcr > 0 && a > 0) ? (((100 - mortality) * avgWeightKg) / (fcr * a)) * 100 : 0;

    // Daily Calculations
    const currentDailyAdg = (dw > 0 && pw > 0) ? (dw - pw) : 0;
    const cumulativeAdg = (avgWeightKg / a) * 1000;
    
    let dailyFcr: string | null = null;
    if (df > 0 && currentDailyAdg > 0 && p2 > 0) {
      const feedPerBirdKg = df / p2;
      const gainPerBirdKg = currentDailyAdg / 1000;
      dailyFcr = (feedPerBirdKg / gainPerBirdKg).toFixed(2);
    }

    const dailyDeaths = (pp > 0 && p2 > 0) ? (pp - p2) : 0;
    const dailyMortalityRate = (pp > 0) ? (dailyDeaths / pp) * 100 : 0;

    // Weekly Calculations (End of week logic)
    const endOfWeekToday = Math.ceil(currentDay / 7) * 7;
    const startOfWeekToday = endOfWeekToday - 6;

    const findLastRecordBeforeWeek = (weekNum: number) => {
      const weekStartTime = (weekNum - 1) * 7 + 1;
      return [...history]
        .filter(r => r.age < weekStartTime)
        .sort((a, b) => b.age - a.age)[0];
    };

    const prevWeekRecord = findLastRecordBeforeWeek(currentWeek);
    const feedAtStartOfWeek = prevWeekRecord ? prevWeekRecord.totalFeed : 0;
    const deathsAtStartOfWeek = prevWeekRecord ? (prevWeekRecord.totalDeaths ?? (prevWeekRecord.initialPop - prevWeekRecord.currentPop)) : 0;

    const statsWeeklyFeed = fValue - feedAtStartOfWeek;
    const totalWeeklyDeaths = (p1 - p2) - deathsAtStartOfWeek;

    const getIpStatus = (val: number) => {
      if (val >= 400) return 'PREMIUM GRADE';
      if (val >= 350) return 'EXCELLENT';
      if (val >= 300) return 'STANDARD';
      return 'UNDERPERFORM';
    };

    const getStatusType = (val: number) => {
      if (val >= 400) return 'excellent';
      if (val >= 350) return 'good';
      if (val >= 300) return 'fair';
      return 'poor';
    };

    return {
      mortality: Math.round(mortality).toString(),
      avgWeight: Math.round(avgWeightKg * 1000).toString(),
      fcr: fcr.toFixed(1),
      ip: Math.round(ip).toString(),
      ipStatus: getIpStatus(ip),
      statusType: getStatusType(ip),
      feedEfficiency: fcr > 0 ? Math.round((1 / fcr) * 100).toString() : '0',
      dailyFcr: dailyFcr ? parseFloat(dailyFcr).toFixed(1) : null,
      adg: Math.round(cumulativeAdg).toString(),
      dailyAdg: currentDailyAdg > 0 ? Math.round(currentDailyAdg).toString() : null,
      dailyMortality: dailyMortalityRate.toFixed(2),
      dailyDeaths,
      weeklyDeaths: totalWeeklyDeaths,
      weeklyFeed: Math.round(statsWeeklyFeed).toLocaleString(),
      weeklyFeedRaw: statsWeeklyFeed, // for SAK calculation
      cumulativeFeed: Math.round(fValue).toLocaleString(),
      cumulativeFeedRaw: fValue,
      cumulativeWeight: Math.round(wValue).toLocaleString(),
      cumulativeWeightRaw: wValue,
      currentWeek: currentWeek || '-'
    };
  }, [initialPop, currentPop, totalWeight, totalFeed, age, dailyFeedSak, dailyWeight, prevWeight, history, dailyAge]);

  // Production and growth projection logic
  const projectionData = useMemo(() => {
    const pop = parseFloat(currentPop || initialPop) || 10000;
    const startAge = parseFloat(dailyAge || age) || 30;
    const startWeight = stats ? parseFloat(stats.avgWeight) : (parseFloat(dailyWeight) || 1500);
    
    // Live average ADG
    const defaultAdg = stats ? parseFloat(stats.dailyAdg || stats.adg || '50') : 50;
    const activeAdg = parseFloat(customProjectionAdg) || defaultAdg;
    
    // Live FCR
    const defaultFcr = stats ? parseFloat(stats.fcr) : 1.55;
    const activeFcr = parseFloat(customProjectionFcr) || defaultFcr;
    
    // Generate projection for the next 7 days
    const rows = [];
    let currentProjWeight = startWeight;
    
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const projAge = startAge + dayOffset;
      
      // Calculate projected weight (gr)
      const weightGain = activeAdg;
      currentProjWeight += weightGain;
      
      // Total flock weight in kg
      const totalFlockWeightKg = (currentProjWeight * pop) / 1000;
      
      // Calculate estimated cumulative feed based on active FCR
      // Cumulative feed = total flock weight * FCR
      const estCumulativeFeedKg = totalFlockWeightKg * activeFcr;
      const estCumulativeFeedSak = estCumulativeFeedKg / 50;
      
      rows.push({
        dayOffset,
        age: projAge,
        avgWeight: Math.round(currentProjWeight),
        gain: Math.round(weightGain),
        totalFlockWeight: Math.round(totalFlockWeightKg),
        estCumulativeFeedKg: Math.round(estCumulativeFeedKg),
        estCumulativeFeedSak: Math.round(estCumulativeFeedSak * 10) / 10,
      });
    }
    
    return {
      activeAdg: Math.round(activeAdg),
      activeFcr: Math.round(activeFcr * 100) / 100,
      defaultAdg: Math.round(defaultAdg),
      defaultFcr: Math.round(defaultFcr * 100) / 100,
      rows
    };
  }, [stats, currentPop, initialPop, dailyAge, age, dailyWeight, customProjectionAdg, customProjectionFcr]);

  const handleReset = () => {
    const totalDocPop = docCheckIns.reduce((sum, doc) => sum + doc.popCount, 0);
    setInitialPop(totalDocPop.toString());
    setCurrentPop(totalDocPop.toString());
    setTotalWeight('');
    setTotalFeed('');
    setAge('');
    setDailyFeedSak('');
    setDailyWeight('');
    setPrevWeight('');
    setDailyDeathsInput('');
    setDailyAge('');
    setDailyDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const saveRecord = () => {
    if (!stats) return;
    
    // Choose the appropriate age based on input context
    const finalAge = (view === 'daily' && dailyAge) ? parseFloat(dailyAge) : parseFloat(age);
    
    const p1 = parseFloat(initialPop) || 0;
    const p2 = parseFloat(currentPop) || 0;
    
    const currentDay = finalAge;
    const prevRecord = [...history]
      .filter(r => r.age < currentDay)
      .sort((a, b) => b.age - a.age)[0];
    
    const prevTotalFeed = prevRecord ? prevRecord.totalFeed : 0;
    const prevPop = prevRecord ? prevRecord.currentPop : p1;
    const prevTotalDeaths = prevRecord ? (prevRecord.totalDeaths ?? (prevRecord.initialPop - prevRecord.currentPop)) : 0;

    let f = 0;
    let dailyF = 0;
    let d = 0;
    let dailyD = 0;

    // Smartly derive values based on active view to maintain sync
    if (view === 'daily') {
      dailyF = (parseFloat(dailyFeedSak) || 0) * 50;
      f = prevTotalFeed + dailyF;
      dailyD = parseFloat(dailyDeathsInput) || 0;
      d = prevTotalDeaths + dailyD;
    } else if (view === 'cumulative') {
      f = parseFloat(totalFeed) || 0;
      dailyF = f - prevTotalFeed;
      d = p1 - p2;
      dailyD = d - prevTotalDeaths;
    } else {
      // Fallback
      f = stats ? stats.cumulativeFeedRaw : (parseFloat(totalFeed) || 0);
      dailyF = (parseFloat(dailyFeedSak) || 0) * 50;
      d = p1 - p2;
      dailyD = stats.dailyDeaths;
    }

    const w = stats ? stats.cumulativeWeightRaw : (parseFloat(totalWeight) || 0);

    const newRecord: FlockRecord = {
      id: crypto.randomUUID(),
      date: view === 'daily' ? new Date(dailyDate + 'T12:00:00').toISOString() : new Date().toISOString(),
      age: finalAge,
      initialPop: p1,
      currentPop: p2,
      totalWeight: w,
      totalFeed: f,
      fcr: parseFloat(stats.fcr),
      ip: parseFloat(stats.ip),
      mortality: parseFloat(stats.mortality),
      dailyFcr: stats.dailyFcr ? parseFloat(stats.dailyFcr) : null,
      adg: parseFloat(stats.adg),
      dailyAdg: stats.dailyAdg ? parseFloat(stats.dailyAdg.toString()) : null,
      dailyDeaths: dailyD,
      dailyFeed: dailyF,
      totalDeaths: d,
      weeklyDeaths: stats.weeklyDeaths
    };

    setHistory(prev => {
      const existsIdx = prev.findIndex(r => r.age === finalAge);
      if (existsIdx !== -1) {
        const updated = [...prev];
        updated[existsIdx] = { ...newRecord, id: prev[existsIdx].id };
        return updated;
      }
      return [newRecord, ...prev];
    });

    // Keep global dashboard cumulative states in perfect sync
    setAge(finalAge.toString());
    setTotalFeed(Math.round(f).toString());
    setTotalWeight(Math.round(w).toString());

    // Auto-deduct/update feed stock if recorded on daily view
    if (view === 'daily') {
      const feedSakAmount = parseFloat(dailyFeedSak) || 0;
      if (feedSakAmount > 0) {
        setFeedTransactions(prev => {
          const searchNote = `Konsumsi pakan harian terintegrasi (Hari ke-${finalAge})`;
          const existsIdx = prev.findIndex(tx => tx.notes === searchNote);
          if (existsIdx !== -1) {
            const updated = [...prev];
            updated[existsIdx] = {
              ...updated[existsIdx],
              quantity: feedSakAmount,
              date: dailyDate
            };
            return updated;
          } else {
            const autoTx: FeedTransaction = {
              id: crypto.randomUUID(),
              date: dailyDate,
              type: 'keluar',
              quantity: feedSakAmount,
              feedType: finalAge < 15 ? '8201' : (finalAge < 29 ? '811' : '9203'),
              notes: searchNote
            };
            return [autoTx, ...prev];
          }
        });
      }
    }

    alert('Data berhasil disimpan ke riwayat.');
  };

  const deleteRecord = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus baris histori harian ini?')) {
      setHistory(prev => {
        const targetRecord = prev.find(r => r.id === id);
        if (targetRecord) {
          // Sync feed stock transaction for this day if integrated
          const searchNote = `Konsumsi pakan harian terintegrasi (Hari ke-${targetRecord.age})`;
          setFeedTransactions(fPrev => fPrev.filter(tx => tx.notes !== searchNote));
        }

        const remaining = prev.filter(r => r.id !== id);
        if (remaining.length > 0) {
          // Find the latest remaining record to update dashboard stats
          const sorted = [...remaining].sort((a, b) => b.age - a.age);
          const latest = sorted[0];
          setAge(latest.age.toString());
          setTotalFeed(Math.round(latest.totalFeed).toString());
          setTotalWeight(Math.round(latest.totalWeight).toString());
          setCurrentPop(latest.currentPop.toString());
        } else {
          // If history is empty, reset dashboard stats to starting parameters
          const totalDocPop = docCheckIns.reduce((sum, doc) => sum + doc.popCount, 0);
          setAge('');
          setTotalFeed('');
          setTotalWeight('');
          setCurrentPop(totalDocPop.toString());
        }
        return remaining;
      });
      alert('Data histori berhasil dihapus.');
    }
  };

  const deleteHarvestRecord = (id: string) => {
    if (confirm('Hapus data panen ini?')) {
      setHarvestHistory(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleAddFeedTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(feedQty);
    if (isNaN(qty) || qty <= 0) {
      alert('Jumlah SAK harus berupa angka positif.');
      return;
    }

    const newTx: FeedTransaction = {
      id: crypto.randomUUID(),
      date: feedDate,
      type: feedTypeAction,
      quantity: qty,
      feedType: feedBrand,
      docNo: feedDocNo || undefined,
      notes: feedNotes || undefined,
    };

    setFeedTransactions(prev => [newTx, ...prev]);
    setFeedQty('');
    setFeedDocNo('');
    setFeedNotes('');
    alert('Transaksi pakan berhasil ditambahkan.');
  };

  const handleDeleteFeedTransaction = (id: string) => {
    if (confirm('Hapus transaksi pakan ini?')) {
      setFeedTransactions(prev => prev.filter(tx => tx.id !== id));
    }
  };

  const handleAddDocCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const boxes = parseInt(docBoxes);
    const pop = parseInt(docPop);
    const weight = parseFloat(docWeight);

    if (isNaN(boxes) || boxes <= 0) {
      alert('Jumlah Box harus bernilai positif.');
      return;
    }
    if (isNaN(pop) || pop <= 0) {
      alert('Total Populasi Ekor harus bernilai positif.');
      return;
    }
    if (isNaN(weight) || weight <= 0) {
      alert('Rata-rata berat harus bernilai positif.');
      return;
    }

    const newDoc: DocCheckIn = {
      id: crypto.randomUUID(),
      date: docDate,
      boxCount: boxes,
      popCount: pop,
      weightAvg: weight,
      supplier: docSupplier,
      condition: docCondition,
      notes: docNotes || undefined,
    };

    setDocCheckIns(prev => [newDoc, ...prev]);

    // Clear form
    setDocNotes('');

    // Offer sync options for initial setup
    const totalDocPop = [newDoc, ...docCheckIns].reduce((sum, doc) => sum + doc.popCount, 0);
    if (confirm(`DOC Berhasil Check-in!\nApakah Anda ingin memperbarui Populasi Awal di Dashboard ke ${totalDocPop.toLocaleString()} ekor (Total Semua Check-In) dan mereset umur ke 1 hari?`)) {
      setInitialPop(totalDocPop.toString());
      setCurrentPop(totalDocPop.toString());
      setAge('1');
      setDailyAge('1');
      alert('Populasi dashboard dan umur berhasil disinkronisasi ke 1 hari.');
    } else {
      alert('Check-in DOC berhasil dicatat.');
    }
  };

  const handleDeleteDocCheckIn = (id: string) => {
    if (confirm('Hapus histori check-in DOC ini?')) {
      setDocCheckIns(prev => {
        const remainingDocs = prev.filter(doc => doc.id !== id);
        const totalDocPop = remainingDocs.reduce((sum, doc) => sum + doc.popCount, 0);
        if (confirm(`Histori check-in DOC dihapus.\nApakah Anda ingin memperbarui Populasi Awal di Dashboard ke ${totalDocPop.toLocaleString()} ekor?`)) {
          setInitialPop(totalDocPop.toString());
          setCurrentPop(totalDocPop.toString());
        }
        return remainingDocs;
      });
    }
  };

  const saveHarvest = () => {
    const b = parseFloat(harvestBirds) || 0;
    const aw = parseFloat(harvestAvgWeight) || 0; // aw is in kg (e.g. 1.234)
    const tw = parseFloat(harvestTotalWeight) || 0; // tw is in kg (e.g. 15000)
    const hAge = parseFloat(harvestAge) || parseFloat(age) || 0;

    if (b <= 0 || (aw <= 0 && tw <= 0) || hAge <= 0) {
      alert('Mohon lengkapi data panen dan umur harian.');
      return;
    }

    // Auto calculate if one is missing
    let finalTw = tw;
    let finalAw = aw > 0 ? aw : 0; // store internally in kg

    if (tw === 0 && aw > 0) finalTw = b * aw;
    if (aw === 0 && tw > 0) finalAw = tw / b; // in kg

    // Calculate IP for this specific harvest
    const currentFcr = stats ? parseFloat(stats.fcr) : 0;
    const currentMortality = stats ? parseFloat(stats.mortality) : 0;
    
    // IP = ((100 - Mortality) * AvgWeightKG) / (FCR * Age) * 100
    const avgWeightKg = finalAw;
    const calculatedIp = (currentFcr > 0 && hAge > 0) 
      ? (((100 - currentMortality) * avgWeightKg) / (currentFcr * hAge)) * 100 
      : 0;

    const hasWeighing = activeDrafts.some(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0);
    const validDrafts: WeighingDraft[] = activeDrafts
      .filter(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0)
      .map(d => ({
        id: d.id,
        birds: parseInt(d.birds as any) || 0,
        weight: parseWeight(d.weight)
      }));

    const newRecord: HarvestRecord = {
      id: crypto.randomUUID(),
      date: harvestDate,
      birds: b,
      avgWeight: finalAw,
      totalWeight: finalTw,
      age: hAge,
      ip: calculatedIp,
      weighingDrafts: hasWeighing ? validDrafts : undefined,
      dataTimbangNo,
      spbNo,
      timeArrived,
      timeLoaded,
      timeCompleted,
      takenBy,
      driverName,
      plateNo,
      driverSim,
      stnkNo,
      diserahkanNama,
      diserahkanTgl,
      diambilNama,
      diambilTgl,
      securityNama,
      securityTgl
    };

    setHarvestHistory(prev => [newRecord, ...prev]);
    setHarvestBirds('');
    setHarvestAvgWeight('');
    setHarvestTotalWeight('');
    
    // Reset weighing document block states
    setActiveDrafts(Array.from({ length: 90 }, (_, i) => ({
      id: `draft-${i}`,
      birds: '',
      weight: ''
    })));
    setDataTimbangNo(`PFL ${Math.floor(100000 + Math.random() * 900000)}`);
    setSpbNo('');
    setTimeArrived('');
    setTimeLoaded('');
    setTimeCompleted('');
    setTakenBy('');
    setDriverName('');
    setPlateNo('');
    setDriverSim('');
    setStnkNo('');
    setDiserahkanNama('');
    setDiserahkanTgl('');
    setDiambilNama('');
    setDiambilTgl('');
    setSecurityNama('');
    setSecurityTgl('');
    alert('Data panen berhasil disimpan dengan Indeks Performa.');
  };

  const exportHarvestToCSV = () => {
    if (harvestHistory.length === 0) {
      alert('Belum ada data panen untuk diekspor.');
      return;
    }

    const headers = [
      'Tanggal',
      'Umur (Hari)',
      'Jumlah Ekor (Ekor)',
      'Rata-rata Bobot (kg)',
      'Total Bobot (kg)',
      'Indeks Performa (IP)'
    ];

    const rows = harvestHistory.map((r, idx) => {
      return [
        r.date,
        r.age,
        r.birds,
        r.avgWeight.toFixed(3),
        r.totalWeight.toFixed(2),
        Math.round(r.ip).toString()
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `harvest_history_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToCSV = () => {
    if (history.length === 0) {
      alert('Belum ada data untuk diekspor.');
      return;
    }

    const headers = [
      'Tanggal',
      'ID',
      'Umur (Hari)',
      'Populasi Awal',
      'Populasi Akhir',
      'Total Bobot (kg)',
      'Total Pakan (kg)',
      'FCR Kumulatif',
      'IP',
      'Mortalitas (%)',
      'Daily FCR',
      'ADG Kumulatif (g)',
      'Daily ADG (g)',
      'Mati Harian',
      'Total Pakan Harian (kg)',
      'Total Kematian',
      'Kematian Mingguan'
    ];

    const rows = history.map(r => [
      format(new Date(r.date), 'yyyy-MM-dd HH:mm'),
      r.id,
      r.age,
      r.initialPop,
      r.currentPop,
      r.totalWeight,
      r.totalFeed,
      r.fcr,
      r.ip,
      r.mortality,
      r.dailyFcr ?? '',
      r.adg,
      r.dailyAdg ?? '',
      r.dailyDeaths ?? '',
      r.dailyFeed ?? '',
      r.totalDeaths ?? '',
      r.weeklyDeaths ?? ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `broiler_history_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const backupDatabase = () => {
    const backupData = {
      history,
      harvestHistory,
      feedTransactions,
      docCheckIns,
      initialPop,
      currentPop,
      totalWeight,
      totalFeed,
      age,
      backupVersion: '1.0',
      backupDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `erfours_broiler_backup_${format(new Date(), 'yyyyMMdd_HHmm')}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreDatabase = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
    if (!file) return;

    fileReader.onload = (e) => {
      try {
        const parsedData = JSON.parse(e.target?.result as string);
        
        if (
          !parsedData ||
          (typeof parsedData !== 'object') ||
          (!Array.isArray(parsedData.history) && 
           !Array.isArray(parsedData.feedTransactions) && 
           !Array.isArray(parsedData.docCheckIns))
        ) {
          alert('Format file backup tidak valid. Pastikan Anda mengunggah file JSON cadangan Erfours yang benar.');
          return;
        }

        if (confirm('Apakah Anda yakin ingin memulihkan database dari cadangan ini? Data saat ini di aplikasi akan ditimpa.')) {
          if (Array.isArray(parsedData.history)) {
            setHistory(parsedData.history);
          }
          if (Array.isArray(parsedData.harvestHistory)) {
            setHarvestHistory(parsedData.harvestHistory);
          }
          if (Array.isArray(parsedData.feedTransactions)) {
            setFeedTransactions(parsedData.feedTransactions);
          }
          if (Array.isArray(parsedData.docCheckIns)) {
            setDocCheckIns(parsedData.docCheckIns);
          }
          if (parsedData.initialPop !== undefined) {
            setInitialPop(String(parsedData.initialPop));
          }
          if (parsedData.currentPop !== undefined) {
            setCurrentPop(String(parsedData.currentPop));
          }
          if (parsedData.totalWeight !== undefined) {
            setTotalWeight(String(parsedData.totalWeight));
          }
          if (parsedData.totalFeed !== undefined) {
            setTotalFeed(String(parsedData.totalFeed));
          }
          if (parsedData.age !== undefined) {
            setAge(String(parsedData.age));
          }

          alert('Database berhasil dipulihkan dari cadangan!');
          event.target.value = '';
        }
      } catch (err) {
        console.error(err);
        alert('Gagal membaca file backup. Pastikan file dalam format JSON yang valid.');
      }
    };

    fileReader.readAsText(file);
  };

  // Chart data preparation
  const chartData = useMemo(() => {
    return [...history].reverse().map(r => ({
      name: format(new Date(r.date), 'dd/MM'),
      ip: r.ip,
      fcr: r.fcr,
      mort: r.mortality,
      adg: r.adg
    }));
  }, [history]);

  // Prepared data for the Daily Dashboard Table and Visualizations
  const dailyDashboardData = useMemo(() => {
    const sortedHistory = [...history].sort((a, b) => a.age - b.age);

    return sortedHistory.map((record) => {
      const recordDateStr = record.date.split('T')[0];
      const recordDateTime = new Date(recordDateStr + 'T23:59:59').getTime();

      const totalFeedInUpToDate = feedTransactions
        .filter(tx => tx.type === 'masuk' && new Date(tx.date).getTime() <= recordDateTime)
        .reduce((sum, tx) => sum + tx.quantity, 0);

      const totalFeedOutUpToDate = feedTransactions
        .filter(tx => tx.type === 'keluar' && new Date(tx.date).getTime() <= recordDateTime)
        .reduce((sum, tx) => sum + tx.quantity, 0);

      const runningStockSak = Math.max(0, totalFeedInUpToDate - totalFeedOutUpToDate);

      const avgWeightGr = record.currentPop > 0 ? (record.totalWeight / record.currentPop) * 1000 : 0;
      const dailyFeedKg = record.dailyFeed || 0;
      const dailyFeedSak = dailyFeedKg / 50;
      const mortalityRate = (record.currentPop + (record.dailyDeaths || 0)) > 0 
        ? ((record.dailyDeaths || 0) / (record.currentPop + (record.dailyDeaths || 0))) * 100 
        : 0;

      return {
        id: record.id,
        age: record.age,
        date: record.date,
        formattedDate: formatIndoDate(record.date),
        formattedDateShort: format(new Date(record.date), 'dd/MM'),
        dailyFeedKg,
        dailyFeedSak,
        dailyDeaths: record.dailyDeaths || 0,
        mortalityRate,
        avgWeightGr: Math.round(avgWeightGr),
        feedStockSak: runningStockSak,
        feedStockKg: runningStockSak * 50,
        currentPop: record.currentPop,
        fcr: record.fcr,
        ip: record.ip
      };
    });
  }, [history, feedTransactions]);

  // Filter daily dashboard data by search and week
  const filteredDailyDashboardData = useMemo(() => {
    return dailyDashboardData.filter(row => {
      const matchesSearch = row.age.toString().includes(dailyTableSearch) || 
                            row.formattedDate.toLowerCase().includes(dailyTableSearch.toLowerCase());
      
      const rowWeek = Math.ceil(row.age / 7);
      const matchesWeek = dailyTableWeekFilter === 'all' || rowWeek === dailyTableWeekFilter;
      
      return matchesSearch && matchesWeek;
    });
  }, [dailyDashboardData, dailyTableSearch, dailyTableWeekFilter]);

  // Display only the last 7 entries for the daily dashboard table
  const displayedDailyDashboardData = useMemo(() => {
    return filteredDailyDashboardData.slice(-7);
  }, [filteredDailyDashboardData]);

  // Export Daily Dashboard Data to CSV
  const handleExportDailyCSV = () => {
    if (filteredDailyDashboardData.length === 0) return;
    
    const headers = ['Hari Ke', 'Tanggal', 'Pakan Harian (KG)', 'Pakan Harian (SAK)', 'Kematian (Ekor)', 'Mortalitas (%)', 'Berat Rata-Rata (Gram)', 'Sisa Stok Pakan (SAK)', 'Sisa Stok Pakan (KG)'];
    const rows = filteredDailyDashboardData.map(row => [
      row.age,
      row.formattedDate,
      row.dailyFeedKg,
      row.dailyFeedSak.toFixed(2),
      row.dailyDeaths,
      row.mortalityRate.toFixed(2),
      row.avgWeightGr,
      row.feedStockSak.toFixed(2),
      row.feedStockKg.toFixed(2)
    ]);
    
    // Add UTF-8 BOM for Excel compatibility
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dashboard_informasi_harian_hari_${age || 'aktif'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validActiveDrafts = useMemo(() => activeDrafts.filter(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0), [activeDrafts]);
  const hasWeighings = useMemo(() => validActiveDrafts.length > 0, [validActiveDrafts]);

  const headerTableData = useMemo(() => {
    return Array.from({ length: 6 }).map((_, c) => {
      const colDrafts = activeDrafts.slice(c * 15, (c + 1) * 15);
      const validColDrafts = colDrafts.filter(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0);
      const birds = validColDrafts.reduce((sum, d) => sum + (parseInt(d.birds as any) || 0), 0);
      const weight = validColDrafts.reduce((sum, d) => sum + parseWeight(d.weight), 0);
      const avg = birds > 0 ? (weight / birds) : 0;
      return {
        name: `Kolom ${c + 1}`,
        birds,
        weight,
        avg: avg > 0 ? avg.toFixed(3) : '0.000'
      };
    });
  }, [activeDrafts]);

  const grandTotalBirds = useMemo(() => {
    return validActiveDrafts.reduce((sum, d) => sum + (parseInt(d.birds as any) || 0), 0);
  }, [validActiveDrafts]);

  const grandTotalWeight = useMemo(() => {
    return validActiveDrafts.reduce((sum, d) => sum + parseWeight(d.weight), 0);
  }, [validActiveDrafts]);

  const grandAvgWeight = useMemo(() => {
    return grandTotalBirds > 0 ? grandTotalWeight / grandTotalBirds : 0;
  }, [grandTotalBirds, grandTotalWeight]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-emerald-800 text-white flex items-center justify-between px-8 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4L32 16L20 28L8 16L20 4Z" fill="#60a5fa" />
              <path d="M20 12L32 24L20 36L8 24L20 12Z" fill="#2563eb" fillOpacity="0.9" />
              <path d="M20 12L26 18L20 24L14 18L20 12Z" fill="white" fillOpacity="0.3" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Erfours brosis</h1>
        </div>
        
        <nav className="flex items-center bg-emerald-900/50 rounded-lg p-1">
          <button 
            type="button"
            onClick={() => setView('daily')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${view === 'daily' ? 'bg-emerald-400 text-emerald-900 shadow-sm' : 'text-emerald-400 hover:text-white'}`}
          >
            Harian
          </button>
          <button 
            type="button"
            onClick={() => setView('inventory')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${view === 'inventory' ? 'bg-emerald-400 text-emerald-900 shadow-sm' : 'text-emerald-400 hover:text-white'}`}
          >
            Stok &amp; DOC
          </button>
          <button 
            type="button"
            onClick={() => setView('harvest')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${view === 'harvest' ? 'bg-emerald-400 text-emerald-900 shadow-sm' : 'text-emerald-400 hover:text-white'}`}
          >
            Panen
          </button>
          <button 
            type="button"
            onClick={() => setView('weighing')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${view === 'weighing' ? 'bg-emerald-400 text-emerald-900 shadow-sm' : 'text-emerald-400 hover:text-white'}`}
          >
            Lembar Timbang
          </button>
          <button 
            type="button"
            onClick={() => setView('cumulative')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${view === 'cumulative' ? 'bg-emerald-400 text-emerald-900 shadow-sm' : 'text-emerald-400 hover:text-white'}`}
          >
            Indeks IP
          </button>
          <button 
            type="button"
            onClick={() => setView('history')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${view === 'history' ? 'bg-emerald-400 text-emerald-900 shadow-sm' : 'text-emerald-400 hover:text-white'}`}
          >
            Riwayat
          </button>
        </nav>

        <div className="flex items-center gap-4 text-sm font-medium">
          <button 
            onClick={() => setShowAndroidModal(true)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 border border-emerald-400 active:scale-95 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-900/30 transition-all cursor-pointer animate-pulse"
          >
            <Smartphone size={13} className="animate-bounce" />
            <span>ID: Android App</span>
          </button>

          <div className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 
            System Active
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'daily' ? (
            <motion.div 
              key="daily"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="h-full flex flex-col md:flex-row p-6 gap-6 overflow-hidden"
            >
              {/* Sidebar: Daily Input */}
              <section className="w-full md:w-80 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Monitoring Harian</h2>
                    <button onClick={handleReset} className="text-slate-400 hover:text-emerald-600 transition-colors"><RefreshCcw size={14} /></button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Tanggal Monitoring</label>
                      <input 
                        type="date" 
                        value={dailyDate} 
                        onChange={(e) => handleDailyDateChange(e.target.value)} 
                        className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold font-mono cursor-pointer bg-white text-slate-800" 
                        required
                      />
                    </div>
                    <AgePicker 
                      age={dailyAge} 
                      onAgeChange={(newAge) => handleDailyAgeChange(newAge)} 
                      label="Umur Hari (Hari Ke-X)" 
                    />
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Pakan Hari Ini (SAK)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01"
                          value={dailyFeedSak} 
                          onChange={(e) => setDailyFeedSak(e.target.value)} 
                          placeholder="0"
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black tracking-tighter" 
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-bold italic">(@50KG)</span>
                      </div>
                      {dailyFeedSak && (
                        <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase tracking-tighter">
                          ≈ {(parseFloat(dailyFeedSak) * 50).toFixed(1)} KG TOTAL
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Bobot Hari Ini</label>
                      <div className="relative">
                        <input type="number" value={dailyWeight} onChange={(e) => setDailyWeight(e.target.value)} className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black tracking-tighter" />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black">GRAM</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Bobot Kemarin</label>
                      <div className="relative">
                        <input type="number" value={prevWeight} onChange={(e) => setPrevWeight(e.target.value)} className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black tracking-tighter" />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black">GRAM</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Populasi Awal DOC</label>
                        <span className="text-[9px] font-black text-emerald-600 flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          ✓ Terkunci & Sinkron
                        </span>
                      </div>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={initialPop} 
                          readOnly
                          className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg py-2 px-3 focus:outline-none text-lg font-black tracking-tighter cursor-not-allowed" 
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black uppercase">EKOR</span>
                      </div>
                      <p className="text-[9px] font-bold text-slate-400">
                        Disinkronkan otomatis dari Total Check-In DOC datang ({docCheckIns.reduce((sum, doc) => sum + doc.popCount, 0).toLocaleString()} ekor)
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-rose-500 uppercase tracking-tight">Mati Harian (Jumlah)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={dailyDeathsInput} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setDailyDeathsInput(val);
                            
                            const currentDay = parseFloat(dailyAge || age) || 0;
                            const p1 = parseFloat(initialPop) || 0;
                            const histDeaths = history
                              .filter(r => r.age < currentDay)
                              .reduce((sum, r) => sum + (r.dailyDeaths || 0), 0);
                            const d = parseFloat(val) || 0;
                            if (p1 > 0) {
                              const c = p1 - histDeaths - d;
                              setCurrentPop(c.toString());
                            }
                          }} 
                          placeholder="0"
                          className="w-full border border-rose-200 bg-rose-50/30 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-lg font-black text-rose-700 tracking-tighter" 
                        />
                        <span className="absolute right-3 top-2.5 text-rose-400 text-[10px] font-black">MATI</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Populasi Saat Ini</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={currentPop} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurrentPop(val);
                            
                            const currentDay = parseFloat(dailyAge || age) || 0;
                            const p1 = parseFloat(initialPop) || 0;
                            const histDeaths = history
                               .filter(r => r.age < currentDay)
                               .reduce((sum, r) => sum + (r.dailyDeaths || 0), 0);
                            const openingPopToday = p1 - histDeaths;
                            
                            const c = parseFloat(val) || 0;
                            if (openingPopToday > 0) {
                              setDailyDeathsInput((openingPopToday - c).toString());
                            }
                          }} 
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black tracking-tighter" 
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black uppercase">EKOR</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <button 
                      onClick={saveRecord} 
                      disabled={!stats}
                      className={`w-full ${stats ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-500/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'} text-white font-black py-4 px-4 rounded-lg flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] transition-all`}
                    >
                      <Save size={14} /> Simpan Data Hari Ini
                    </button>
                    {!stats && (
                      <p className="text-[9px] text-center text-rose-500 font-bold mt-2 uppercase tracking-tighter leading-tight">
                        *LENGKAPI DATA DASAR UNTUK MENYIMPAN
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Dashboard: Daily Results */}
              <section className="flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-emerald-900 text-white rounded-xl p-8 flex flex-col justify-between relative overflow-hidden shadow-xl min-h-[220px]">
                    <div>
                      <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Daily FCR (Efisiensi Harian)</p>
                      <h3 className="text-8xl font-black tracking-tighter italic leading-none">{stats?.dailyFcr || '0.0'}</h3>
                    </div>
                    <div className="z-10 flex items-center gap-3 mt-6">
                      <span className="px-4 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black tracking-widest uppercase">
                        HARI KE-{dailyAge || '-'}
                      </span>
                      <p className="text-emerald-400/50 text-[10px] font-bold uppercase tracking-widest">ADG: {stats?.dailyAdg || 0} g/hari</p>
                    </div>
                    <Activity size={200} className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none transform rotate-12" />
                  </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pakan/Ekor</p>
                        <p className="text-2xl font-black text-slate-900">
                          {dailyFeedSak && currentPop ? (
                            (() => {
                              const p2 = parseFloat(currentPop) || 0;
                              const df = (parseFloat(dailyFeedSak) * 50); // kg
                              const perBirdGr = (df / p2) * 1000;
                              return Math.round(perBirdGr).toLocaleString();
                            })()
                          ) : '0'}
                          <span className="text-xs ml-1 font-bold text-slate-300">gr</span>
                        </p>
                      </div>
                      
                      <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Users size={12} className="text-rose-500" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kematian Harian</p>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <p className="text-2xl font-black text-rose-600">
                            {stats?.dailyDeaths || '0'}
                          </p>
                          <span className="text-[10px] font-black text-rose-400">({stats?.dailyMortality || '0.00'}%)</span>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-1">
                          <History size={12} className="text-rose-600" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kematian Mingguan</p>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <p className="text-2xl font-black text-rose-700">
                            {stats?.weeklyDeaths || '0'}
                          </p>
                          <span className="text-[10px] font-black text-rose-400">W{stats?.currentWeek || '-'}</span>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Beef size={12} className="text-emerald-600" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Pakan Mingguan</p>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <p className="text-2xl font-black text-emerald-700">
                            {stats?.weeklyFeed || '0'}
                          </p>
                          <span className="text-[10px] font-black text-emerald-400 uppercase">KG</span>
                          {stats?.weeklyFeed && (
                            <span className="text-base font-black text-emerald-600 ml-2">
                              ({Math.round((stats?.weeklyFeedRaw || 0) / 50).toLocaleString()} SAK)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Visualisasi Tren Harian Dashboard */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                        <div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                            <BarChart3 size={16} className="text-emerald-500" />
                            Visualisasi Tren Harian
                          </h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Grafik interaktif performa pakan harian, kematian harian, berat badan, & sisa stok pakan</p>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setActiveDailyChartTab('feed')}
                            className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${
                              activeDailyChartTab === 'feed'
                                ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Pakan & Stok Pakan
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveDailyChartTab('growth')}
                            className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${
                              activeDailyChartTab === 'growth'
                                ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Berat & Kematian
                          </button>
                        </div>
                      </div>

                      {filteredDailyDashboardData.length === 0 ? (
                        <div className="h-60 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-lg bg-slate-50 p-6 text-center">
                          <TrendingUp size={36} className="text-slate-300 mb-2 animate-bounce" />
                          <p className="text-[11px] font-black text-slate-500 uppercase tracking-tight">Belum Ada Data Tren</p>
                          <p className="text-[10px] text-slate-400 font-bold max-w-xs mt-1 uppercase leading-tight">Simpan data harian pada form kiri terlebih dahulu untuk melihat visualisasi tren harian.</p>
                        </div>
                      ) : (
                        <div className="h-[280px] w-full">
                          {activeDailyChartTab === 'feed' ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={filteredDailyDashboardData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                  dataKey="age" 
                                  tickFormatter={(v) => `Hari ${v}`}
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{fontSize: 9, fill: '#64748b', fontWeight: 700}}
                                />
                                <YAxis 
                                  yAxisId="left"
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{fontSize: 9, fill: '#10b981', fontWeight: 700}}
                                  label={{ value: 'Pakan (SAK)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 9, fill: '#10b981', fontWeight: 700 } }}
                                />
                                <YAxis 
                                  yAxisId="right"
                                  orientation="right"
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{fontSize: 9, fill: '#3b82f6', fontWeight: 700}}
                                  label={{ value: 'Stok Pakan (SAK)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: 9, fill: '#3b82f6', fontWeight: 700 } }}
                                />
                                <Tooltip 
                                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 600 }}
                                  formatter={(value: any, name: string) => {
                                    const valNum = parseFloat(value) || 0;
                                    if (name.includes("Sisa")) return [`${valNum.toFixed(2)} SAK (${(valNum * 50).toLocaleString()} kg)`, "Sisa Stok Pakan"];
                                    return [`${valNum.toFixed(2)} SAK (${(valNum * 50).toLocaleString()} kg)`, "Konsumsi Pakan"];
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, marginTop: '5px' }} />
                                <Bar yAxisId="left" dataKey="dailyFeedSak" fill="#10b981" radius={[4, 4, 0, 0]} name="Konsumsi Pakan (SAK)" barSize={24} />
                                <Area yAxisId="right" type="monotone" dataKey="feedStockSak" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.12} name="Sisa Stok Pakan (SAK)" />
                              </ComposedChart>
                            </ResponsiveContainer>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={filteredDailyDashboardData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                  dataKey="age" 
                                  tickFormatter={(v) => `Hari ${v}`}
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{fontSize: 9, fill: '#64748b', fontWeight: 700}}
                                />
                                <YAxis 
                                  yAxisId="left"
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{fontSize: 9, fill: '#10b981', fontWeight: 700}}
                                  label={{ value: 'Berat Badan (Gram)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 9, fill: '#10b981', fontWeight: 700 } }}
                                />
                                <YAxis 
                                  yAxisId="right"
                                  orientation="right"
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{fontSize: 9, fill: '#f43f5e', fontWeight: 700}}
                                  label={{ value: 'Kematian (Ekor)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: 9, fill: '#f43f5e', fontWeight: 700 } }}
                                />
                                <Tooltip 
                                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 600 }}
                                  formatter={(value: any, name: string) => {
                                    if (name.includes("Berat")) return [`${value.toLocaleString()} g`, "Berat Rata-rata"];
                                    return [`${value} Ekor`, "Kematian"];
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, marginTop: '5px' }} />
                                <Bar yAxisId="right" dataKey="dailyDeaths" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Kematian Harian (Ekor)" barSize={24} />
                                <Line yAxisId="left" type="monotone" dataKey="avgWeightGr" stroke="#10b981" strokeWidth={3} dot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7 }} name="Berat Badan (Gram)" />
                              </ComposedChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Tabel Dashboard Informasi Harian */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                              <FileSpreadsheet size={16} className="text-emerald-500" />
                              Tabel Dashboard Informasi Harian
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Ringkasan pakan, kematian harian, stok pakan & perkembangan bobot</p>
                          </div>
                          
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            {/* Scroll Assist Buttons */}
                            {filteredDailyDashboardData.length > 0 && (
                              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1 gap-1">
                                <button
                                  type="button"
                                  onClick={() => scrollDailyTable('left')}
                                  className="p-1 rounded-md text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-xs transition-all cursor-pointer flex items-center justify-center"
                                  title="Scroll Kiri"
                                >
                                  <ChevronLeft size={14} />
                                </button>
                                <span className="text-[8px] font-black uppercase text-slate-400 px-1 select-none">Navigasi</span>
                                <button
                                  type="button"
                                  onClick={() => scrollDailyTable('right')}
                                  className="p-1 rounded-md text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-xs transition-all cursor-pointer flex items-center justify-center"
                                  title="Scroll Kanan"
                                >
                                  <ChevronRight size={14} />
                                </button>
                              </div>
                            )}

                            {filteredDailyDashboardData.length > 0 && (
                              <button
                                type="button"
                                onClick={handleExportDailyCSV}
                                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                              >
                                <Download size={12} />
                                <span>Unduh CSV</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          {/* Search bar */}
                          <div className="relative w-full sm:flex-1">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={13} />
                            <input
                              type="text"
                              value={dailyTableSearch}
                              onChange={(e) => setDailyTableSearch(e.target.value)}
                              placeholder="Cari berdasarkan hari atau tanggal..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
                            />
                            {dailyTableSearch && (
                              <button
                                onClick={() => setDailyTableSearch('')}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>

                          {/* Week selector */}
                          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                            <Filter size={12} className="text-slate-400" />
                            <select
                              value={dailyTableWeekFilter}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDailyTableWeekFilter(val === 'all' ? 'all' : parseInt(val));
                              }}
                              className="w-full sm:w-40 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 cursor-pointer"
                            >
                              <option value="all">Semua Minggu</option>
                              <option value="1">Minggu 1 (Hari 1-7)</option>
                              <option value="2">Minggu 2 (Hari 8-14)</option>
                              <option value="3">Minggu 3 (Hari 15-21)</option>
                              <option value="4">Minggu 4 (Hari 22-28)</option>
                              <option value="5">Minggu 5 (Hari 29+)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div 
                        ref={dailyTableScrollRef}
                        className="overflow-x-auto custom-scrollbar pb-4"
                      >
                        {filteredDailyDashboardData.length === 0 ? (
                          <div className="p-8 text-center bg-slate-50/50">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Tidak Ada Data yang Cocok</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase leading-tight">Coba bersihkan pencarian atau ganti filter minggu.</p>
                          </div>
                        ) : (
                          <table className="min-w-max w-full border-collapse text-left">
                            <tbody className="divide-y divide-slate-100 text-xs">
                              {/* Row 1: Hari Ke */}
                              <tr className="border-b border-slate-100">
                                <td className="w-[150px] min-w-[150px] py-4 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[4px_0_10px_rgba(0,0,0,0.04)] whitespace-nowrap">
                                  Hari Ke
                                </td>
                                {displayedDailyDashboardData.map((row) => (
                                  <td key={row.id + '-age'} className="w-[130px] min-w-[130px] py-4 px-3 text-center font-bold text-slate-800 whitespace-nowrap bg-slate-50/50">
                                    <span className="inline-flex items-center justify-center bg-emerald-50 border border-emerald-100 text-emerald-700 font-black text-[10px] w-16 py-1 rounded-md uppercase tracking-wider">
                                      Hari {row.age}
                                    </span>
                                  </td>
                                ))}
                              </tr>

                              {/* Row 2: Tanggal */}
                              <tr className="border-b border-slate-100 hover:bg-slate-50/20 transition-colors">
                                <td className="w-[150px] min-w-[150px] py-4 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[4px_0_10px_rgba(0,0,0,0.04)] whitespace-nowrap">
                                  Tanggal
                                </td>
                                {displayedDailyDashboardData.map((row) => (
                                  <td key={row.id + '-date'} className="w-[130px] min-w-[130px] py-4 px-3 text-center font-bold text-slate-600 font-mono whitespace-nowrap">
                                    {row.formattedDate}
                                  </td>
                                ))}
                              </tr>

                              {/* Row 3: Pakan Harian */}
                              <tr className="border-b border-slate-100 hover:bg-slate-50/20 transition-colors">
                                <td className="w-[150px] min-w-[150px] py-4 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[4px_0_10px_rgba(0,0,0,0.04)] whitespace-nowrap">
                                  Pakan Harian
                                </td>
                                {displayedDailyDashboardData.map((row) => (
                                  <td key={row.id + '-feed'} className="w-[130px] min-w-[130px] py-4 px-3 text-center whitespace-nowrap">
                                    <div className="flex flex-col items-center">
                                      <span className="font-black text-slate-800">{row.dailyFeedSak.toFixed(2)} SAK</span>
                                      <span className="text-[10px] text-slate-400 font-bold uppercase">{row.dailyFeedKg.toLocaleString()} KG</span>
                                    </div>
                                  </td>
                                ))}
                              </tr>

                              {/* Row 4: Kematian Harian */}
                              <tr className="border-b border-slate-100 hover:bg-slate-50/20 transition-colors">
                                <td className="w-[150px] min-w-[150px] py-4 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[4px_0_10px_rgba(0,0,0,0.04)] whitespace-nowrap">
                                  Kematian Harian
                                </td>
                                {displayedDailyDashboardData.map((row) => (
                                  <td key={row.id + '-deaths'} className="w-[130px] min-w-[130px] py-4 px-3 text-center whitespace-nowrap">
                                    <div className="flex flex-col items-center">
                                      <span className={`font-black ${row.dailyDeaths > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                                        {row.dailyDeaths} Ekor
                                      </span>
                                      {row.dailyDeaths > 0 ? (
                                        <span className="text-[10px] text-rose-400 font-black">
                                          {row.mortalityRate.toFixed(2)}%
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-slate-300 font-black">-</span>
                                      )}
                                    </div>
                                  </td>
                                ))}
                              </tr>

                              {/* Row 5: Berat Harian */}
                              <tr className="border-b border-slate-100 hover:bg-slate-50/20 transition-colors">
                                <td className="w-[150px] min-w-[150px] py-4 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[4px_0_10px_rgba(0,0,0,0.04)] whitespace-nowrap">
                                  Berat Harian
                                </td>
                                {displayedDailyDashboardData.map((row) => {
                                  // Locate this row's position in the original full dataset to calculate accurate chronological trend
                                  const originalIndex = filteredDailyDashboardData.findIndex(r => r.id === row.id);
                                  const prevRow = originalIndex > 0 ? filteredDailyDashboardData[originalIndex - 1] : null;
                                  const weightDiff = prevRow ? row.avgWeightGr - prevRow.avgWeightGr : 0;
                                  return (
                                    <td key={row.id + '-weight'} className="w-[130px] min-w-[130px] py-4 px-3 text-center whitespace-nowrap">
                                      <div className="flex flex-col items-center">
                                        <span className="font-black text-slate-800">{row.avgWeightGr.toLocaleString()} g</span>
                                        {prevRow ? (
                                          <div className={`flex items-center gap-0.5 text-[9px] font-black uppercase tracking-tight ${weightDiff >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            {weightDiff >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                            <span>{weightDiff >= 0 ? `+${weightDiff}` : weightDiff} g</span>
                                          </div>
                                        ) : (
                                          <span className="text-[10px] text-slate-300 font-black">-</span>
                                        )}
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* Row 6: Sisa Stok Pakan */}
                              <tr className="border-b border-slate-100 hover:bg-slate-50/20 transition-colors">
                                <td className="w-[150px] min-w-[150px] py-4 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[4px_0_10px_rgba(0,0,0,0.04)] whitespace-nowrap">
                                  Sisa Stok Pakan
                                </td>
                                {displayedDailyDashboardData.map((row) => (
                                  <td key={row.id + '-stock'} className="w-[130px] min-w-[130px] py-4 px-3 text-center whitespace-nowrap">
                                    <div className="flex flex-col items-center">
                                      <div className="flex items-center gap-1 justify-center">
                                        <span className="font-black text-slate-800">{row.feedStockSak.toFixed(2)} SAK</span>
                                        {row.feedStockSak < 15 ? (
                                          <span className="bg-rose-50 border border-rose-100 text-rose-600 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">Kritis</span>
                                        ) : row.feedStockSak < 30 ? (
                                          <span className="bg-amber-50 border border-amber-100 text-amber-600 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">Menipis</span>
                                        ) : (
                                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">Aman</span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-bold uppercase">{row.feedStockKg.toLocaleString()} KG</span>
                                    </div>
                                  </td>
                                ))}
                              </tr>

                              {/* Row 7: Tindakan */}
                              <tr className="hover:bg-slate-50/20 transition-colors">
                                <td className="w-[150px] min-w-[150px] py-4 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[4px_0_10px_rgba(0,0,0,0.04)] whitespace-nowrap">
                                  Tindakan
                                </td>
                                {displayedDailyDashboardData.map((row) => (
                                  <td key={row.id + '-action'} className="w-[130px] min-w-[130px] py-4 px-3 text-center whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => deleteRecord(row.id)}
                                      className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all inline-flex items-center justify-center"
                                      title="Hapus data hari ini"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>

                </div>
              </section>
            </motion.div>
          ) : view === 'cumulative' ? (
            <motion.div 
              key="cumulative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col md:flex-row p-6 gap-6 overflow-hidden"
            >
              <section className="w-full md:w-80 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Data Kumulatif Flock</h2>
                    <button onClick={handleReset} className="text-slate-400 hover:text-emerald-600 transition-colors"><RefreshCcw size={14} /></button>
                  </div>
                  <div className="space-y-4">
                    <AgePicker 
                      age={age} 
                      onAgeChange={(newAge) => setAge(newAge)} 
                      label="Umur Panen / Hari Ini" 
                    />
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Populasi Awal DOC</label>
                        <span className="text-[9px] font-black text-emerald-600 flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          ✓ Terkunci & Sinkron
                        </span>
                      </div>
                      <input 
                        type="number" 
                        value={initialPop} 
                        readOnly
                        placeholder="e.g. 10000"
                        className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg py-2 px-3 focus:outline-none text-lg font-black cursor-not-allowed" 
                      />
                      <p className="text-[9px] font-bold text-slate-400">
                        Disinkronkan otomatis dari Total Check-In DOC datang ({docCheckIns.reduce((sum, doc) => sum + doc.popCount, 0).toLocaleString()} ekor)
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Populasi Akhir</label>
                      <input 
                        type="number" 
                        value={currentPop} 
                        onChange={(e) => setCurrentPop(e.target.value)} 
                        placeholder="e.g. 9720"
                        className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Total Bobot Panen (kg)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={totalWeight} 
                          onChange={(e) => setTotalWeight(e.target.value)} 
                          placeholder={stats?.cumulativeWeight || "0"}
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black" 
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black uppercase tracking-tighter">
                          {totalWeight ? 'KG' : stats ? `AUTO: ${stats.cumulativeWeight} KG` : 'KG'}
                        </span>
                      </div>
                      {!totalWeight && stats && (
                        <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase tracking-tighter">
                          *BOBOT TOTAL BERDASARKAN POPULASI & RATA-RATA
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">Total Pakan Terpakai (kg)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={totalFeed} 
                          onChange={(e) => setTotalFeed(e.target.value)} 
                          placeholder={stats?.cumulativeFeed || "0"}
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black" 
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black uppercase tracking-tighter">
                          {totalFeed ? `≈ ${Math.round(parseFloat(totalFeed) / 50).toLocaleString()} SAK` : stats ? `AUTO: ${Math.round(stats.cumulativeFeedRaw / 50).toLocaleString()} SAK` : 'KG'}
                        </span>
                      </div>
                      {!totalFeed && stats && (
                        <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase tracking-tighter">
                          *MENGGUNAKAN DATA DARI RIWAYAT: {stats.cumulativeFeed} KG
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-auto space-y-3 pt-6 border-t border-slate-100">
                  <button 
                    onClick={saveRecord} 
                    disabled={!stats}
                    className={`w-full ${stats ? 'bg-slate-900 hover:bg-black active:scale-95 shadow-xl' : 'bg-slate-200 text-slate-400 cursor-not-allowed'} text-white font-black py-4 px-4 rounded-lg flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] transition-all`}
                  >
                    <Save size={14} /> Arsipkan Data Kumulatif
                  </button>
                  {!stats && (
                    <p className="text-[9px] text-center text-rose-500 font-bold uppercase tracking-tighter italic">
                      *DATA PENDUKUNG BELUM LENGKAP
                    </p>
                  )}
                </div>
              </section>

              <section className="flex-1 overflow-y-auto pr-1">
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-emerald-900 text-white rounded-xl p-8 flex flex-col justify-between relative overflow-hidden shadow-xl min-h-[220px]">
                      <div>
                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Indeks Performans (IP)</p>
                        <h3 className="text-8xl font-black tracking-tighter italic leading-none">{stats?.ip || '0'}</h3>
                      </div>
                      <div className="z-10 flex items-center justify-between gap-3 mt-6">
                        <span className="px-4 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black tracking-widest uppercase">
                          {stats?.ipStatus || '---'}
                        </span>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-tight">Rata-rata Bobot</p>
                          <p className="text-base font-black text-white">
                            {stats?.avgWeight ? parseInt(stats.avgWeight).toLocaleString() : '0'} <span className="text-[10px] font-medium text-emerald-300">gr</span>
                          </p>
                        </div>
                      </div>
                      <TrendingUp size={200} className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none transform rotate-12" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col justify-between shadow-sm min-h-[220px]">
                      <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Feed Conversion Ratio (FCR)</p>
                        <h3 className="text-8xl font-black tracking-tighter text-slate-800 leading-none">{stats?.fcr || '0.00'}</h3>
                      </div>
                      <div className="space-y-3 mt-6">
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${stats ? Math.min(100, (1.8 / parseFloat(stats.fcr)) * 80) : 0}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* IP Simulator Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6">
                    <div className="border-b border-slate-150 pb-3 flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Simulator Indeks Performans (IP)</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">Simulasikan target performa ternak Anda secara interaktif</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-wider">
                        Interactive Mode
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column: Sliders / Inputs */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Umur Panen (Hari)</label>
                            <span className="text-xs font-black text-slate-800">{simAge} Hari</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="50" 
                            value={simAge} 
                            onChange={(e) => setSimAge(e.target.value)} 
                            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                          />
                          <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                            <span>1 HARI</span>
                            <span>25 HARI</span>
                            <span>50 HARI</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Mortalitas / Kematian (%)</label>
                            <span className="text-xs font-black text-rose-600">{simMortality}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="30" 
                            step="0.1"
                            value={simMortality} 
                            onChange={(e) => setSimMortality(e.target.value)} 
                            className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                          />
                          <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                            <span>0% (EXCELLENT)</span>
                            <span>15%</span>
                            <span>30% (CRITICAL)</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Rata-rata Bobot Ayam (gram)</label>
                            <span className="text-xs font-black text-emerald-600">{simWeight} gr</span>
                          </div>
                          <input 
                            type="range" 
                            min="500" 
                            max="3500" 
                            step="10"
                            value={simWeight} 
                            onChange={(e) => setSimWeight(e.target.value)} 
                            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                          />
                          <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                            <span>500 GR</span>
                            <span>2,000 GR</span>
                            <span>3,500 GR</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Feed Conversion Ratio (FCR)</label>
                            <span className="text-xs font-black text-slate-800">{simFcr}</span>
                          </div>
                          <input 
                            type="range" 
                            min="1.0" 
                            max="2.5" 
                            step="0.01"
                            value={simFcr} 
                            onChange={(e) => setSimFcr(e.target.value)} 
                            className="w-full accent-slate-800 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                          />
                          <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                            <span>1.0 (BEST)</span>
                            <span>1.75</span>
                            <span>2.5 (POOR)</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Simulated IP Result */}
                      <div className="bg-slate-50 border border-slate-250/50 rounded-xl p-6 flex flex-col justify-between items-center text-center">
                        <div className="w-full">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Simulasi Skor IP</p>
                          <h5 className="text-6xl font-black tracking-tight text-emerald-700 italic leading-none my-2">{simulatedIp}</h5>
                          <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${simulatedIpStatus.color}`}>
                            {simulatedIpStatus.label}
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-slate-500 font-medium italic mt-4 max-w-xs leading-relaxed">
                          "{simulatedIpStatus.desc}"
                        </p>

                        <div className="w-full border-t border-slate-200 pt-3 mt-4 flex justify-around text-[8px] font-mono text-slate-400 font-bold uppercase tracking-tight">
                          <div>
                            <p>Formula Standar</p>
                            <p className="text-slate-600 mt-0.5">IP Broiler Coef. 100</p>
                          </div>
                          <div className="border-r border-slate-200"></div>
                          <div>
                            <p>Daya Hidup (SR)</p>
                            <p className="text-slate-600 mt-0.5">{(100 - parseFloat(simMortality || '0')).toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </section>
            </motion.div>
          ) : (view === 'harvest' || view === 'weighing') ? (
            <motion.div 
              key={view}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col md:flex-row p-6 gap-6 overflow-hidden"
            >
              {view === 'harvest' && (
                <section className="w-full md:w-60 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Beef size={15} className="text-emerald-600" />
                      <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Input Data Panen</h2>
                    </div>

                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-tight">Tanggal Panen</label>
                        <input 
                          type="date" 
                          value={harvestDate} 
                          onChange={(e) => setHarvestDate(e.target.value)} 
                          className="w-full border border-slate-200 rounded-lg py-1 px-2.5 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-bold text-slate-800" 
                        />
                      </div>
                      
                      <AgePicker 
                        age={harvestAge} 
                        onAgeChange={(newAge) => setHarvestAge(newAge)} 
                        label="Umur Panen (Hari)" 
                      />

                      <div className="space-y-1">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-tight">Jumlah Ekor Ayam</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={harvestBirds} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setHarvestBirds(val);
                              const b = parseFloat(val) || 0;
                              const aw = parseFloat(harvestAvgWeight) || 0;
                              const tw = parseFloat(harvestTotalWeight) || 0;
                              
                              if (b > 0) {
                                if (aw > 0) {
                                  setHarvestTotalWeight((b * aw).toFixed(2));
                                } else if (tw > 0) {
                                  setHarvestAvgWeight((tw / b).toFixed(3));
                                }
                              }
                            }} 
                            className={`w-full border border-slate-200 rounded-lg py-1 px-2.5 bg-slate-50/55 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono font-bold text-slate-800 tracking-tighter ${hasWeighings ? 'bg-slate-100/80 cursor-not-allowed opacity-80' : ''}`}
                            disabled={hasWeighings}
                          />
                          <span className="absolute right-2.5 top-1.5 text-slate-400 text-[8px] font-black uppercase">EKOR</span>
                        </div>
                        {hasWeighings && (
                          <p className="text-[7.5px] text-emerald-600 font-bold uppercase tracking-tight -mt-0.5">*Kunci: dihitung dari Lembar Timbang</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-tight">Total Berat Panen (kg)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            placeholder="0"
                            value={harvestTotalWeight} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setHarvestTotalWeight(val);
                              const b = parseFloat(harvestBirds) || 0;
                              const tw = parseFloat(val) || 0;
                              if (b > 0 && tw > 0) {
                                 setHarvestAvgWeight((tw / b).toFixed(3));
                              }
                            }} 
                            className={`w-full border border-slate-200 rounded-lg py-1 px-2.5 bg-slate-50/55 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono font-black text-slate-800 tracking-tighter ${hasWeighings ? 'bg-slate-100/80 cursor-not-allowed opacity-80' : ''}`}
                            disabled={hasWeighings}
                          />
                          <span className="absolute right-2.5 top-1.5 text-slate-400 text-[8px] font-black uppercase">KG</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-black text-rose-500 uppercase tracking-tight">Bobot Rata-rata (kg/ekor)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            placeholder="0"
                            value={harvestAvgWeight} 
                            step="0.001"
                            onChange={(e) => {
                              const val = e.target.value;
                              setHarvestAvgWeight(val);
                              const b = parseFloat(harvestBirds) || 0;
                              const aw = parseFloat(val) || 0;
                              if (b > 0 && aw > 0) {
                                setHarvestTotalWeight((b * aw).toFixed(2));
                              }
                            }} 
                            className={`w-full border border-slate-200 rounded-lg py-1 px-2.5 bg-slate-50/55 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono font-bold text-slate-800 tracking-tighter ${hasWeighings ? 'bg-slate-100/80 cursor-not-allowed opacity-80' : ''}`}
                            disabled={hasWeighings}
                          />
                          <span className="absolute right-2.5 top-1.5 text-slate-400 text-[8px] font-black uppercase">KG/EKR</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={saveHarvest}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer mt-2"
                    >
                      <Save size={12} /> Simpan Data Panen
                    </button>

                    <div className="border-t border-slate-100 pt-3 flex flex-col gap-1 text-[8.5px] text-slate-400 font-semibold leading-relaxed">
                      <p className="uppercase font-black text-slate-500">Petunjuk:</p>
                      <p>&bull; Klik <strong className="text-emerald-600">Data Timbang</strong> di tab atas untuk mengisi baris nota timbang secara detail.</p>
                      <p>&bull; Data panen akan otomatis terhitung dan tersinkronisasi dari Data Timbang jika terisi.</p>
                    </div>
                  </div>
                </section>
              )}
              <section className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                {/* Dynamic Title and Header Actions based on view */}
                <div className="px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sticky top-0 bg-white z-10">
                  {view === 'weighing' ? (
                    <>
                      <div className="flex items-center gap-2 shrink-0">
                        <Scale size={16} className="text-emerald-600" />
                        <h3 className="text-xs font-black text-slate-850 uppercase tracking-widest">Data Timbang Digital</h3>
                      </div>
                      
                      {/* Summary Table directly in the Header for the Weighing Sheet */}
                      <div className="hidden xl:flex items-center gap-1 p-1 bg-slate-50 border border-slate-200 rounded-lg max-w-xl text-[9px] font-mono leading-tight flex-1 mx-4">
                        {headerTableData.map((col, idx) => (
                          <div key={idx} className={`flex-1 px-1.5 py-0.5 text-center ${idx < 5 ? 'border-r border-slate-200' : ''}`}>
                            <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{col.name}</p>
                            <div className="flex flex-col font-bold">
                              <span className="text-slate-700 whitespace-nowrap">{col.birds || 0} ekr</span>
                              <span className="text-emerald-700 whitespace-nowrap">{col.weight ? `${col.weight.toFixed(2)} kg` : '-'}</span>
                            </div>
                          </div>
                        ))}
                        <div className="flex-1 px-1.5 py-0.5 text-center border-l-2 border-slate-300 bg-emerald-50/70 rounded">
                          <p className="text-[7.5px] font-black text-emerald-800 uppercase tracking-widest leading-none mb-0.5">TOTAL</p>
                          <div className="flex flex-col font-black">
                            <span className="text-slate-800 whitespace-nowrap">
                              {validActiveDrafts.reduce((sum, d) => sum + (parseInt(d.birds as any) || 0), 0)} Ekr
                            </span>
                            <span className="text-emerald-800 whitespace-nowrap">
                              {validActiveDrafts.reduce((sum, d) => sum + parseWeight(d.weight), 0).toFixed(2)} Kg
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {hasWeighings && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Hapus semua data nota timbang aktif?')) {
                                setActiveDrafts(Array.from({ length: 90 }, (_, i) => ({
                                  id: `draft-${i}`,
                                  birds: '',
                                  weight: ''
                                })));
                                setHarvestBirds('');
                                setHarvestTotalWeight('');
                                setHarvestAvgWeight('');
                              }
                            }}
                            className="flex items-center gap-1.5 transition-colors bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer"
                          >
                            <Trash2 size={11} /> Hapus Data Timbang
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const printContents = document.getElementById('print-only-weighing-sheet')?.innerHTML;
                            if (printContents) {
                              const printWindow = window.open('', '_blank');
                              if (printWindow) {
                                printWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>Cetak Lembar Timbang Panen</title>
                                      <script src="https://cdn.tailwindcss.com"></script>
                                      <style>
                                        body { padding: 40px; background: white; color: black; font-family: monospace; }
                                        input { border: none !important; border-bottom: 1px dashed #ccc !important; background: transparent !important; pointer-events: none; }
                                        input::placeholder { color: transparent; }
                                        button, .no-print { display: none !important; }
                                      </style>
                                    </head>
                                    <body>
                                      ${printContents}
                                    </body>
                                  </html>
                                `);
                                printWindow.document.close();
                                setTimeout(() => {
                                  printWindow.print();
                                  printWindow.close();
                                }, 500);
                              }
                            }
                          }}
                          className="flex items-center gap-1.5 transition-colors bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer"
                        >
                          <Printer size={11} /> Cetak Lembar Timbang
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 text-right">
                      <button 
                        type="button"
                        onClick={exportHarvestToCSV}
                        className="flex items-center gap-1.5 transition-colors bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest self-start"
                      >
                        <Download size={10} /> Export CSV
                      </button>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Total Ekor</p>
                          <p className="text-sm font-black text-slate-900">{harvestHistory.reduce((s, r) => s + r.birds, 0).toLocaleString()} <span className="text-[9px] text-slate-400 font-normal">EKOR</span></p>
                        </div>
                        <div className="flex flex-col pl-4 border-l border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Total Bobot</p>
                          <p className="text-sm font-black text-emerald-600">{harvestHistory.reduce((s, r) => s + r.totalWeight, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[9px] font-normal text-slate-400">KG</span></p>
                        </div>
                        {(() => {
                          const withWeighings = harvestHistory.filter(r => r.weighingDrafts && r.weighingDrafts.length > 0);
                          const ttlWeighingBirds = withWeighings.reduce((sum, r) => sum + (r.weighingDrafts?.reduce((s, d) => s + d.birds, 0) || 0), 0);
                          const ttlWeighingKg = withWeighings.reduce((sum, r) => sum + (r.weighingDrafts?.reduce((s, d) => s + d.weight, 0) || 0), 0);
                          
                          if (withWeighings.length > 0) {
                            return (
                              <div className="flex flex-col border-l border-slate-100 pl-4">
                                <p className="text-[8px] font-black text-blue-500 uppercase tracking-wider">Total Timbangan</p>
                                <p className="text-sm font-black text-blue-600">
                                  {ttlWeighingBirds.toLocaleString()} <span className="text-[9px] text-slate-400 font-bold">Ekor</span> / {ttlWeighingKg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[9px] font-bold text-slate-400">Kg</span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        })()}
                        <div className="flex flex-col border-l border-slate-100 pl-4">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Rerata Bobot</p>
                          <p className="text-xs font-black text-slate-900">
                            {(() => {
                              const totalB = harvestHistory.reduce((s, r) => s + r.birds, 0);
                              const totalW = harvestHistory.reduce((s, r) => s + r.totalWeight, 0);
                              return totalB > 0 ? (totalW / totalB).toFixed(3) : '0.000';
                            })()}
                            <span className="text-[8px] text-slate-400 ml-1 font-normal">KG</span>
                          </p>
                        </div>
                        <div className="flex flex-col border-l border-slate-100 pl-4">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Rerata Umur Panen</p>
                          <p className="text-xs font-black text-slate-900">
                            {harvestHistory.length > 0 ? (harvestHistory.reduce((s, r) => s + r.age, 0) / harvestHistory.length).toFixed(1) : '0'}
                            <span className="text-[8px] text-slate-400 ml-1 font-normal">HARI</span>
                          </p>
                        </div>
                        <div className="flex flex-col border-l border-slate-100 pl-4">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Rerata IP Panen</p>
                          <p className="text-xs font-black text-emerald-700">
                            {(() => {
                              const count = harvestHistory.length;
                              return count > 0 ? Math.round(harvestHistory.reduce((s, r) => s + r.ip, 0) / count).toLocaleString() : '0';
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {view === 'weighing' ? (
                  /* Interactive Paper Sheet Representation mimicking picture */
                  <div className="flex-1 overflow-auto bg-slate-50/50 p-6 scrollbar-thin">
                    <div 
                      id="print-only-weighing-sheet"
                      className="max-w-4xl mx-auto bg-white border border-slate-300 rounded-lg p-6 font-sans text-slate-800 shadow-md relative group/paper bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:16px_16px]"
                    >
                      {/* Paper Watermark Stamp style */}
                      <div className="absolute right-4 top-16 border-2 border-dashed border-emerald-600/20 text-emerald-600/20 px-4 py-1 rounded text-2xl font-black uppercase tracking-widest pointer-events-none select-none transform rotate-12">
                        Digital Twin
                      </div>

                      {/* Header Layout */}
                      <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-800 pb-4 mb-4 gap-4">
                        <div>
                          <div className="flex items-baseline gap-2 mb-1">
                            <h3 className="text-base font-black text-slate-900 tracking-wider">DATA TIMBANG NO :</h3>
                            <input 
                              type="text" 
                              value={dataTimbangNo} 
                              onChange={(e) => setDataTimbangNo(e.target.value)} 
                              placeholder="Tulis No Nota"
                              className="border-b-2 border-slate-300 focus:border-slate-800 bg-transparent text-sm font-mono font-black focus:outline-none w-44 px-1"
                            />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-black text-slate-500 tracking-wider">SPB NO :</span>
                            <input 
                              type="text" 
                              value={spbNo} 
                              onChange={(e) => setSpbNo(e.target.value)} 
                              placeholder="Tulis No SPB"
                              className="border-b border-slate-300 focus:border-slate-800 bg-transparent text-xs font-mono font-black focus:outline-none w-44 px-1"
                            />
                          </div>
                        </div>
                        
                        {/* Interactive Scale Totals Display on Paper */}
                        <div className="border border-slate-800 p-3 bg-white flex items-center gap-6 font-mono self-stretch md:self-auto rounded">
                          <div className="text-center border-r border-slate-200 pr-4">
                            <p className="text-[8px] font-black uppercase text-slate-450">Ekor (Total)</p>
                            <p className="text-sm font-black text-slate-900">
                              {validActiveDrafts.reduce((sum, d) => sum + (parseInt(d.birds as any) || 0), 0).toLocaleString()} <span className="text-[9px] font-normal text-slate-400">EKR</span>
                            </p>
                          </div>
                          <div className="text-center border-r border-slate-200 pr-4">
                            <p className="text-[8px] font-black uppercase text-slate-450">Berat (Total)</p>
                            <p className="text-sm font-black text-emerald-700">
                              {validActiveDrafts.reduce((sum, d) => sum + parseWeight(d.weight), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[9px] font-normal text-slate-400">KG</span>
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-[8px] font-black uppercase text-slate-450">Rata-rata (kg)</p>
                            <p className="text-sm font-black text-rose-700">
                              {(() => {
                                const totalB = validActiveDrafts.reduce((sum, d) => sum + (parseInt(d.birds as any) || 0), 0);
                                const totalW = validActiveDrafts.reduce((sum, d) => sum + parseWeight(d.weight), 0);
                                return totalB > 0 ? (totalW / totalB).toFixed(3) : '0.000';
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Metadata Form Fields Mimicking Photo layout */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-300 p-4 bg-slate-50/20 rounded-md mb-6 text-[11px]">
                        {/* Left Info Column */}
                        <div className="space-y-2 border-r-0 md:border-r border-slate-200 md:pr-4">
                          <div className="flex items-center gap-2">
                            <span className="w-24 font-black text-slate-500 uppercase">Tanggal :</span>
                            <input 
                              type="date" 
                              value={harvestDate} 
                              onChange={(e) => setHarvestDate(e.target.value)} 
                              className="bg-transparent font-black text-slate-850 border-none p-0 focus:ring-0 focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-24 font-black text-slate-500 uppercase">Jam Tiba :</span>
                            <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                              <Clock size={11} className="text-slate-400" />
                              <input 
                                type="text" 
                                value={timeArrived} 
                                onChange={(e) => setTimeArrived(e.target.value)} 
                                placeholder="08:30"
                                className="flex-1 bg-transparent border-b border-dashed border-slate-300 font-mono font-black py-0.5 focus:border-slate-500 focus:ring-0 focus:outline-none text-slate-800"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-24 font-black text-slate-500 uppercase">Jam Muat :</span>
                            <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                              <Clock size={11} className="text-slate-400" />
                              <input 
                                type="text" 
                                value={timeLoaded} 
                                onChange={(e) => setTimeLoaded(e.target.value)} 
                                placeholder="09:15"
                                className="flex-1 bg-transparent border-b border-dashed border-slate-300 font-mono font-black py-0.5 focus:border-slate-500 focus:ring-0 focus:outline-none text-slate-800"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-24 font-black text-slate-500 uppercase">Jam Selesai :</span>
                            <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                              <Clock size={11} className="text-slate-400" />
                              <input 
                                type="text" 
                                value={timeCompleted} 
                                onChange={(e) => setTimeCompleted(e.target.value)} 
                                placeholder="11:45"
                                className="flex-1 bg-transparent border-b border-dashed border-slate-300 font-mono font-black py-0.5 focus:border-slate-500 focus:ring-0 focus:outline-none text-slate-800"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Right Info Column */}
                        <div className="space-y-2 md:pl-4">
                          <div className="flex items-center gap-2">
                            <span className="w-28 font-black text-slate-500 uppercase">Diambil Oleh :</span>
                            <input 
                              type="text" 
                              value={takenBy} 
                              onChange={(e) => setTakenBy(e.target.value)} 
                              placeholder="Nama Pembeli / Broker"
                              className="flex-1 bg-transparent border-b border-dashed border-slate-300 font-black text-slate-850 py-0.5 focus:border-slate-500 focus:ring-0 focus:outline-none text-slate-800"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-28 font-black text-slate-500 uppercase">Nama Sopir :</span>
                            <input 
                              type="text" 
                              value={driverName} 
                              onChange={(e) => setDriverName(e.target.value)} 
                              placeholder="Tulis nama sopir"
                              className="flex-1 bg-transparent border-b border-dashed border-slate-300 font-black text-slate-850 py-0.5 focus:border-slate-500 focus:ring-0 focus:outline-none text-slate-800"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-28 font-black text-slate-500 uppercase">No. Polisi :</span>
                            <input 
                              type="text" 
                              value={plateNo} 
                              onChange={(e) => setPlateNo(e.target.value)} 
                              placeholder="AD 8741 XY"
                              className="bg-transparent border-b border-dashed border-slate-300 font-mono font-black w-36 py-0.5 text-slate-850 focus:border-slate-500 focus:ring-0 focus:outline-none text-slate-800"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-28 font-black text-slate-500 uppercase">No. SIM :</span>
                            <input 
                              type="text" 
                              value={driverSim} 
                              onChange={(e) => setDriverSim(e.target.value)} 
                              placeholder="Tulis SIM Sopir"
                              className="bg-transparent border-b border-dashed border-slate-300 font-mono font-black w-36 py-0.5 text-slate-850 focus:border-slate-500 focus:ring-0 focus:outline-none text-slate-800"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-28 font-black text-slate-500 uppercase">No. STNK :</span>
                            <input 
                              type="text" 
                              value={stnkNo} 
                              onChange={(e) => setStnkNo(e.target.value)} 
                              placeholder="Tulis STNK Kendaraan"
                              className="bg-transparent border-b border-dashed border-slate-300 font-mono font-black w-36 py-0.5 text-slate-850 focus:border-slate-500 focus:ring-0 focus:outline-none text-slate-800"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Giant Weighing Grid Table */}
                      <div className="overflow-x-auto border-2 border-slate-850 rounded">
                        <table className="w-full min-w-[950px] border-collapse text-center font-mono text-xs bg-white">
                          <thead>
                            <tr className="bg-slate-100 border-b-2 border-slate-800 text-[11px]">
                              <th className="py-3 px-1 border-r-2 border-slate-800 font-black text-center w-10 bg-slate-100" rowSpan={2}>No</th>
                              <th className="py-1.5 border-r-2 border-slate-800 text-center uppercase font-black text-xs" colSpan={2}>Kolom Timbang 1</th>
                              <th className="py-1.5 border-r-2 border-slate-800 text-center uppercase font-black text-xs" colSpan={2}>Kolom Timbang 2</th>
                              <th className="py-1.5 border-r-2 border-slate-800 text-center uppercase font-black text-xs" colSpan={2}>Kolom Timbang 3</th>
                              <th className="py-1.5 border-r-2 border-slate-800 text-center uppercase font-black text-xs" colSpan={2}>Kolom Timbang 4</th>
                              <th className="py-1.5 border-r-2 border-slate-800 text-center uppercase font-black text-xs" colSpan={2}>Kolom Timbang 5</th>
                              <th className="py-1.5 border-slate-800 text-center uppercase font-black text-xs" colSpan={2}>Kolom Timbang 6</th>
                            </tr>
                            <tr className="bg-slate-50 border-b-2 border-slate-800 text-[10px] font-black">
                              <th className="py-1.5 border-r border-slate-300 w-[7%]">Ekr</th>
                              <th className="py-1.5 border-r-2 border-slate-800 w-[9%] text-emerald-800">Kg (Net)</th>
                              <th className="py-1.5 border-r border-slate-300 w-[7%]">Ekr</th>
                              <th className="py-1.5 border-r-2 border-slate-800 w-[9%] text-emerald-800">Kg (Net)</th>
                              <th className="py-1.5 border-r border-slate-300 w-[7%]">Ekr</th>
                              <th className="py-1.5 border-r-2 border-slate-800 w-[9%] text-emerald-800">Kg (Net)</th>
                              <th className="py-1.5 border-r border-slate-300 w-[7%]">Ekr</th>
                              <th className="py-1.5 border-r-2 border-slate-800 w-[9%] text-emerald-800">Kg (Net)</th>
                              <th className="py-1.5 border-r border-slate-300 w-[7%]">Ekr</th>
                              <th className="py-1.5 border-r-2 border-slate-800 w-[9%] text-emerald-800">Kg (Net)</th>
                              <th className="py-1.5 border-r border-slate-300 w-[7%]">Ekr</th>
                              <th className="py-1.5 border-slate-800 w-[9%] text-emerald-800">Kg (Net)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: 15 }).map((_, r) => (
                              <tr key={r} className="border-b border-slate-200 hover:bg-slate-50/70">
                                <td className="py-1 border-r-2 border-slate-800 font-black bg-slate-50/50 text-slate-500 font-mono text-[10px]">{r + 1}</td>
                                {Array.from({ length: 6 }).map((_, c) => {
                                  const idx = c * 15 + r;
                                  const draft = activeDrafts[idx];
                                  return (
                                    <React.Fragment key={c}>
                                      {/* Ekr Cell */}
                                      <td className="p-0 border-r border-slate-200 col-ekor">
                                        <input 
                                          type="number"
                                          value={draft?.birds === 0 || draft?.birds === '' ? '' : draft?.birds}
                                          onChange={(e) => handleCellChange(idx, 'birds', e.target.value)}
                                          placeholder="-"
                                          className="w-full bg-transparent border-none text-center font-bold font-mono text-[13px] md:text-sm py-2 px-1 focus:bg-amber-50 focus:ring-1 focus:ring-amber-300 focus:outline-none cursor-pointer"
                                        />
                                      </td>
                                      {/* Kg Cell */}
                                      <td className={`p-0 ${c < 5 ? 'border-r-2 border-slate-800' : ''} col-kg`}>
                                        <input 
                                          type="text"
                                          inputMode="decimal"
                                          value={draft?.weight === 0 || draft?.weight === '' ? '' : draft?.weight}
                                          onChange={(e) => handleCellChange(idx, 'weight', e.target.value)}
                                          placeholder="-"
                                          className="w-full bg-transparent border-none text-center font-mono font-black text-emerald-700 text-[13px] md:text-sm py-2 px-1 focus:bg-amber-50 focus:ring-1 focus:ring-amber-300 focus:outline-none cursor-pointer"
                                        />
                                      </td>
                                    </React.Fragment>
                                  );
                                })}
                              </tr>
                            ))}
                            {/* Programmatic Totals Row per Column pair */}
                            <tr className="bg-slate-100 border-t-2 border-slate-800 font-black text-xs">
                              <td className="py-2.5 border-r-2 border-slate-800 font-black uppercase text-center bg-slate-100">TTL</td>
                              {Array.from({ length: 6 }).map((_, c) => {
                                const colDrafts = activeDrafts.slice(c * 15, (c + 1) * 15);
                                const validColDrafts = colDrafts.filter(d => (parseInt(d.birds as any) || 0) > 0 && parseWeight(d.weight) > 0);
                                const totalCColBirds = validColDrafts.reduce((sum, d) => sum + (parseInt(d.birds as any) || 0), 0);
                                const totalCColWeight = validColDrafts.reduce((sum, d) => sum + parseWeight(d.weight), 0);
                                return (
                                  <React.Fragment key={c}>
                                    <td className="py-2.5 border-r border-slate-200 bg-slate-100/50 text-slate-800 font-black text-[12px]">{totalCColBirds || '-'}</td>
                                    <td className={`py-2.5 ${c < 5 ? 'border-r-2 border-slate-800' : ''} bg-slate-100/50 text-emerald-700 font-black font-mono text-[12px]`}>
                                      {totalCColWeight ? totalCColWeight.toFixed(2) : '-'}
                                    </td>
                                  </React.Fragment>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Paper footer block mimicking driver, farm rep and receiver signature spots */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-4 border-t border-slate-350 text-[10px] bg-slate-50/50 p-4 rounded border border-slate-200">
                        {/* Diambil Oleh Column */}
                        <div className="flex flex-col justify-between h-36 border-b md:border-b-0 pb-4 md:pb-0 text-center md:border-r border-slate-200 md:pr-4">
                          <div className="space-y-1">
                            <p className="font-black text-slate-700 uppercase tracking-wide">Diambil Oleh :</p>
                            <span className="text-[9px] font-bold text-slate-400 block italic leading-tight">Merah: Pengambilan barang / Customer</span>
                          </div>
                          <div className="space-y-1 bg-white p-2 rounded border border-slate-200/50">
                            <div className="flex justify-center items-center gap-1.5">
                              <span className="text-slate-450 font-bold uppercase text-[7.5px]">Nama:</span>
                              <input 
                                type="text" 
                                value={diambilNama} 
                                onChange={(e) => setDiambilNama(e.target.value)} 
                                placeholder="Nama Sopir/Kernet"
                                className="border-b border-dashed border-slate-300 bg-transparent text-center font-bold text-xs focus:outline-none w-32 text-slate-800 py-0.5 opacity-90"
                              />
                            </div>
                            <div className="flex justify-center items-center gap-1.5">
                              <span className="text-slate-450 font-bold uppercase text-[7.5px]">Tgl/Jam:</span>
                              <input 
                                type="text" 
                                value={diambilTgl} 
                                onChange={(e) => setDiambilTgl(e.target.value)} 
                                placeholder="Tanggal"
                                className="border-b border-dashed border-slate-300 bg-transparent text-center font-mono focus:outline-none w-32 text-slate-800 py-0.5 text-[10px]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Check Security Column */}
                        <div className="flex flex-col justify-between h-36 text-center">
                          <div className="space-y-1">
                            <p className="font-black text-slate-700 uppercase tracking-wide">Check / Security :</p>
                            <span className="text-[9px] font-bold text-slate-400 block italic leading-tight">Kuning: Pemberi barang / Farm</span>
                          </div>
                          <div className="space-y-1 bg-white p-2 rounded border border-slate-200/50">
                            <div className="flex justify-center items-center gap-1.5">
                              <span className="text-slate-450 font-bold uppercase text-[7.5px]">Nama:</span>
                              <input 
                                type="text" 
                                value={securityNama} 
                                onChange={(e) => setSecurityNama(e.target.value)} 
                                placeholder="Check / Security"
                                className="border-b border-dashed border-slate-300 bg-transparent text-center font-bold text-xs focus:outline-none w-32 text-slate-800 py-0.5"
                              />
                            </div>
                            <div className="flex justify-center items-center gap-1.5">
                              <span className="text-slate-450 font-bold uppercase text-[7.5px]">Tgl/Jam:</span>
                              <input 
                                type="text" 
                                value={securityTgl} 
                                onChange={(e) => setSecurityTgl(e.target.value)} 
                                placeholder="Tanggal"
                                className="border-b border-dashed border-slate-300 bg-transparent text-center font-mono focus:outline-none w-32 text-slate-800 py-0.5 text-[10px]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Original Harvest History Table and Logs */
                  <>
                    <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                      <div className="min-w-[1000px] w-full">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50 text-[9px] uppercase font-black tracking-widest text-slate-400 sticky top-0 z-20 shadow-sm">
                            <tr>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50 w-12 text-center">No</th>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Tanggal</th>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Umur</th>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Jumlah Ekor</th>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Rata-rata Bobot</th>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Total Bobot (kg)</th>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50 font-black text-emerald-600">IP PANEN</th>
                              <th className="py-4 px-6 border-b border-slate-100 bg-slate-50 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm font-bold text-slate-600">
                            {harvestHistory.map((record, idx) => {
                              return (
                                <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                  <td className="py-4 px-6 text-center text-slate-400 font-mono text-[10px]">
                                    {harvestHistory.length - idx}
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                      <Calendar size={12} className="text-slate-400" />
                                      {record.date}
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">{record.age} <span className="text-[9px]">hari</span></td>
                                  <td className="py-4 px-6">
                                    <span className="text-slate-900 font-black">{record.birds.toLocaleString()} <span className="text-[9px] font-normal text-slate-400">ekor</span></span>
                                  </td>
                                  <td className="py-4 px-6">{record.avgWeight.toFixed(3)} <span className="text-[9px]">kg/ekor</span></td>
                                  <td className="py-4 px-6 text-slate-600">{record.totalWeight.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[9px]">kg</span></td>
                                  <td className="py-4 px-6">
                                     <div className="flex flex-col">
                                       <span className="text-emerald-700 font-black text-lg">{Math.round(record.ip).toLocaleString()}</span>
                                       <span className="text-[8px] font-black uppercase text-slate-400 -mt-1">
                                         {record.ip >= 400 ? 'PREMIUM' : record.ip >= 350 ? 'EXCELLENT' : record.ip >= 300 ? 'STANDARD' : 'UNDER'}
                                       </span>
                                     </div>
                                  </td>
                                  <td className="py-4 px-6 text-right">
                                    <button 
                                      type="button"
                                      onClick={() => deleteHarvestRecord(record.id)}
                                      className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                            {harvestHistory.length === 0 && (
                              <tr>
                                <td colSpan={8} className="py-20 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">
                                  Belum ada data panen
                                </td>
                              </tr>
                            )}
                          </tbody>
                          {harvestHistory.length > 0 && (
                            <tfoot className="bg-slate-100/90 text-slate-900 border-t-2 border-slate-300 font-black text-xs sticky bottom-0 z-20">
                              <tr className="bg-slate-50/90 border-t border-slate-200">
                                <td className="py-4 px-6 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]">TOTAL / RATA2</td>
                                <td className="py-4 px-6"></td>
                                <td className="py-4 px-6 text-slate-900 font-black">
                                  {(() => {
                                    const count = harvestHistory.length;
                                    return count > 0 ? (harvestHistory.reduce((sum, r) => sum + r.age, 0) / count).toFixed(1) : '0';
                                  })()} <span className="text-[10px] text-slate-500 font-normal">hari</span>
                                </td>
                                <td className="py-4 px-6">
                                  <span className="text-slate-900 font-black">
                                    {harvestHistory.reduce((sum, r) => sum + r.birds, 0).toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">ekor</span>
                                  </span>
                                </td>
                                <td className="py-4 px-6 font-mono text-slate-800">
                                  {(() => {
                                    const totalB = harvestHistory.reduce((sum, r) => sum + r.birds, 0);
                                    const totalW = harvestHistory.reduce((sum, r) => sum + r.totalWeight, 0);
                                    return totalB > 0 ? (totalW / totalB).toFixed(3) : '0.000';
                                  })()} <span className="text-[10px] text-slate-500 font-normal">kg/ekor</span>
                                </td>
                                <td className="py-4 px-6 font-mono text-slate-900">
                                  {harvestHistory.reduce((sum, r) => sum + r.totalWeight, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] text-slate-500 font-normal">kg</span>
                                </td>
                                <td className="py-4 px-6 text-emerald-700 font-black text-sm">
                                  {(() => {
                                    const count = harvestHistory.length;
                                    return count > 0 ? Math.round(harvestHistory.reduce((sum, r) => sum + r.ip, 0) / count).toLocaleString() : '0';
                                  })()}
                                </td>
                                <td className="py-4 px-6"></td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </section>
            </motion.div>
          ) : view === 'inventory' ? (
            <motion.div 
              key="inventory"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full flex flex-col md:flex-row p-6 gap-6 overflow-hidden text-slate-800"
            >
              {/* Left Column: Data Entry Sidebar */}
              <section className="w-full md:w-80 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-5 overflow-y-auto shrink-0">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Package className="text-emerald-600" size={18} />
                  <div>
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Pencatatan Logistik</h2>
                    <p className="text-[9px] text-slate-450 font-bold uppercase tracking-tighter mt-0.5">Pakan &amp; Kebutuhan Siklus</p>
                  </div>
                </div>

                {/* Sub Tab selection */}
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setInventoryActiveTab('pakan')}
                    className={`py-2 rounded-md text-[10px] font-black uppercase text-center cursor-pointer transition-all ${inventoryActiveTab === 'pakan' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Stok Pakan
                  </button>
                  <button
                    type="button"
                    onClick={() => setInventoryActiveTab('doc')}
                    className={`py-2 rounded-md text-[10px] font-black uppercase text-center cursor-pointer transition-all ${inventoryActiveTab === 'doc' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Check-In DOC
                  </button>
                </div>

                {inventoryActiveTab === 'pakan' ? (
                  /* Form Input Transaksi Pakan */
                  <form onSubmit={handleAddFeedTransaction} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-tight">Tanggal Transaksi</label>
                      <input 
                        type="date" 
                        value={feedDate} 
                        onChange={(e) => setFeedDate(e.target.value)} 
                        className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold font-mono cursor-pointer" 
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-tight">Tipe Aliran Stok</label>
                      <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg">
                        <button 
                          type="button" 
                          onClick={() => setFeedTypeAction('masuk')} 
                          className={`py-1.5 rounded-md text-[9px] font-black uppercase text-center cursor-pointer transition-all ${feedTypeAction === 'masuk' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          📥 Masuk
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setFeedTypeAction('keluar')} 
                          className={`py-1.5 rounded-md text-[9px] font-black uppercase text-center cursor-pointer transition-all ${feedTypeAction === 'keluar' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          📤 Keluar
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-tight">Jumlah Karung (SAK)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="any"
                          value={feedQty} 
                          onChange={(e) => setFeedQty(e.target.value)} 
                          placeholder="Contoh: 40"
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-black" 
                          required
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black uppercase">SAK</span>
                      </div>
                      {feedQty && (
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">
                          *Setara dengan {(parseFloat(feedQty) * 50 || 0).toLocaleString()} kg pakan (50kg/sak)
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-tight">Jenis / Merek Pakan</label>
                      <select 
                        value={feedBrand} 
                        onChange={(e) => setFeedBrand(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold bg-white"
                      >
                        <option value="8201">8201 (Awal Siklus)</option>
                        <option value="811">811 (Pertengahan)</option>
                        <option value="9203">9203 (Panen)</option>
                        <option value="Pakan Alternatif">Pakan Alternatif / Campuran</option>
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3.5 bg-slate-900 hover:bg-black active:scale-95 transition-all text-white font-black text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Plus size={13} /> Simpan Transaksi Pakan
                    </button>
                  </form>
                ) : (
                  /* Form Input Check-In DOC */
                  <form onSubmit={handleAddDocCheckIn} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-tight">Tanggal Log Datang</label>
                      <input 
                        type="date" 
                        value={docDate} 
                        onChange={(e) => setDocDate(e.target.value)} 
                        className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold font-mono cursor-pointer" 
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-tight">Jumlah Box Datang</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={docBoxes} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setDocBoxes(val);
                            const valInt = parseInt(val) || 0;
                            setDocPop((valInt * 102).toString()); // standard 100 + 2 bonus per box
                          }} 
                          placeholder="Contoh: 100"
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-black" 
                          required
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black uppercase">BOX</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-tight">Total Populasi (Ekor)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={docPop} 
                          onChange={(e) => setDocPop(e.target.value)} 
                          placeholder="e.g. 10200"
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-black" 
                          required
                        />
                        <span className="absolute right-3 top-2.5 text-emerald-650 text-[9px] font-black uppercase bg-emerald-55 border border-emerald-100 px-1.5 py-0.5 rounded">AUTO: BOX * 102</span>
                      </div>
                      <p className="text-[8.5px] text-slate-400 font-bold leading-tight uppercase">
                        *Menghitung standar ekstra bonus 2 ekor per box (Total 102 ekor per Box bawaan hatchery).
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-tight">Rerata Berat DOC (gram)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.1"
                          value={docWeight} 
                          onChange={(e) => setDocWeight(e.target.value)} 
                          placeholder="Contoh: 41.2"
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-black" 
                          required
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-black uppercase">GRAM</span>
                      </div>
                      <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-tighter">
                        *Kisaran sehat standar: 38g - 43g per ekor
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-tight">Hatchery / Perusahaan Supplier</label>
                      <select 
                        value={docSupplier} 
                        onChange={(e) => setDocSupplier(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold bg-white"
                      >
                        <option value="PT. Japfa Comfeed">PT. Japfa Comfeed (MB-202)</option>
                        <option value="PT. Charoen Pokphand">PT. Charoen Pokphand (CP-707)</option>
                        <option value="PT. Malindo Feedmill">PT. Malindo Feedmill</option>
                        <option value="PT. Sierad Produce">PT. Sierad Produce</option>
                        <option value="PT. Wonokoyo Jaya">PT. Wonokoyo Jaya Corporindo</option>
                        <option value="Kemitraan Mandiri">Suplier Mandiri / Lokal</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-tight">Kondisi Fisik DOC</label>
                      <select 
                        value={docCondition} 
                        onChange={(e) => setDocCondition(e.target.value as any)}
                        className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold bg-white"
                      >
                        <option value="Sangat Baik">Sangat Baik (Aktif, Bersih, Seragam)</option>
                        <option value="Baik">Baik (Lincah sehat)</option>
                        <option value="Kurang Baik">Kurang Baik (Beberapa Lesu/Cacat)</option>
                        <option value="Buruk">Buruk (Dehidrasi Tinggi/Kedinginan)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-tight">Catatan Kelompok DOC</label>
                      <textarea 
                        value={docNotes} 
                        onChange={(e) => setDocNotes(e.target.value)} 
                        placeholder="Tulis kode box hatchery, jam muatan tiba dsb..."
                        rows={2}
                        className="w-full border border-slate-300 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium" 
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3.5 bg-slate-900 hover:bg-black active:scale-95 transition-all text-white font-black text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Truck size={13} /> Catat Check-in DOC
                    </button>
                  </form>
                )}
              </section>

              {/* Right Column: Dashboard Stats and Tabbed Tables */}
              <section className="flex-1 overflow-hidden flex flex-col gap-6">
                
                {/* 4 Block Stats Dashboard Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 shrink-0">
                  
                  {/* Stock Balance Card */}
                  <div className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between ${feedStockStats.balance < 50 ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Package size={14} className={feedStockStats.balance < 50 ? 'text-rose-600' : 'text-emerald-500'} /> Stok Pakan Aktif
                      </span>
                      {feedStockStats.balance < 50 && (
                        <span className="px-1.5 py-0.5 text-[8px] font-black bg-rose-200 text-rose-800 rounded animate-pulse">
                          MINIMAL!
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-black italic tracking-tight ${feedStockStats.balance < 50 ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {feedStockStats.balance.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-black text-slate-500 uppercase">SAK</span>
                      </div>
                      <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase">
                        Tonase: <span className="font-mono text-slate-800 font-extrabold">{feedStockStats.balanceKg.toLocaleString()}</span> KG
                      </p>
                    </div>
                  </div>

                  {/* Feed Receipts Cargo Card */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <ArrowUpRight size={14} className="text-emerald-600" /> Total Pakan Masuk
                      </span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-800 italic tracking-tight">
                          {feedStockStats.totalIn.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-black text-slate-500 uppercase">SAK</span>
                      </div>
                      <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase">
                        Siklus Ini: <span className="font-mono text-slate-800 font-extrabold">{(feedStockStats.totalIn * 50).toLocaleString()}</span> KG
                      </p>
                    </div>
                  </div>

                  {/* Feed Outbound Usage Card */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Download size={14} className="text-rose-500" /> Total Pakan Keluar
                      </span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-800 italic tracking-tight">
                          {feedStockStats.totalOut.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-black text-slate-500 uppercase">SAK</span>
                      </div>
                      <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase">
                        Konsumsi/Susut: <span className="font-mono text-slate-800 font-extrabold">{(feedStockStats.totalOut * 50).toLocaleString()}</span> KG
                      </p>
                    </div>
                  </div>

                  {/* Latest DOC Info */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Truck size={14} className="text-blue-500" /> Profil DOC Terakhir
                      </span>
                    </div>
                    <div>
                      {latestDocCheckIn ? (
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-slate-800 tracking-tight block truncate max-w-[150px]">
                              {latestDocCheckIn.popCount.toLocaleString()}
                            </span>
                            <span className="text-[9px] font-black text-slate-500 uppercase">Ekor</span>
                          </div>
                          <p className="text-[9px] font-black text-slate-650 uppercase truncate mt-1">
                            {latestDocCheckIn.supplier} ({latestDocCheckIn.weightAvg}g)
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 font-bold italic py-1">Belum ada Log DOC</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Sub Tabulated Datatable Container */}
                <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden mb-1">
                  
                  {/* Table Header Controls */}
                  <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 gap-4">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => setInventoryActiveTab('pakan')}
                        className={`text-[10px] font-black uppercase tracking-[0.15em] pb-1 border-b-2 hover:text-slate-900 transition-colors cursor-pointer ${inventoryActiveTab === 'pakan' ? 'border-emerald-500 text-slate-900' : 'border-transparent text-slate-400'}`}
                      >
                        LOG ALIRAN PAKAN
                      </button>
                      <button
                        onClick={() => setInventoryActiveTab('doc')}
                        className={`text-[10px] font-black uppercase tracking-[0.15em] pb-1 border-b-2 hover:text-slate-900 transition-colors cursor-pointer ${inventoryActiveTab === 'doc' ? 'border-emerald-500 text-slate-900' : 'border-transparent text-slate-400'}`}
                      >
                        LOG DATANG DOC
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (confirm('Apakah Anda yakin ingin menghapus semua rekam logistik pakan & DOC?')) {
                            setFeedTransactions([]);
                            setDocCheckIns([]);
                            localStorage.removeItem('broiler_feed_transactions');
                            localStorage.removeItem('broiler_doc_checkins');
                            alert('Semua data logistik di-reset.');
                          }
                        }}
                        className="text-[10px] font-black text-rose-600 border border-rose-100 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        CLEAR ALL LOGS
                      </button>
                      <button
                        onClick={() => {
                          let csvContent = "data:text/csv;charset=utf-8,";
                          if (inventoryActiveTab === 'pakan') {
                            csvContent += "ID,Tanggal,Tipe,Sack,Kg,Merek Pakan,No Surat Jalan,Catatan\n";
                            feedTransactions.forEach(tx => {
                              csvContent += `"${tx.id}","${tx.date}","${tx.type}","${tx.quantity}","${tx.quantity * 50}","${tx.feedType}","${tx.docNo || ''}","${tx.notes || ''}"\n`;
                            });
                          } else {
                            csvContent += "ID,Tanggal,Jumlah Box,Jumlah Ekor,Berat Rerata DOC (g),Hatchery/Supplier,Kondisi,Catatan\n";
                            docCheckIns.forEach(doc => {
                              csvContent += `"${doc.id}","${doc.date}","${doc.boxCount}","${doc.popCount}","${doc.weightAvg}","${doc.supplier}","${doc.condition}","${doc.notes || ''}"\n`;
                            });
                          }
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement("a");
                          link.setAttribute("href", encodedUri);
                          link.setAttribute("download", inventoryActiveTab === 'pakan' ? "Erfours_Log_Pakan.csv" : "Erfours_Log_DOC.csv");
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="text-[10px] font-black text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Download size={12} /> EXPORT CSV
                      </button>
                    </div>
                  </div>

                  {/* Responsive Scrollable Container */}
                  <div className="flex-1 overflow-y-auto">
                    {inventoryActiveTab === 'pakan' ? (
                      /* Feed Stock Actions Table */
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-[9px] uppercase font-black tracking-widest text-slate-400 sticky top-0 z-20 shadow-sm border-b border-slate-50">
                          <tr>
                            <th className="py-4 px-6 w-12 text-center bg-slate-50/50">No</th>
                            <th className="py-4 px-6 bg-slate-50/50">Tanggal</th>
                            <th className="py-4 px-6 text-center bg-slate-50/50">Aliran</th>
                            <th className="py-4 px-6 text-emerald-700 bg-slate-50/50">Stok (SAK)</th>
                            <th className="py-4 px-6 bg-slate-50/50">Bobot (KG)</th>
                            <th className="py-4 px-6 bg-slate-50/50">Merek/Jenis Pakan</th>
                            <th className="py-4 px-6 text-right bg-slate-50/50">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-bold text-slate-650">
                          {feedTransactions.map((tx, idx) => (
                            <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                              <td className="py-3.5 px-6 text-center text-slate-400 font-mono text-[10px]">
                                {feedTransactions.length - idx}
                              </td>
                              <td className="py-3.5 px-6">
                                <span className="font-mono text-slate-900 block">{format(new Date(tx.date), 'dd MMM yyyy')}</span>
                              </td>
                              <td className="py-3.5 px-6 text-center">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase inline-block text-center ${tx.type === 'masuk' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                                  {tx.type === 'masuk' ? '📥 RESTOCK' : '📤 KONSUMSI'}
                                </span>
                              </td>
                              <td className="py-3.5 px-6 text-slate-900 font-extrabold text-[13px]">
                                {tx.quantity.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })} Sak
                              </td>
                              <td className="py-3.5 px-6 font-mono text-slate-600">
                                {(tx.quantity * 50).toLocaleString()} kg
                              </td>
                              <td className="py-3.5 px-6 text-slate-800">{tx.feedType}</td>
                              <td className="py-3.5 px-6 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFeedTransaction(tx.id)}
                                  className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors hover:bg-rose-50 rounded"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {feedTransactions.length === 0 && (
                            <tr>
                              <td colSpan={7} className="py-20 text-center text-slate-400 font-bold uppercase tracking-wider text-[10px] italic">
                                Belum ada log transaksi pakan masuk maupun keluar
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    ) : (
                      /* DOC Arrival Logistics log table */
                      <table className="w-full text-left border-collapse border-slate-50">
                        <thead className="bg-slate-50 text-[9px] uppercase font-black tracking-widest text-slate-400 sticky top-0 z-20 shadow-sm">
                          <tr>
                            <th className="py-4 px-6 w-12 text-center">No</th>
                            <th className="py-4 px-6">Tanggal Tiba</th>
                            <th className="py-4 px-6 text-blue-700">Hatchery / Asal</th>
                            <th className="py-4 px-6">Bawaan (Box)</th>
                            <th className="py-4 px-6">Total Populasi</th>
                            <th className="py-4 px-6">Rerata Berat DOC</th>
                            <th className="py-4 px-6">Kondisi Fisik</th>
                            <th className="py-4 px-6">Catatan</th>
                            <th className="py-4 px-6 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-bold text-slate-650">
                          {docCheckIns.map((doc, idx) => (
                            <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                              <td className="py-3.5 px-6 text-center text-slate-400 font-mono text-[10px]">
                                {docCheckIns.length - idx}
                              </td>
                              <td className="py-3.5 px-6">
                                <span className="font-mono text-slate-900">{format(new Date(doc.date), 'dd MMM yyyy')}</span>
                              </td>
                              <td className="py-3.5 px-6 text-blue-800 font-bold">{doc.supplier}</td>
                              <td className="py-3.5 px-6 font-mono text-slate-600">{doc.boxCount} Box</td>
                              <td className="py-3.5 px-6 text-slate-900 font-extrabold text-[13px]">
                                {doc.popCount.toLocaleString()} <span className="text-[9px] font-normal text-slate-400">ekor</span>
                              </td>
                              <td className="py-3.5 px-6 font-mono text-slate-700">{doc.weightAvg} gr/bird</td>
                              <td className="py-3.5 px-6">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase inline-block text-center ${
                                  doc.condition === 'Sangat Baik' ? 'bg-emerald-100 text-emerald-800' :
                                  doc.condition === 'Baik' ? 'bg-teal-100 text-teal-800' :
                                  doc.condition === 'Kurang Baik' ? 'bg-amber-100 text-amber-800' :
                                  'bg-rose-100 text-rose-800 font-mono'
                                }`}>
                                  {doc.condition}
                                </span>
                              </td>
                              <td className="py-3.5 px-6 font-medium text-slate-500 max-w-[180px] truncate" title={doc.notes}>
                                {doc.notes || '-'}
                              </td>
                              <td className="py-3.5 px-6 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDocCheckIn(doc.id)}
                                  className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors hover:bg-rose-50 rounded"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {docCheckIns.length === 0 && (
                            <tr>
                              <td colSpan={9} className="py-20 text-center text-slate-400 font-bold uppercase tracking-wider text-[10px] italic">
                                Belum ada log kedatangan anak ayam (DOC) tercatat
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full flex flex-col p-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">
                {/* Visualizations */}
                <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <TrendingUp size={14} className="text-emerald-500" /> IP Trend
                        </h3>
                      </div>
                      <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorIp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}}
                            />
                            <Tooltip />
                            <Area type="monotone" dataKey="ip" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIp)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Beef size={14} className="text-rose-500" /> FCR Trend
                        </h3>
                      </div>
                      <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}}
                            />
                            <Tooltip />
                            <Line type="monotone" dataKey="fcr" stroke="#f43f5e" strokeWidth={2} dot={{r: 3, fill: '#f43f5e'}} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Activity size={14} className="text-blue-500" /> ADG Trend
                        </h3>
                      </div>
                      <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorAdg" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}}
                            />
                            <Tooltip />
                            <Area type="monotone" dataKey="adg" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAdg)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Percent size={14} className="text-amber-500" /> % MORT Trend
                        </h3>
                      </div>
                      <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorMort" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}}
                            />
                            <Tooltip />
                            <Area type="monotone" dataKey="mort" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorMort)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Mortality vs Feed Consumption Comparison Bar Chart */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                      <div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <BarChart3 size={14} className="text-blue-500" /> Perbandingan Tren Mingguan
                        </h3>
                        <p className="text-xs font-bold text-slate-400 mt-1">Perbandingan Mortalitas (Mati) dan Konsumsi Pakan Kumulatif per Minggu</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Sumbu Kiri: Mortalitas (Ekor)
                        </span>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Sumbu Kanan: Pakan (KG)
                        </span>
                      </div>
                    </div>
                    <div className="h-64 w-full">
                      {weeklySummaryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={[...weeklySummaryData].sort((a, b) => a.week - b.week)} 
                            margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis 
                              dataKey="week" 
                              tickFormatter={(tick) => `Minggu ${tick}`}
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }}
                            />
                            <YAxis 
                              yAxisId="left" 
                              orientation="left" 
                              stroke="#f43f5e" 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 9, fill: '#f43f5e', fontWeight: 700 }}
                            />
                            <YAxis 
                              yAxisId="right" 
                              orientation="right" 
                              stroke="#10b981" 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 9, fill: '#10b981', fontWeight: 700 }}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px', fontWeight: 700 }}
                              formatter={(value: any, name: any) => {
                                if (name === "deaths") return [`${value.toLocaleString()} Ekor`, "Kematian"];
                                if (name === "feed") return [`${value.toLocaleString()} KG`, "Konsumsi Pakan"];
                                return [value, name];
                              }}
                              labelFormatter={(label) => `Minggu ${label}`}
                            />
                            <Legend 
                              wrapperStyle={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', paddingTop: '10px' }}
                              formatter={(value) => {
                                if (value === "deaths") return <span className="text-rose-500 font-black">Mortalitas (Ekor)</span>;
                                if (value === "feed") return <span className="text-emerald-500 font-black">Konsumsi Pakan (KG)</span>;
                                return value;
                              }}
                            />
                            <Bar yAxisId="left" dataKey="deaths" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} name="deaths" />
                            <Bar yAxisId="right" dataKey="feed" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} name="feed" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Belum ada data mingguan untuk dibandingkan</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comprehensive Data Table */}
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col mb-6 lg:mb-0">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 transition-all">
                      <div className="flex flex-col">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Archived Flock Data</h4>
                        {availableWeeks.length > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold text-slate-400">SELECT WEEK:</span>
                            <select 
                              value={historySelectedWeek} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setHistorySelectedWeek(val === 'all' ? 'all' : parseInt(val));
                              }}
                              className="text-[10px] font-black text-emerald-600 bg-emerald-50 border-none outline-none rounded-md px-2 py-0.5 cursor-pointer hover:bg-emerald-100 transition-colors"
                            >
                              <option value="all">SEMUA MINGGU (ALL)</option>
                              {availableWeeks.map(w => (
                                <option key={w} value={w}>WEEK {w}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      
                       {history.length > 0 && (
                        <div className="flex items-center gap-2">
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="hidden sm:flex items-center gap-4 bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl"
                          >
                             <div className="p-2 bg-rose-500 text-white rounded-lg shadow-sm shadow-rose-200">
                               <Users size={16} />
                             </div>
                             <div>
                               <p className="text-[8px] font-black text-rose-400 uppercase tracking-[0.2em] mb-0.5">
                                 {activeHistoryWeek ? `W${activeHistoryWeek} Total Mortality` : 'Total Mortality (Overall)'}
                               </p>
                               <div className="flex items-baseline gap-1">
                                 <p className="text-lg font-black text-rose-700 leading-none">
                                   {activeHistoryWeek ? historyWeeklyMortality : overallMortality}
                                 </p>
                                 <span className="text-[10px] font-black text-rose-400">EKOR</span>
                               </div>
                             </div>
                          </motion.div>

                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="hidden sm:flex items-center gap-4 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl"
                          >
                             <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm shadow-emerald-200">
                               <Beef size={16} />
                             </div>
                             <div>
                               <p className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-0.5">
                                 {activeHistoryWeek ? `W${activeHistoryWeek} Total Feed` : 'Total Feed (All Time)'}
                               </p>
                               <div className="flex items-baseline gap-1">
                                 <p className="text-lg font-black text-emerald-700 leading-none">
                                   {Math.round(activeHistoryWeek ? historyWeeklyFeed : overallFeed).toLocaleString()}
                                 </p>
                                 <span className="text-[10px] font-black text-emerald-400 mr-1">KG</span>
                                 <span className="text-sm font-black text-emerald-600 leading-none">
                                   ({Math.round((activeHistoryWeek ? historyWeeklyFeed : overallFeed) / 50).toLocaleString()} SAK)
                                 </span>
                               </div>
                             </div>
                          </motion.div>
                        </div>
                       )}

                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="file"
                          id="database-restore-input"
                          accept=".json"
                          onChange={handleRestoreDatabase}
                          className="hidden"
                        />
                        <button 
                          onClick={() => {
                            if (window.confirm('Hapus semua riwayat flock? Tindakan ini tidak dapat dibatalkan.')) {
                              setHistory([]);
                              setAge('');
                              setTotalFeed('');
                              setTotalWeight('');
                              setDailyFeedSak('');
                              setDailyWeight('');
                              setDailyDeathsInput('');
                              setDailyAge('');
                              localStorage.removeItem('broiler_history');
                            }
                          }}
                          className="text-[10px] font-black text-rose-600 flex items-center gap-2 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors border border-rose-100 cursor-pointer"
                        >
                          CLEAR ALL
                        </button>
                        <button 
                          onClick={exportToCSV}
                          className="text-[10px] font-black text-emerald-600 flex items-center gap-2 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100 cursor-pointer"
                        >
                          <Download size={14} /> EXPORT CSV
                        </button>
                        <button 
                          onClick={backupDatabase}
                          className="text-[10px] font-black text-blue-600 flex items-center gap-2 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-100 cursor-pointer"
                          title="Cadangkan seluruh data aplikasi (Riwayat, Stok, & DOC) ke format JSON"
                        >
                          <Database size={14} /> BACKUP DATABASE
                        </button>
                        <button 
                          onClick={() => document.getElementById('database-restore-input')?.click()}
                          className="text-[10px] font-black text-purple-600 flex items-center gap-2 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors border border-purple-100 cursor-pointer"
                          title="Restore/Pulihkan seluruh data aplikasi dari file JSON cadangan"
                        >
                          <Upload size={14} /> RESTORE JSON
                        </button>
                      </div>
                    </div>
                    <div className="h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[9px] uppercase font-black tracking-widest text-slate-400 sticky top-0 z-20 shadow-sm">
                          <tr>
                            <th className="py-4 px-6 border-b border-slate-100 bg-slate-50 w-12 text-center">No</th>
                            <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Date/ID</th>
                            <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Umur</th>
                            <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">IP</th>
                            <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">FCR (C/D)</th>
                            <th className="py-4 px-6 border-b border-slate-100 bg-slate-50 text-blue-600">Bobot</th>
                            <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Pop Awal</th>
                            <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Pop Akhir</th>
                            <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">Mati Harian</th>
                             <th className="py-4 px-6 border-b border-slate-100 text-rose-600 bg-slate-50">Total Mati</th>
                             <th className="py-4 px-6 border-b border-slate-100 bg-slate-50">% Mort</th>
                             <th className="py-4 px-6 border-b border-slate-100 text-emerald-600 bg-slate-50">Pakan Harian</th>
                             <th className="py-4 px-6 border-b border-slate-100 text-emerald-700 bg-slate-50">Total Pakan</th>
                            <th className="py-4 px-6 border-b border-slate-100 text-right bg-slate-50">Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-bold text-slate-600">
                          {[...filteredHistory].sort((a, b) => b.age - a.age).map((record, idx) => (
                            <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-6 text-center text-slate-400 font-mono text-[10px]">
                                {filteredHistory.length - idx}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col">
                                  <span className="text-slate-900 font-black flex items-center gap-1.5">
                                    <Calendar size={12} className="text-slate-400" />
                                    {format(new Date(record.date), 'MMM dd, yyyy')}
                                  </span>
                                  <span className="text-[9px] text-slate-400 uppercase font-bold mt-0.5">#{record.id.split('-')[0]}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-slate-900 font-black">{record.age}</span> <span className="text-[9px] text-slate-400 font-bold">hari</span>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${record.ip >= 350 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                  {Math.round(record.ip)}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col">
                                  <span className="font-mono text-slate-800">{record.fcr.toFixed(1)}</span>
                                  {record.dailyFcr !== null && record.dailyFcr !== undefined && (
                                    <div className="flex flex-col">
                                      <span className="text-[9px] text-emerald-600 font-black uppercase">D: {record.dailyFcr.toFixed(1)}</span>
                                      {record.dailyAdg && (
                                        <span className="text-[8px] text-blue-500 font-bold -mt-0.5">+{Math.round(record.dailyAdg)}g</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col">
                                  <span className="text-slate-900 font-black uppercase">
                                    {Math.round((record.totalWeight / record.currentPop) * 1000).toLocaleString()} <span className="text-[9px]">gr/ekor</span>
                                  </span>
                                  <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">
                                    Total: {Math.round(record.totalWeight).toLocaleString()} kg
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-slate-500">{record.initialPop.toLocaleString()} <span className="text-[9px]">ekor</span></td>
                              <td className="py-4 px-6 text-slate-900 font-black">{record.currentPop.toLocaleString()} <span className="text-[9px]">ekor</span></td>
                              <td className="py-4 px-6 text-rose-500 font-bold">{record.dailyDeaths?.toLocaleString() || 0} <span className="text-[9px]">ekor</span></td>
                              <td className="py-4 px-6 text-rose-700 font-black">
                                {(record.totalDeaths || 0).toLocaleString()} <span className="text-[9px]">ekor</span>
                              </td>
                              <td className="py-4 px-6 text-rose-600">{Math.round(record.mortality)}%</td>
                               <td className="py-4 px-6">
                                <div className="flex flex-col">
                                  <span className="text-emerald-700 font-black">
                                    {Math.round(record.dailyFeed || 0).toLocaleString()} <span className="text-[9px]">kg</span>
                                    <span className="ml-1 text-[8px] text-emerald-500 font-bold">({Math.round((record.dailyFeed || 0) / 50).toLocaleString()} SAK)</span>
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col">
                                  <span className="text-emerald-800 font-black">
                                    {Math.round(record.totalFeed || 0).toLocaleString()} <span className="text-[9px]">kg</span>
                                    <span className="ml-1 text-[8px] text-emerald-600 font-bold">({Math.round((record.totalFeed || 0) / 50).toLocaleString()} SAK)</span>
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <button 
                                  onClick={() => deleteRecord(record.id)}
                                  className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {history.length === 0 && (
                            <tr>
                              <td colSpan={14} className="py-20 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">
                                No archives found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pr-1 pb-6 lg:pb-0">
                  <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <BarChart3 size={14} /> Average Performance
                    </p>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Mean IP</span>
                        <span className="text-2xl font-black italic">
                          {(() => {
                            const validRecords = filteredHistory.filter(r => (parseFloat(r.ip as any) || 0) > 0);
                            return validRecords.length > 0 
                              ? Math.round(validRecords.reduce((sum, r) => sum + (parseFloat(r.ip as any) || 0), 0) / validRecords.length).toLocaleString() 
                              : '0';
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Avg FCR</span>
                        <span className="text-2xl font-black italic">
                          {(() => {
                            const validRecords = filteredHistory.filter(r => r.fcr > 0);
                            return validRecords.length > 0 
                              ? (validRecords.reduce((a, b) => a + b.fcr, 0) / validRecords.length).toFixed(2) 
                              : '0.00';
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Avg Daily FCR</span>
                        <span className="text-2xl font-black italic text-emerald-500">
                          {(() => {
                            const dailyRecords = filteredHistory.filter(r => r.dailyFcr !== null && r.dailyFcr !== undefined && r.dailyFcr > 0);
                            return dailyRecords.length > 0 
                              ? (dailyRecords.reduce((a, b) => a + (b.dailyFcr || 0), 0) / dailyRecords.length).toFixed(2)
                              : '0.00';
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Rerata Bobot</span>
                        <span className="text-2xl font-black italic text-sky-400">
                          {(() => {
                            const validRecords = filteredHistory.filter(r => r.totalWeight > 0 && r.currentPop > 0);
                            if (validRecords.length === 0) return '0.000';
                            const avgBirdWeight = validRecords.reduce((sum, r) => sum + (r.totalWeight / r.currentPop), 0) / validRecords.length;
                            return avgBirdWeight.toFixed(3);
                          })()} <span className="text-[10px] text-slate-500 font-normal">KG</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                        <span className="text-xs font-bold text-slate-400">Total Mortality (Overall)</span>
                        <div className="text-right">
                          <p className="text-2xl font-black italic text-rose-400">
                             {(() => {
                               const latest = [...history].sort((a, b) => b.age - a.age)[0];
                               return latest ? (latest.totalDeaths || (latest.initialPop - latest.currentPop)).toLocaleString() : '0';
                             })()} <span className="text-[10px]">EKOR</span>
                          </p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">
                            {(() => {
                               const latest = [...history].sort((a, b) => b.age - a.age)[0];
                               return latest ? Math.round(latest.mortality).toString() : '0';
                             })()} % TOTAL
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                        <span className="text-xs font-bold text-slate-400">Total Feed (All Time)</span>
                        <div className="text-right">
                          <p className="text-2xl font-black italic text-emerald-400">
                             {(() => {
                               const latest = [...history].sort((a, b) => b.age - a.age)[0];
                               return latest ? latest.totalFeed.toLocaleString() : '0';
                             })()} <span className="text-[10px]">KG</span>
                          </p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">
                            ≈ {(() => {
                               const latest = [...history].sort((a, b) => b.age - a.age)[0];
                               return latest ? Math.round(latest.totalFeed / 50).toLocaleString() : '0';
                             })()} SAK
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                        <span className="text-xs font-bold text-slate-400">Total Check-In DOC</span>
                        <div className="text-right">
                          <p className="text-2xl font-black italic text-sky-400">
                             {docCheckIns.reduce((sum, doc) => sum + doc.popCount, 0).toLocaleString()} <span className="text-[10px]">EKOR</span>
                          </p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">
                            {docCheckIns.reduce((sum, doc) => sum + doc.boxCount, 0).toLocaleString()} BOX
                            {(() => {
                              const totalPop = docCheckIns.reduce((sum, doc) => sum + doc.popCount, 0);
                              const weightedWeight = docCheckIns.reduce((sum, doc) => sum + (doc.weightAvg * doc.popCount), 0);
                              return totalPop > 0 ? ` / Rerata ${(weightedWeight / totalPop).toFixed(1)} gr` : '';
                            })()}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-slate-700 pt-4">
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3">Akumulasi Panen</p>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">Total Panen Seluruh Ekor</span>
                            <span className="text-xl font-black italic text-emerald-400">
                              {harvestHistory.reduce((s, r) => s + r.birds, 0).toLocaleString()} <span className="text-[9px] text-slate-500 font-normal">EKOR</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">Rerata Umur Panen</span>
                            <span className="text-xl font-black italic text-emerald-400">
                              {(() => {
                                const count = harvestHistory.length;
                                return count > 0 ? (harvestHistory.reduce((s, r) => s + r.age, 0) / count).toFixed(1) : '0';
                              })()} <span className="text-[9px] text-slate-500 font-normal">HARI</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">Rerata Bobot Panen</span>
                            <span className="text-xl font-black italic text-emerald-400">
                              {(() => {
                                const totalB = harvestHistory.reduce((s, r) => s + r.birds, 0);
                                const totalW = harvestHistory.reduce((s, r) => s + r.totalWeight, 0);
                                return totalB > 0 ? (totalW / totalB).toFixed(3) : '0.000';
                              })()} <span className="text-[9px] text-slate-500 font-normal">KG</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">Total Seluruh Berat Panen</span>
                            <span className="text-xl font-black italic text-emerald-400">
                              {harvestHistory.reduce((s, r) => s + r.totalWeight, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[9px] text-slate-500 font-normal">KG</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6">
                    <div>
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Calendar size={14} className="text-emerald-500" /> Summary Mingguan
                      </h3>
                      <div className="space-y-3">
                        {weeklySummaryData.map((data) => (
                          <motion.div 
                            key={data.week}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between"
                          >
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">MINGGU</span>
                              <span className="text-xl font-black text-slate-900 leading-none">{data.week}</span>
                            </div>
                            <div className="flex gap-4">
                              <div className="text-right">
                                <p className="text-[8px] font-black text-rose-400 uppercase leading-none mb-1">MATI</p>
                                <p className="text-sm font-black text-rose-600 leading-none">{data.deaths}<span className="text-[8px] ml-0.5">EKOR</span></p>
                              </div>
                              <div className="text-right border-l border-slate-200 pl-4">
                                <p className="text-[8px] font-black text-emerald-400 uppercase leading-none mb-1">PAKAN</p>
                                <p className="text-sm font-black text-emerald-700 leading-none">{data.feed.toFixed(1)}<span className="text-[8px] ml-0.5 uppercase">KG</span></p>
                                <p className="text-xs font-black text-emerald-600 leading-none mt-1">{(data.feed / 50).toFixed(1)} SAK</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        {weeklySummaryData.length === 0 && (
                          <p className="text-[10px] text-center text-slate-400 font-bold uppercase italic py-4">Belum ada data mingguan</p>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Gemini AI Recommendation Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-tr from-emerald-500 to-blue-500 text-white rounded-lg shadow-md shadow-emerald-100">
                          <Brain size={16} />
                        </div>
                        <div>
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            Gemini AI Advisor
                          </h3>
                          <p className="text-[9px] font-bold text-slate-400 mt-0.5">MANAJEMEN PAKAN HARIAN</p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[8px] font-black px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">
                        <Sparkles size={10} className="text-emerald-500 animate-pulse" /> Gemini 3.5 Flash
                      </span>
                    </div>

                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                      Dapatkan rekomendasi pemberian pakan, analisis tren FCR, tindakan korektif, dan proyeksi performa 3 hari ke depan yang disintesis langsung oleh AI berdasarkan data historis flock Anda.
                    </p>

                    {geminiError && (
                      <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-lg text-[10px] font-bold flex flex-col gap-1.5">
                        <p className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                          Gagal Menganalisis:
                        </p>
                        <p className="font-mono bg-white p-2 rounded border border-rose-100 text-rose-600 break-words">{geminiError}</p>
                      </div>
                    )}

                    {geminiRecommendation && (
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock size={10} /> Rekomendasi Terakhir
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(geminiRecommendation);
                                alert("Rekomendasi berhasil disalin ke papan klip!");
                              }}
                              className="text-[9px] font-black text-emerald-600 hover:text-emerald-800 transition-colors bg-white border border-slate-200 rounded px-1.5 py-0.5 cursor-pointer"
                            >
                              Salin
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Hapus rekomendasi pakan AI dari layar?")) {
                                  setGeminiRecommendation(null);
                                  localStorage.removeItem('gemini_feed_recommendation');
                                }
                              }}
                              className="text-[9px] font-black text-rose-600 hover:text-rose-800 transition-colors bg-white border border-slate-200 rounded px-1.5 py-0.5 cursor-pointer"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>

                        <div className="prose prose-sm max-h-96 overflow-y-auto text-[11px] font-bold text-slate-600 leading-relaxed scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-1">
                          <div className="markdown-body">
                            <Markdown>{geminiRecommendation}</Markdown>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isGeminiLoading || history.length === 0}
                      onClick={fetchGeminiRecommendation}
                      className={`w-full py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        history.length === 0
                          ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                          : isGeminiLoading
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-100 active:scale-[0.98]'
                      }`}
                    >
                      {isGeminiLoading ? (
                        <>
                          <RefreshCcw size={12} className="animate-spin text-emerald-600" />
                          <span>Gemini Sedang Menganalisis...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          <span>{geminiRecommendation ? 'Perbarui Rekomendasi AI' : 'Dapatkan Rekomendasi Pakan AI'}</span>
                        </>
                      )}
                    </button>

                    {history.length === 0 && (
                      <p className="text-[8px] font-black text-amber-500 text-center uppercase tracking-tighter">
                        *Masukkan data harian ke dalam riwayat terlebih dahulu untuk mengaktifkan AI Advisor.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mini Status Bar */}
      <footer className="h-10 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] shrink-0">
        <div className="flex gap-6">
          <span className="flex items-center gap-2">Node: AIS-PHT2-05</span>
          <span className="flex items-center gap-2">Data Source: LOCALSTORAGE_DRIVE</span>
        </div>
        <div className="flex gap-8">
          <span className="flex items-center gap-2 text-emerald-500"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> DB PERSISTED</span>
          <span>&copy; {new Date().getFullYear()} Erfours brosis Systems LP</span>
        </div>
      </footer>

      {/* Weighing Drafts Details Modal */}
      <AnimatePresence>
        {selectedRecordDrafts && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 text-slate-800"
            onClick={() => setSelectedRecordDrafts(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Scale size={16} className="text-emerald-400" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-white">Laporan Detil Lembar Timbang</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">
                    DATA TIMBANG NO: <span className="font-mono text-emerald-300 font-black">{selectedRecordDrafts.dataTimbangNo || 'MANUAL'}</span>
                    {selectedRecordDrafts.spbNo && ` | SPB NO: ${selectedRecordDrafts.spbNo}`}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedRecordDrafts(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Summary Stats */}
              <div className="bg-slate-50 p-4 border-b border-slate-100 grid grid-cols-4 gap-2 text-center shrink-0">
                <div className="bg-white p-2 rounded border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Total Ekor</p>
                  <p className="text-xs font-black text-slate-800">{selectedRecordDrafts.birds.toLocaleString()} <span className="text-[8px] font-normal text-slate-400">EKR</span></p>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Total Netto</p>
                  <p className="text-xs font-black text-emerald-600">{selectedRecordDrafts.totalWeight.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[8px] font-normal text-slate-400">KG</span></p>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Rata-rata</p>
                  <p className="text-xs font-black text-slate-800">{selectedRecordDrafts.avgWeight.toFixed(3)} <span className="text-[8px] font-normal text-slate-400">KG</span></p>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Umur Panen</p>
                  <p className="text-xs font-black text-blue-600">{selectedRecordDrafts.age} <span className="text-[8px] font-normal text-slate-400">HARI</span></p>
                </div>
              </div>

              {/* Grid content */}
              <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-6 leading-relaxed">
                {/* Left side: Metadata & Signature Info */}
                <div className="md:col-span-7 space-y-4">
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-2.5 text-xs">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 border-b border-slate-200 pb-1">
                      Informasi Logistik &amp; Transportasi
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="block text-[8px] font-black uppercase text-slate-400">Tanggal Panen</span>
                        <span className="font-bold text-slate-700">{selectedRecordDrafts.date}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-black uppercase text-slate-400">Penerima / Broker</span>
                        <span className="font-bold text-slate-700">{selectedRecordDrafts.takenBy || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-black uppercase text-slate-400">Nama Sopir</span>
                        <span className="font-bold text-slate-700">{selectedRecordDrafts.driverName || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-black uppercase text-slate-400">No. Polisi Kendaraan</span>
                        <span className="font-mono font-bold text-slate-700">{selectedRecordDrafts.plateNo || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-black uppercase text-slate-400">No. SIM Sopir</span>
                        <span className="font-mono font-bold text-slate-700">{selectedRecordDrafts.driverSim || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-black uppercase text-slate-400">No. STNK</span>
                        <span className="font-mono font-bold text-slate-700">{selectedRecordDrafts.stnkNo || '-'}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200/60 pt-2 grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="bg-white p-1.5 rounded border border-slate-100">
                        <span className="block text-[7px] text-slate-400 font-bold uppercase">Tiba</span>
                        <span className="font-black font-mono text-slate-700">{selectedRecordDrafts.timeArrived || '-'}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-100">
                        <span className="block text-[7px] text-slate-400 font-bold uppercase">Muat</span>
                        <span className="font-black font-mono text-slate-700">{selectedRecordDrafts.timeLoaded || '-'}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-100">
                        <span className="block text-[7px] text-slate-400 font-bold uppercase">Selesai</span>
                        <span className="font-black font-mono text-slate-700">{selectedRecordDrafts.timeCompleted || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Signatures Status */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 text-[10px]">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3 border-b border-slate-200 pb-1">
                      Verifikasi &amp; Tanda Tangan
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5 text-center">
                      <div className="bg-emerald-50/45 p-2 rounded border border-emerald-100/55 flex flex-col justify-between h-24">
                        <span className="font-black text-slate-500 uppercase tracking-tight block">Diambil :</span>
                        <span className="font-black text-emerald-800 text-[11px] block truncate">{selectedRecordDrafts.diambilNama || 'Penerima'}</span>
                        <span className="text-[8px] font-mono text-slate-400 truncate mt-0.5">{selectedRecordDrafts.diambilTgl || '-'}</span>
                      </div>

                      <div className="bg-emerald-50/45 p-2 rounded border border-emerald-100/55 flex flex-col justify-between h-24">
                        <span className="font-black text-slate-500 uppercase tracking-tight block">Keamanan/Sec :</span>
                        <span className="font-black text-emerald-800 text-[11px] block truncate">{selectedRecordDrafts.securityNama || 'Security'}</span>
                        <span className="text-[8px] font-mono text-slate-400 truncate mt-0.5">{selectedRecordDrafts.securityTgl || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Weighing Draft List */}
                <div className="md:col-span-5 flex flex-col border border-slate-200 rounded-lg bg-white overflow-hidden max-h-[360px]">
                  <div className="bg-slate-100/80 px-3 py-2 border-b border-slate-250 flex justify-between items-center text-[10px] font-bold text-slate-600">
                    <span className="uppercase tracking-wider">Lembar Draft Timbang</span>
                    <span className="bg-slate-200 px-1.5 py-0.5 rounded text-[8px] font-mono">
                      {selectedRecordDrafts.weighingDrafts?.length || 0} BARIS
                    </span>
                  </div>
                  
                  <div className="overflow-y-auto flex-1 divide-y divide-slate-100 text-xs">
                    {selectedRecordDrafts.weighingDrafts && selectedRecordDrafts.weighingDrafts.length > 0 ? (
                      selectedRecordDrafts.weighingDrafts.map((draft, idx) => (
                        <div key={draft.id} className="flex justify-between items-center py-2 px-3 hover:bg-slate-50 transition-all font-mono">
                          <span className="text-[9px] text-slate-400 font-bold">Baris #{idx+1}</span>
                          <span className="text-slate-700 font-bold">{draft.birds} <span className="text-[9px] font-normal text-slate-400">ekr</span></span>
                          <span className="text-emerald-700 font-black text-right">{draft.weight.toFixed(2)} <span className="text-[9px] font-normal text-slate-400">kg</span></span>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-400 italic text-[11px]">
                        Tidak ada lembar digital yang disimpan.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const printContents = `
                      <div style="font-family: monospace; padding: 40px; color: black;">
                        <h2 style="text-align: center; margin-bottom: 20px;">NOTA TIMBANG PANEN</h2>
                        <hr style="border: 1px solid black;" />
                        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px;">
                          <tr>
                            <td><strong>TANGGAL PANEN:</strong></td><td>${selectedRecordDrafts.date}</td>
                            <td><strong>DATA TIMBANG NO:</strong></td><td>${selectedRecordDrafts.dataTimbangNo || 'MANUAL'}</td>
                          </tr>
                          <tr>
                            <td><strong>SPB NO:</strong></td><td>${selectedRecordDrafts.spbNo || '-'}</td>
                            <td><strong>BROKER/DIAMBIL OLEH:</strong></td><td>${selectedRecordDrafts.takenBy || '-'}</td>
                          </tr>
                          <tr>
                            <td><strong>SOPIR:</strong></td><td>${selectedRecordDrafts.driverName || '-'} / ${selectedRecordDrafts.plateNo || '-'}</td>
                            <td><strong>TOTAL:</strong></td><td>${selectedRecordDrafts.birds.toLocaleString()} EKR (${selectedRecordDrafts.totalWeight.toFixed(2)} KG)</td>
                          </tr>
                        </table>
                        <h3 style="margin-top: 30px; border-bottom: 1px solid black; padding-bottom: 5px;">DRAFT TIMBANGAN:</h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; font-size: 11px;">
                          ${selectedRecordDrafts.weighingDrafts?.map((d, i) => `
                            <div>[#${i+1}] ${d.birds} Ekr: <strong>${d.weight.toFixed(2)} kg</strong></div>
                          `).join('') || '<div>Input Manual</div>'}
                        </div>
                        <div style="margin-top: 50px; display: flex; justify-content: space-between; text-align: center; font-size: 11px;">
                          <div>Diambil Oleh:<br/><br/><br/>( ${selectedRecordDrafts.diambilNama || '..................'} )</div>
                          <div>Keamanan/Security:<br/><br/><br/>( ${selectedRecordDrafts.securityNama || '..................'} )</div>
                        </div>
                      </div>
                    `;
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(
                        '<html>' +
                          '<head><title>Nota Timbang Panen - ' + (selectedRecordDrafts.dataTimbangNo || 'Manual') + '</title></head>' +
                          '<body>' + printContents + '<script>window.print(); window.close();</script></body>' +
                        '</html>'
                      );
                      printWindow.document.close();
                    }
                  }}
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded transition-colors flex items-center gap-1.5"
                >
                  <Printer size={11} /> Cetak Nota
                </button>
                <button 
                  onClick={() => setSelectedRecordDrafts(null)}
                  className="bg-slate-955 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded transition-colors active:scale-95"
                >
                  Tutup Laporan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Android PWA Install Onboarding Modal */}
        {showAndroidModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 text-slate-800"
            onClick={() => setShowAndroidModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] md:max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Side: Stunning interactive Android Mockup */}
              <div className="bg-slate-950 p-6 md:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 shrink-0 md:w-80">
                <div className="relative w-48 h-96 bg-slate-900 rounded-[40px] border-[6px] border-slate-700 shadow-2xl p-2 flex flex-col overflow-hidden">
                  {/* Android Top notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-700 rounded-b-xl z-20 flex items-center justify-center">
                    <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
                  </div>
                  
                  {/* Android Screen Content Mockup */}
                  <div className="w-full h-full flex flex-col bg-slate-950 rounded-[32px] overflow-hidden relative p-4 pt-6">
                    {/* Stat Bar */}
                    <div className="flex justify-between items-center text-[8px] text-emerald-400 font-mono mb-6 pt-1">
                      <span>LTE / 4G</span>
                      <span>12:30</span>
                      <span>100% 🔋</span>
                    </div>

                    {/* App Icon container */}
                    <div className="flex flex-col items-center justify-center flex-1 my-2">
                      <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl shadow-xl p-0.5 flex items-center justify-center mb-3">
                        <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center overflow-hidden">
                          <img src="/icon.svg" className="w-16 h-16" referrerPolicy="no-referrer" alt="Erfours logo" />
                        </div>
                      </div>
                      <h4 className="text-white text-xs font-black tracking-wider text-center">ERFOURS</h4>
                      <p className="text-[7px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Erfours brosis APK</p>
                    </div>

                    {/* Mock Launcher App Drawer */}
                    <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-2.5 border border-slate-800/60 flex flex-col gap-1.5 mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-emerald-500/20 rounded flex items-center justify-center">
                          <Check size={10} className="text-emerald-400" />
                        </div>
                        <span className="text-[7px] text-slate-300 font-black">Offline-First Logging</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-emerald-500/20 rounded flex items-center justify-center">
                          <Check size={10} className="text-emerald-400" />
                        </div>
                        <span className="text-[7px] text-slate-300 font-black">Automatic FCR & IP</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-4 text-center select-none">Paket Distribusi Android PWA</p>
              </div>

              {/* Right Side: Install Onboarding details */}
              <div className="flex-1 p-6 md:p-8 flex flex-col overflow-y-auto text-slate-200">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-2">
                      <Smartphone size={11} /> Android App Edition
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase">Pasang Aplikasi Erfours</h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">Bawa sistem pencatatan ayam pedaging Anda kemana saja dengan performa maksimal.</p>
                  </div>
                  <button 
                    onClick={() => setShowAndroidModal(false)}
                    className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Android App Key Advantages */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
                    <div className="text-emerald-400 font-black text-sm mb-1">📶 Bebas Offline</div>
                    <p className="text-[10px] text-slate-400 leading-normal font-bold">Tetap catat timbangan, pakan mati di kandang tanpa sinyal internet.</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
                    <div className="text-emerald-400 font-black text-sm mb-1">⚡ Instant Launch</div>
                    <p className="text-[10px] text-slate-400 leading-normal font-bold">Membuka secepat kilat dengan ikon pintasan resmi di layar utama ponsel.</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
                    <div className="text-emerald-400 font-black text-sm mb-1">📲 Tanpa Ruang Besar</div>
                    <p className="text-[10px] text-slate-400 leading-normal font-bold">Ukuran sangat kecil (di bawah 1MB) dibandingkan aplikasi PlayStore konvensional.</p>
                  </div>
                </div>

                {/* Installation Flow */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 mb-6 flex-1">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-3.5">Petunjuk Pemasangan Aplikasi:</h4>
                  
                  {deferredPrompt ? (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-300 font-bold leading-relaxed">
                        Browser Anda mendeteksi bahwa aplikasi Erfours siap dipasang secara langsung sebagai aplikasi Android asli yang didukung oleh integrasi WebAPK Google.
                      </p>
                      <button
                        onClick={() => {
                          deferredPrompt.prompt();
                          deferredPrompt.userChoice.then((choiceResult: any) => {
                            if (choiceResult.outcome === 'accepted') {
                              setIsWebAppInstalled(true);
                              setShowAndroidModal(false);
                            }
                            setDeferredPrompt(null);
                          });
                        }}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all rounded-xl font-bold text-sm tracking-wide text-white shadow-xl shadow-emerald-950/20 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Smartphone size={18} /> PASANG APLIKASI SEKARANG
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5 text-xs text-slate-300">
                      <p className="font-bold text-amber-400">Ponsel Anda dapat memasangnya lewat petunjuk sederhana berikut:</p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-4">
                          <span className="w-5 h-5 bg-slate-800 text-emerald-400 text-[10px] font-black rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                          <span className="leading-relaxed">Buka halaman situs ini dari aplikasi browser <strong>Google Chrome</strong> di HP Android Anda.</span>
                        </div>
                        <div className="flex items-start gap-4">
                          <span className="w-5 h-5 bg-slate-800 text-emerald-400 text-[10px] font-black rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                          <span className="leading-relaxed">Ketuk menu setelan di kanan atas browser Chrome Anda (<strong>ikon titik tiga ⁝</strong>).</span>
                        </div>
                        <div className="flex items-start gap-4">
                          <span className="w-5 h-5 bg-slate-800 text-emerald-400 text-[10px] font-black rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                          <span className="leading-relaxed">Pilih tulisan <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</span>
                        </div>
                        <div className="flex items-start gap-4">
                          <span className="w-5 h-5 bg-slate-800 text-emerald-400 text-[10px] font-black rounded-full flex items-center justify-center shrink-0 mt-0.5">4</span>
                          <span className="leading-relaxed">Tekan tombol <strong>"Instal"</strong>. Selesai! Erfours siap berjalan di HP Anda dengan ikon mandiri.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer status */}
                <div className="flex items-center justify-between border-t border-slate-800 text-[10px] text-slate-500 font-mono mt-auto pt-4">
                  <span>PWA Versi 1.0.0 (API v2)</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isWebAppInstalled ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                    <span>Status: {isWebAppInstalled ? 'Terpasang di Perangkat' : 'Siap Dipasang'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
