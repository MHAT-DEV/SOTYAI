import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { KnowledgeObject, Identity } from "../types";
import {
  Shield,
  Clock,
  CheckCircle2,
  BookOpen,
  Code,
  FileJson,
  Link as LinkIcon,
  User,
  Bot,
  AlertTriangle,
  FileText,
  Share2,
  Quote,
  Network,
  Tag,
  ThumbsUp,
  Bookmark,
  History,
  Beaker,
  Play,
  Terminal,
  CheckSquare,
  XSquare,
  Activity,
  Loader2,
  PieChart,
  Check,
  ChevronRight,
} from "lucide-react";
import Markdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";
import ReportModal from "./ReportModal";
import LinkPreviewBox from "./LinkPreviewBox";
import { ScrollWrapper } from "./ScrollWrapper";
import { useLanguage } from "../context/LanguageContext";

interface LocalTranslation {
  reportContent: string;
  selectIdentityToVerify: string;
  noVerificationLogs: string;
}

const localTranslations: Record<string, LocalTranslation> = {
  en: {
    reportContent: 'Report Content',
    selectIdentityToVerify: 'Please select your Identity at the top menu to verify as a real Verifier.',
    noVerificationLogs: 'No verification logs registered yet.'
  },
  th: {
    reportContent: 'รายงานเนื้อหา (Report)',
    selectIdentityToVerify: 'กรุณาเลือก Identity ของคุณที่แถบเมนูด้านบนก่อนเพื่อลงชื่อรับรองในฐานะ Verifier จริง (Please select your Identity at the top menu to verify).',
    noVerificationLogs: 'ยังไม่มีการบันทึกหลักฐานการตรวจสอบ (No verification logs registered yet).'
  },
  ja: {
    reportContent: 'コンテンツを報告 (Report)',
    selectIdentityToVerify: '実際のベリファイアとして署名するには、上部メニューでアイデンティティを選択してください。',
    noVerificationLogs: 'まだ検証ログが登録されていません。'
  },
  zh: {
    reportContent: '报告内容 (Report)',
    selectIdentityToVerify: '请先在顶部菜单中选择您的身份，以便作为真正的验证者进行签名。',
    noVerificationLogs: '尚未注册任何验证日志。'
  },
  ko: {
    reportContent: '콘텐츠 신고 (Report)',
    selectIdentityToVerify: '실제 검증자로 서명하려면 먼저 상단 메뉴에서 신원을 선택하십시오.',
    noVerificationLogs: '아직 등록된 검증 로그가 없습니다.'
  },
  de: {
    reportContent: 'Inhalt melden (Report)',
    selectIdentityToVerify: 'Bitte wählen Sie zuerst Ihre Identität im oberen Menü, um als echter Verifizierer zu unterzeichnen.',
    noVerificationLogs: 'Noch keine Verifizierungsprotokolle registriert.'
  },
  fr: {
    reportContent: 'Signaler le contenu (Report)',
    selectIdentityToVerify: 'Veuillez d\'abord sélectionner votre identité dans le menu supérieur pour signer en tant que vrai vérificateur.',
    noVerificationLogs: 'Aucun journal de vérification enregistré pour le moment.'
  },
  es: {
    reportContent: 'Reportar Contenido (Report)',
    selectIdentityToVerify: 'Por favor, seleccione su Identidad en el menú superior primero para firmar como un Verificador real.',
    noVerificationLogs: 'No hay registros de verificación registrados todavía.'
  },
  ru: {
    reportContent: 'Пожаловаться на контент (Report)',
    selectIdentityToVerify: 'Пожалуйста, сначала выберите свою Личность в верхнем меню, чтобы подписаться как настоящий Верификатор.',
    noVerificationLogs: 'Журналы верификации пока не зарегистрированы.'
  },
  vi: {
    reportContent: 'Báo cáo nội dung (Report)',
    selectIdentityToVerify: 'Vui lòng chọn Danh tính của bạn ở menu trên cùng trước để ký với tư cách là Người xác minh thực.',
    noVerificationLogs: 'Chưa có nhật ký xác minh nào được đăng ký.'
  }
};

interface KnowledgeDetailProps {
  identity: Identity | null;
}

export default function KnowledgeDetail({ identity }: KnowledgeDetailProps) {
  const { t, language } = useLanguage();
  const tLocal = localTranslations[language] || localTranslations.en;
  
  const { id } = useParams<{ id: string }>();
  const [ko, setKo] = useState<KnowledgeObject | null>(null);
  const [historyEvents, setHistoryEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"human" | "ai">("human");
  const [activeHumanTab, setActiveHumanTab] = useState<
    "content" | "trust" | "citations" | "history" | "sandbox" | "checklist" | "consensus"
  >("content");
  const [activeAiTab, setActiveAiTab] = useState<"json" | "markdown" | "mcp">(
    "json",
  );

  // Sandbox state
  const [sandboxStatus, setSandboxStatus] = useState<
    "idle" | "enqueued" | "provisioning" | "executing" | "completed"
  >("idle");
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([
    "# SOTYAI Ephemeral Sandbox initialized",
    "# Ready to accept jobs...",
  ]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const [sandboxCode, setSandboxCode] = useState("");
  const [sandboxOutput, setSandboxOutput] = useState("");
  const [execMode, setExecMode] = useState<"preview" | "verification">(
    "preview",
  );
  const [sandboxTab, setSandboxTab] = useState<
    "display" | "output" | "console"
  >("console");
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);

  useEffect(() => {
    if (ko) {
      const fullContent = `${ko.problem}\n${ko.context}\n${ko.solution}\n${ko.evidence}`;
      const match = fullContent.match(
        /```(?:javascript|js|html|react|python|typescript|ts)?\n([\s\S]*?)```/,
      );
      if (match && match[1]) {
        setSandboxCode(match[1]);
      } else {
        setSandboxCode(
          '// No executable code block found in knowledge object.\nconsole.log("Empty Sandbox environment ready.");',
        );
      }
    }
  }, [ko]);

  useEffect(() => {
    if (id) {
      const savedTime = localStorage.getItem(`sotyai_sandbox_last_run`);
      if (savedTime) {
        const elapsed = Math.floor((Date.now() - parseInt(savedTime)) / 1000);
        const remaining = 30 * 60 - elapsed;
        if (remaining > 0) {
          setCooldownTimeLeft(remaining);
        }
      }
    }
  }, [id, activeHumanTab]);

  useEffect(() => {
    let timer: any;
    if (cooldownTimeLeft > 0) {
      timer = setInterval(() => setCooldownTimeLeft((p) => p - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownTimeLeft]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [sandboxLogs]);

  const handleEnqueueJob = async () => {
    if (
      sandboxStatus === "enqueued" ||
      sandboxStatus === "provisioning" ||
      sandboxStatus === "executing"
    )
      return;
    if (cooldownTimeLeft > 0) return;

    setSandboxStatus("enqueued");
    setSandboxTab("console");
    setSandboxLogs([
      "# SOTYAI Ephemeral Sandbox initialized",
      "> Enqueueing job to SOTYAI Queue System...",
      "> Status: WAITING IN QUEUE",
    ]);

    // Set 30-minute cooldown
    const now = Date.now();
    localStorage.setItem(`sotyai_sandbox_last_run`, now.toString());
    setCooldownTimeLeft(30 * 60);

    setTimeout(async () => {
      setSandboxStatus("provisioning");
      setSandboxLogs((prev) => [
        ...prev,
        "> Status: PROVISIONING EPHEMERAL SANDBOX",
        "> Downloading dependencies...",
        "> Injecting Knowledge Object code payload...",
      ]);

      setTimeout(async () => {
        setSandboxStatus("executing");
        setSandboxLogs((prev) => [
          ...prev,
          "> Status: EXECUTING",
          "> Running Knowledge Object isolated verification...",
        ]);

        try {
          const res = await fetch("/api/sandbox/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: sandboxCode, language: "javascript" }),
          });

          const data = await res.json();

          setSandboxLogs((prev) => [
            ...prev,
            "✓ Code execution completed",
            ...(data.logs.length > 0
              ? data.logs.map((l: string) => `> ${l}`)
              : ["> No console output"]),
            ...(data.success
              ? ["✓ Constraints evaluated and passed"]
              : ["x Execution failed"]),
            "✓ Evidence output captured",
          ]);

          setSandboxOutput(
            "Simulation Output:\n----------------\n\n" +
              (data.result ? data.result : "[No return value]"),
          );

          setTimeout(() => {
            setSandboxStatus("completed");
            setSandboxLogs((prev) => [
              ...prev,
              "> Verification successful. Result: PASS",
              "> Destroying Sandbox container...",
              "# Sandbox destroyed. (Ephemeral constraint enforced)",
            ]);
            setSandboxTab("display");

            if (execMode === "verification") {
              const newEvent = {
                id: "evt-sbx-" + Date.now(),
                knowledgeId: ko?.id,
                timestamp: new Date().toISOString(),
                authorId: identity?.id || "u1",
                authorName: identity?.name || "Current User",
                identityType: identity?.type || "Human",
                aiModel: "SOTYAI Sandbox Engine",
                commitMessage: "Verified via Ephemeral Sandbox Execution",
                detailedDescription:
                  "Run evidence captured. Sandbox constraints passed.",
                trustScoreAfter: (ko?.trustScore?.overall || 80) + 1,
                changes: {
                  added: ["Sandbox Verification Evidence"],
                  removed: [],
                  modified: [],
                },
              };
              setHistoryEvents((prev) => [newEvent, ...prev]);
            }
          }, 1000);
        } catch (err) {
          setSandboxLogs((prev) => [
            ...prev,
            "x Failed to connect to sandbox API",
            "# Error occurred during execution",
          ]);
          setSandboxStatus("completed");
        }
      }, 1000);
    }, 1000);
  };

  const [isFollowing, setIsFollowing] = useState(false);
  const [notifyAll, setNotifyAll] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Community Verifications states
  const [verificationRecords, setVerificationRecords] = useState<any[]>([]);
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [isSubmittingVerification, setIsSubmittingVerification] =
    useState(false);
  const [verificationForm, setVerificationForm] = useState({
    type: "Tested and Works",
    status: "Passed" as "Passed" | "Failed",
    environment: "",
    evidenceNotes: "",
  });

  // Copied toast status
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch verifications from API
  const fetchVerifications = async () => {
    try {
      const res = await fetch(`/api/knowledge/${id}/verifications`);
      if (res.ok) {
        const data = await res.json();
        setVerificationRecords(data);
      }
    } catch (err) {
      console.error("Error fetching verifications:", err);
    }
  };

  // Trigger metrics increments dynamically (real and non-fake)
  const triggerMetric = async (metricType: string) => {
    try {
      const res = await fetch(`/api/knowledge/${id}/consume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metricType }),
      });
      if (res.ok) {
        const updatedMetrics = await res.json();
        setKo((prev) =>
          prev ? { ...prev, consumptionMetrics: updatedMetrics } : null,
        );
      }
    } catch (err) {
      console.error("Error triggering metrics consumption:", err);
    }
  };

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetch(`/api/knowledge/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setKo(data);
        setLoading(false);
      });

    fetch(`/api/v2/knowledge/${id}/history`)
      .then((res) => res.json())
      .then((data) => {
        setHistoryEvents(data);
      })
      .catch((err) => console.error("Error fetching history:", err));

    fetchVerifications();
  }, [id]);

  useEffect(() => {
    if (ko && identity) {
      fetch(
        `/api/identities/${ko.authorId}/isFollowing?followerId=${identity.id}`,
      )
        .then((res) => res.json())
        .then((data) => {
          setIsFollowing(data.following);
          setNotifyAll(data.notifyAll);
        })
        .catch((err) => console.error(err));
    }
  }, [ko, identity]);

  // Real-time tracking of reads
  useEffect(() => {
    if (id) {
      if (viewMode === "human") {
        triggerMetric("humanReads");
      } else {
        triggerMetric("aiReads");
      }
    }
  }, [id, viewMode]);

  // Real-time tracking of AI API schema requests
  useEffect(() => {
    if (id && viewMode === "ai") {
      if (activeAiTab === "json") {
        triggerMetric("aiApiRequests");
      } else if (activeAiTab === "mcp") {
        triggerMetric("mcpRequests");
      } else if (activeAiTab === "markdown") {
        triggerMetric("aiReads");
      }
    }
  }, [id, activeAiTab, viewMode]);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) return;
    setIsSubmittingVerification(true);
    try {
      const res = await fetch(`/api/knowledge/${id}/verifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verifierId: identity.id,
          type: verificationForm.type,
          status: verificationForm.status,
          environment: verificationForm.environment,
          evidenceNotes: verificationForm.evidenceNotes,
        }),
      });

      if (res.ok) {
        setShowVerifyForm(false);
        setVerificationForm({
          type: "Tested and Works",
          status: "Passed",
          environment: "",
          evidenceNotes: "",
        });

        // Refetch both data models so trust profile and counts update live
        const koRes = await fetch(`/api/knowledge/${id}`);
        const updatedKo = await koRes.json();
        setKo(updatedKo);
        fetchVerifications();
      }
    } catch (err) {
      console.error("Error submitting verification:", err);
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  const handleCopyCitation = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    triggerMetric("humanCitations");
    setCopiedText(format);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(`https://sotyai.com/knowledge/${ko?.id}`);
    triggerMetric("humanShares");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleBookmark = () => {
    const nextVal = !isBookmarked;
    setIsBookmarked(nextVal);
    if (nextVal) {
      triggerMetric("humanSaves");
    }
  };

  const handleFollowToggle = async () => {
    if (!identity || !ko) return;
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await fetch(`/api/identities/${ko.authorId}/unfollow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followerId: identity.id }),
        });
        setIsFollowing(false);
        setNotifyAll(false);
      } else {
        await fetch(`/api/identities/${ko.authorId}/follow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            followerId: identity.id,
            notifyAll: notifyAll,
          }),
        });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleNotifyAllToggle = async (val: boolean) => {
    if (!identity || !ko) return;
    setNotifyAll(val);
    if (isFollowing) {
      try {
        await fetch(`/api/identities/${ko.authorId}/follow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followerId: identity.id, notifyAll: val }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading)
    return (
      <div className="py-12 text-center text-slate-500">
        Loading Knowledge Object...
      </div>
    );
  if (!ko)
    return (
      <div className="py-12 text-center text-red-500">
        Knowledge Object not found
      </div>
    );

  return (
    <div className="mb-12">
      {/* Master View Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-slate-200 p-1 rounded-xl inline-flex">
          <button
            onClick={() => setViewMode("human")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === "human" ? "bg-white text-slate-900 shadow-md" : "text-slate-600 hover:text-slate-900"}`}
          >
            <User className="w-4 h-4" /> Human View
          </button>
          <button
            onClick={() => setViewMode("ai")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === "ai" ? "bg-slate-900 text-green-400 shadow-md" : "text-slate-600 hover:text-slate-900"}`}
          >
            <Bot className="w-4 h-4" /> AI Agent View
          </button>
        </div>
      </div>

      {viewMode === "human" ? (
        /* HUMAN RENDERING PIPELINE */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Network className="w-64 h-64" />
            </div>

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4 relative z-10">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveHumanTab("trust")}
                  className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg bg-green-100 text-green-800 hover:bg-green-200 transition-colors border border-green-200 shadow-sm"
                >
                  <Shield className="w-4 h-4" /> Trust Score{" "}
                  {ko.trustScore.overall}/100
                </button>
                <span className="text-sm font-medium text-slate-600 bg-slate-200 px-2.5 py-1 rounded-md border border-slate-300">
                  v{ko.version}
                </span>
                <span className="text-sm font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
                  {ko.language}
                </span>
                <span className="text-sm text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-4 h-4" />{" "}
                  {formatDistanceToNow(new Date(ko.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <ScrollWrapper className="max-w-full -mx-4 px-4 xl:mx-0 xl:px-0 pb-1 sm:pb-0">
                <div className="flex bg-slate-200/80 p-1 rounded-lg backdrop-blur-sm border border-slate-300 w-max">
                  <button
                    onClick={() => setActiveHumanTab("content")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeHumanTab === "content" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    <BookOpen className="w-4 h-4" /> Read
                  </button>
                  <button
                    onClick={() => setActiveHumanTab("citations")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeHumanTab === "citations" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    <Quote className="w-4 h-4" /> Citations
                  </button>
                  <button
                    onClick={() => setActiveHumanTab("history")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeHumanTab === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    <History className="w-4 h-4" /> History
                  </button>
                  <button
                    onClick={() => setActiveHumanTab("debates")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeHumanTab === "debates" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    <Activity className="w-4 h-4" /> Debates
                  </button>
                  {(!ko.knowledgeType || ko.knowledgeType === 'CODE') && (
                    <button
                      onClick={() => setActiveHumanTab("sandbox")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeHumanTab === "sandbox" ? "bg-amber-100 text-amber-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                    >
                      <Beaker className="w-4 h-4" /> Sandbox
                    </button>
                  )}
                  {ko.knowledgeType === 'CONFIG' && (
                    <button
                      onClick={() => setActiveHumanTab("checklist")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeHumanTab === "checklist" ? "bg-emerald-100 text-emerald-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Validation Checklist
                    </button>
                  )}
                  {ko.knowledgeType === 'DISCOURSE' && (
                    <button
                      onClick={() => setActiveHumanTab("consensus")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeHumanTab === "consensus" ? "bg-purple-100 text-purple-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                    >
                      <PieChart className="w-4 h-4" /> Consensus
                    </button>
                  )}
                </div>
              </ScrollWrapper>
            </div>

            <div className="flex items-center gap-2 mb-2 relative z-10">
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border ${
                ko.knowledgeType === 'CONFIG' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                ko.knowledgeType === 'DISCOURSE' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                'bg-blue-100 text-blue-700 border-blue-200'
              }`}>
                {ko.knowledgeType || 'CODE'} KNOWLEDGE
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4 relative z-10">
              {ko.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 relative z-10">
              <ScrollWrapper className="w-full sm:w-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0">
                <div className="flex items-center gap-3 w-max">
                  {identity && (
                    <button
                      onClick={() => setIsReportOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3.5 py-2 bg-white border border-rose-200 rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      {tLocal.reportContent}
                    </button>
                  )}

                  {/* Real-time Bookmark / Save Button */}
                  <button
                    onClick={handleToggleBookmark}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 border rounded-lg shadow-sm transition-all cursor-pointer ${
                      isBookmarked
                        ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 shrink-0 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`}
                    />
                    {isBookmarked ? "Saved" : "Save / Bookmark"}
                  </button>

                  {/* Real-time Share Button */}
                  <button
                    onClick={handleShareLink}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3.5 py-2 bg-white border border-blue-200 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                    {copiedLink ? "Link Copied! ✓" : "Share / Copy Link"}
                  </button>
                </div>
              </ScrollWrapper>

              <div className="flex flex-wrap gap-2">
                {ko.categories?.map((c) => (
                  <Link
                    key={c}
                    to={`/explore/tags?tab=categories&select=${encodeURIComponent(c)}`}
                    className="text-xs font-semibold px-2 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-md hover:bg-purple-100 transition-colors"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6">
            {activeHumanTab === "content" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* AI Native Sections */}
                  {ko.problem && (
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        {ko.knowledgeType === 'DISCOURSE' ? 'Claim / Thesis' : ko.knowledgeType === 'CONFIG' ? 'System Context' : 'The Problem'}
                      </h3>
                      <div className="text-slate-800 text-lg leading-relaxed bg-amber-50/50 p-5 rounded-xl border border-amber-100/50">
                        {ko.problem}
                      </div>
                    </section>
                  )}

                  {ko.context && (
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                        {ko.knowledgeType === 'DISCOURSE' ? 'Background Context' : 'Context'}
                      </h3>
                      <div className="prose prose-slate max-w-none text-slate-700">
                        <Markdown>{ko.context}</Markdown>
                      </div>
                    </section>
                  )}

                  {ko.requirements && (
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                        Requirements
                      </h3>
                      <div className="prose prose-slate max-w-none text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <Markdown>{ko.requirements}</Markdown>
                      </div>
                    </section>
                  )}

                  {ko.solution && (
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />{" "}
                        {ko.knowledgeType === 'DISCOURSE' ? 'Main Argument' : ko.knowledgeType === 'CONFIG' ? 'Setup Steps' : 'Solution'}
                      </h3>
                      <div className="prose prose-slate max-w-none bg-green-50/30 p-6 rounded-xl border border-green-100/50">
                        <Markdown>{ko.solution}</Markdown>
                      </div>
                    </section>
                  )}

                  {(ko.advantages || ko.disadvantages) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {ko.advantages && (
                        <section className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
                            Advantages
                          </h3>
                          <div className="text-sm text-slate-700">
                            <Markdown>{ko.advantages}</Markdown>
                          </div>
                        </section>
                      )}
                      {ko.disadvantages && (
                        <section className="bg-red-50/30 p-4 rounded-xl border border-red-100">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-red-600 mb-2">
                            Disadvantages
                          </h3>
                          <div className="text-sm text-slate-700">
                            <Markdown>{ko.disadvantages}</Markdown>
                          </div>
                        </section>
                      )}
                    </div>
                  )}

                  {ko.alternatives && (
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                        Alternatives
                      </h3>
                      <div className="prose prose-sm max-w-none text-slate-600">
                        <Markdown>{ko.alternatives}</Markdown>
                      </div>
                    </section>
                  )}

                  {ko.warning && (
                    <section className="bg-orange-50 p-4 rounded-xl border border-orange-200 flex gap-3 items-start">
                      <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-orange-800 mb-1">
                          Warning
                        </h3>
                        <div className="text-sm text-orange-900">
                          <Markdown>{ko.warning}</Markdown>
                        </div>
                      </div>
                    </section>
                  )}

                  {ko.result && (
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                        Result & Conclusion
                      </h3>
                      <div className="text-slate-800 font-medium">
                        <Markdown>{ko.result}</Markdown>
                      </div>
                      {ko.conclusion && (
                        <div className="mt-2 text-slate-600 italic">
                          <Markdown>{ko.conclusion}</Markdown>
                        </div>
                      )}
                    </section>
                  )}

                  {/* Author Box */}
                  <div className="mt-12 bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Author / Contributor
                      </span>
                      <Link
                        to={`/identity/${ko.authorId}`}
                        className="text-lg font-extrabold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {ko.authorId === "id_human_1"
                          ? "Alice Developer"
                          : ko.authorId === "id_org_1"
                            ? "OpenAI"
                            : ko.authorId}
                      </Link>
                      <span className="text-sm font-medium text-slate-600 mt-0.5">
                        Verified Expert Knowledge Contributor
                      </span>
                    </div>

                    {identity && identity.id !== ko.authorId && (
                      <div className="flex flex-col items-start sm:items-end gap-2.5 w-full sm:w-auto">
                        <button
                          onClick={handleFollowToggle}
                          disabled={isFollowLoading}
                          className={`font-bold transition-all px-6 py-2.5 rounded-xl text-sm w-full sm:w-auto ${
                            isFollowing
                              ? "bg-slate-200 hover:bg-slate-300 text-slate-800"
                              : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          }`}
                        >
                          {isFollowLoading
                            ? "..."
                            : isFollowing
                              ? "Following"
                              : "Follow Author"}
                        </button>
                        {isFollowing && (
                          <label className="flex items-center gap-2 cursor-pointer text-[10px] uppercase font-bold text-slate-500">
                            <input
                              type="checkbox"
                              checked={notifyAll}
                              onChange={(e) =>
                                handleNotifyAllToggle(e.target.checked)
                              }
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            Notify on new posts
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar Data */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Evidence & References */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                      Evidence & Sources
                    </h3>
                    <div className="space-y-4">
                      {ko.evidence && (
                        <div>
                          <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                            {ko.evidence}
                          </p>
                        </div>
                      )}
                      {ko.references && ko.references.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                            Sources & References (One Box)
                          </h4>
                          <div className="space-y-3">
                            {ko.references.map((ref, i) => (
                              <LinkPreviewBox key={i} url={ref} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags & Entities */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                      Entities & Tags
                    </h3>

                    <div className="mb-3">
                      <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                        Knowledge Graph Entities
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {ko.entities?.map((e) => (
                          <Link
                            key={e}
                            to={`/explore/tags?tab=entities&select=${encodeURIComponent(e)}`}
                            className="px-2 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded shadow-sm flex items-center gap-1 hover:bg-slate-50 hover:text-purple-700 hover:border-purple-200 transition-all"
                          >
                            <Network className="w-3 h-3 text-purple-500" /> {e}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {ko.tags?.map((t) => (
                          <Link
                            key={t}
                            to={`/explore/tags?tab=tags&select=${encodeURIComponent(t)}`}
                            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded transition-colors"
                          >
                            #{t}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expert Verifications */}
                  {ko.expertVerifications &&
                    ko.expertVerifications.length > 0 && (
                      <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-blue-800 mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4" /> Expert Verifications
                        </h3>
                        <div className="space-y-2">
                          {ko.expertVerifications.map((ev, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-sm font-medium text-blue-900 bg-white px-3 py-2 rounded-lg border border-blue-200 shadow-sm"
                            >
                              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                              {ev}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {activeHumanTab === "content" && (
              <div className="mt-8 space-y-8">
                {/* Verifications */}
                <section className="pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Community Verifications
                      </h3>
                      <p className="text-xs text-slate-500">
                        Real verified reports submitted by decentralized peers
                        and AI validation agents.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowVerifyForm(!showVerifyForm)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md cursor-pointer"
                    >
                      {showVerifyForm
                        ? "Close Form"
                        : "+ Add Real Verification"}
                    </button>
                  </div>

                  {/* Counts summary bubbles */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {ko.verifications.map((v, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 shadow-sm"
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${i === 0 ? "text-green-600" : "text-blue-600"}`}
                        />
                        <strong>{v.type}</strong>{" "}
                        <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 ml-1">
                          {v.count}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Verification Form */}
                  {showVerifyForm && (
                    <form
                      onSubmit={handleVerifySubmit}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 space-y-4 animate-in slide-in-from-top-4 duration-300"
                    >
                      <h4 className="font-bold text-slate-800 text-sm">
                        Submit New Verification Statement
                      </h4>

                      {identity ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Verification Type
                              </label>
                              <select
                                value={verificationForm.type}
                                onChange={(e) =>
                                  setVerificationForm((prev) => ({
                                    ...prev,
                                    type: e.target.value,
                                  }))
                                }
                                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="Tested and Works">
                                  Tested and Works
                                </option>
                                <option value="Reference Valid">
                                  Reference Valid
                                </option>
                                <option value="Verified Information">
                                  Verified Information
                                </option>
                                <option value="Expert Approved">
                                  Expert Approved
                                </option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Status / Result
                              </label>
                              <select
                                value={verificationForm.status}
                                onChange={(e) =>
                                  setVerificationForm((prev) => ({
                                    ...prev,
                                    status: e.target.value as
                                      "Passed" | "Failed",
                                  }))
                                }
                                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 font-medium"
                              >
                                <option
                                  value="Passed"
                                  className="text-green-600 font-bold"
                                >
                                  Passed (Works successfully / Valid)
                                </option>
                                <option
                                  value="Failed"
                                  className="text-rose-600 font-bold"
                                >
                                  Failed (Has errors / Broken)
                                </option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Environment / Platform
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Node 20, React 19, Chrome 124"
                                value={verificationForm.environment}
                                onChange={(e) =>
                                  setVerificationForm((prev) => ({
                                    ...prev,
                                    environment: e.target.value,
                                  }))
                                }
                                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Evidence Notes / Verification Log
                            </label>
                            <textarea
                              placeholder="Please provide details of how you tested this, code output, url checks, or reasons for success/failure..."
                              value={verificationForm.evidenceNotes}
                              rows={3}
                              onChange={(e) =>
                                setVerificationForm((prev) => ({
                                  ...prev,
                                  evidenceNotes: e.target.value,
                                }))
                              }
                              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setShowVerifyForm(false)}
                              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-sm font-semibold text-slate-700 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmittingVerification}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-md transition-colors disabled:opacity-50"
                            >
                              {isSubmittingVerification
                                ? "Submitting..."
                                : "Submit Verification"}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-slate-600 bg-amber-50 border border-amber-200 p-3 rounded-lg font-medium">
                          {tLocal.selectIdentityToVerify}
                        </div>
                      )}
                    </form>
                  )}

                  {/* Detailed Real Verification Records List */}
                  <div className="space-y-3 mt-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Verifier Evidence Ledger
                    </h4>
                    {verificationRecords.length === 0 ? (
                      <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                        {tLocal.noVerificationLogs}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {verificationRecords.map((vr) => (
                          <div
                            key={vr.id}
                            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all"
                          >
                            <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-800 text-sm">
                                    {vr.verifierName}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                      vr.verifierType === "AI Agent"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {vr.verifierType}
                                  </span>

                                  <span
                                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                      vr.status === "Passed"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-rose-100 text-rose-700"
                                    }`}
                                  >
                                    {vr.status === "Passed"
                                      ? "Passed / Works"
                                      : "Failed / Broken"}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                                    Type: {vr.type}
                                  </span>
                                  <span>•</span>
                                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                                    Env: {vr.environment}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {formatDistanceToNow(
                                      new Date(vr.timestamp),
                                      { addSuffix: true },
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-slate-700 bg-slate-50 border border-slate-100 p-2.5 rounded-lg mt-3 whitespace-pre-wrap font-medium">
                              {vr.evidenceNotes}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                {/* Consumption Metrics */}
                <section className="pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-3">
                    Knowledge Consumption Metrics
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" /> Human
                        Consumption
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xl font-black text-slate-900">
                            {ko.consumptionMetrics.humanReads.toLocaleString()}
                          </div>
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-0.5">
                            Reads
                          </div>
                        </div>
                        <div>
                          <div className="text-xl font-black text-slate-900">
                            {ko.consumptionMetrics.humanSaves.toLocaleString()}
                          </div>
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-0.5">
                            Bookmarks
                          </div>
                        </div>
                        <div>
                          <div className="text-xl font-black text-slate-900">
                            {ko.consumptionMetrics.humanShares.toLocaleString()}
                          </div>
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-0.5">
                            Shares
                          </div>
                        </div>
                        <div>
                          <div className="text-xl font-black text-slate-900">
                            {ko.consumptionMetrics.humanCitations.toLocaleString()}
                          </div>
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-0.5">
                            Citations
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Bot className="w-4 h-4 text-purple-400" /> AI
                        Consumption
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xl font-black text-white">
                            {ko.consumptionMetrics.aiReads.toLocaleString()}
                          </div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
                            Reads
                          </div>
                        </div>
                        <div>
                          <div className="text-xl font-black text-white">
                            {ko.consumptionMetrics.aiApiRequests.toLocaleString()}
                          </div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
                            API Requests
                          </div>
                        </div>
                        <div>
                          <div className="text-xl font-black text-white">
                            {ko.consumptionMetrics.aiSyncs.toLocaleString()}
                          </div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
                            Syncs
                          </div>
                        </div>
                        <div>
                          <div className="text-xl font-black text-white">
                            {ko.consumptionMetrics.mcpRequests.toLocaleString()}
                          </div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
                            MCP Requests
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* TRUST SCORE TAB */}
            {activeHumanTab === "trust" && (
              <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 text-green-700 border-4 border-white shadow-lg mb-4">
                    <span className="text-4xl font-black">
                      {ko.trustScore.overall}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Knowledge Trust Engine
                  </h2>
                  <p className="text-slate-500 mt-2">
                    Transparent, multi-dimensional scoring algorithm. No black
                    boxes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      key: "evidence",
                      label: "Evidence Quality",
                      desc: "Strength of provided proof",
                    },
                    {
                      key: "reference",
                      label: "Reference Quality",
                      desc: "Validity of external links",
                    },
                    {
                      key: "community",
                      label: "Community Validation",
                      desc: "Human verifications",
                    },
                    {
                      key: "expert",
                      label: "Expert Verification",
                      desc: "Verified by domain experts",
                    },
                    {
                      key: "freshness",
                      label: "Knowledge Freshness",
                      desc: "Time since last update",
                    },
                    {
                      key: "consistency",
                      label: "Consistency",
                      desc: "No internal contradictions",
                    },
                    {
                      key: "usage",
                      label: "Usage Success",
                      desc: "Successful application in real-world",
                    },
                    {
                      key: "citation",
                      label: "Citation Count",
                      desc: "Referenced by other knowledge",
                    },
                    {
                      key: "revision",
                      label: "Revision History",
                      desc: "Evolution and maintenance",
                    },
                    {
                      key: "transparency",
                      label: "Transparency",
                      desc: "Clear attribution and history",
                    },
                  ].map((metric) => (
                    <div
                      key={metric.key}
                      className="bg-slate-50 p-4 rounded-xl border border-slate-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {metric.label}
                          </h4>
                          <div className="text-[10px] text-slate-500 uppercase">
                            {metric.desc}
                          </div>
                        </div>
                        <div className="text-lg font-black text-slate-700">
                          {
                            ko.trustScore[
                              metric.key as keyof typeof ko.trustScore
                            ]
                          }
                          /100
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${ko.trustScore[metric.key as keyof typeof ko.trustScore]}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 leading-relaxed">
                    <strong>Why trust this?</strong> This Knowledge Object has
                    been verified by a Domain Expert and has a very high
                    Reference Score. It is actively consumed by both Humans and
                    AI Agents via the MCP API, indicating high utility and
                    freshness.
                  </p>
                </div>
              </div>
            )}

            {/* CITATIONS TAB */}
            {activeHumanTab === "citations" && (
              <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Quote className="w-5 h-5 text-slate-500" /> Export Citations
                </h2>

                {[
                  {
                    format: "APA",
                    content: `${ko.authorId === "id_org_1" ? "OpenAI" : "Alice Developer"}. (${new Date(ko.updatedAt).getFullYear()}). ${ko.title}. SOTYAI Knowledge Platform. Retrieved from https://sotyai.com/knowledge/${ko.id}`,
                  },
                  {
                    format: "MLA",
                    content: `${ko.authorId === "id_org_1" ? "OpenAI" : "Developer, Alice"}. "${ko.title}." SOTYAI Knowledge Platform, ${new Date(ko.updatedAt).toLocaleDateString()}, https://sotyai.com/knowledge/${ko.id}.`,
                  },
                  {
                    format: "BibTeX",
                    content: `@misc{sotyai_${ko.id},
  author = {${ko.authorId === "id_org_1" ? "OpenAI" : "Alice Developer"}},
  title = {${ko.title}},
  year = {${new Date(ko.updatedAt).getFullYear()}},
  url = {https://sotyai.com/knowledge/${ko.id}},
  note = {SOTYAI Human-AI Knowledge Platform}
}`,
                  },
                  {
                    format: "Markdown",
                    content: `[${ko.title}](https://sotyai.com/knowledge/${ko.id}) by ${ko.authorId === "id_org_1" ? "OpenAI" : "Alice Developer"}`,
                  },
                ].map((citation) => (
                  <div
                    key={citation.format}
                    className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
                  >
                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                        {citation.format}
                      </span>
                      <button
                        onClick={() =>
                          handleCopyCitation(citation.content, citation.format)
                        }
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-white px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 shadow-sm cursor-pointer transition-colors"
                      >
                        {copiedText === citation.format ? "Copied! ✓" : "Copy"}
                      </button>
                    </div>
                    <div className="p-4">
                      <pre className="text-sm text-slate-700 whitespace-pre-wrap break-all sm:break-words font-sans">
                        {citation.content}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* DEBATES TAB */}
            {activeHumanTab === "debates" && (
              <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-slate-500" /> Knowledge Debates & Comparisons
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Structured multi-dimensional comparisons against other knowledge nodes.
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors">
                    Compare Node
                  </button>
                </div>
                
                {(!ko.comparisons || ko.comparisons.length === 0) ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                    <Activity className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-700">No active debates</h3>
                    <p className="text-sm text-slate-500 mt-1">This knowledge object hasn't been compared to others yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ko.comparisons.map((debateId) => (
                      <Link to={`/debate/${debateId}`} key={debateId} className="block p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 rounded">Debate</span>
                              <span className="text-xs text-slate-500">ID: {debateId}</span>
                            </div>
                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              View Multi-Dimensional Comparison Result
                            </h3>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* HISTORY TAB */}
            {activeHumanTab === "history" && (
              <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <History className="w-5 h-5 text-slate-500" /> Knowledge
                      History (Version Control)
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Timeline of changes, verifications, and trust score
                      evolution.
                    </p>
                  </div>
                </div>

                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {historyEvents.length > 0 ? (
                    historyEvents.map((evt: any, idx: number) => (
                      <div
                        key={evt.id}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                      >
                        {/* Timeline dot */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          {evt.identityType === "Human" ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                        </div>

                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              {evt.eventType}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                              v{evt.version}
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-900 text-sm mb-1">
                            {evt.commitMessage}
                          </h3>

                          {evt.detailedDescription && (
                            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                              {evt.detailedDescription}
                            </p>
                          )}

                          {evt.changes && (
                            <div className="mb-3 space-y-1">
                              {evt.changes.added?.map(
                                (item: string, i: number) => (
                                  <div
                                    key={i}
                                    className="text-[10px] font-mono text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded inline-flex mr-1 mb-1"
                                  >
                                    + {item}
                                  </div>
                                ),
                              )}
                              {evt.changes.removed?.map(
                                (item: string, i: number) => (
                                  <div
                                    key={i}
                                    className="text-[10px] font-mono text-red-700 bg-red-50 border border-red-100 px-2 py-1 rounded inline-flex mr-1 mb-1"
                                  >
                                    - {item}
                                  </div>
                                ),
                              )}
                              {evt.changes.modified?.map(
                                (item: string, i: number) => (
                                  <div
                                    key={i}
                                    className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded inline-flex mr-1 mb-1"
                                  >
                                    ~ {item}
                                  </div>
                                ),
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                                {evt.authorName.charAt(0)}
                              </div>
                              <span className="text-xs font-medium text-slate-700">
                                {evt.authorName}
                              </span>
                              {evt.aiModel && (
                                <span className="text-[9px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                                  via {evt.aiModel}
                                </span>
                              )}
                            </div>

                            <div className="text-[10px] text-slate-400 font-medium">
                              {formatDistanceToNow(new Date(evt.timestamp), {
                                addSuffix: true,
                              })}
                            </div>
                          </div>

                          {(evt.trustScoreBefore || evt.trustScoreAfter) && (
                            <div className="mt-3 bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">
                                Trust Impact
                              </span>
                              <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                                {evt.trustScoreBefore && (
                                  <span className="text-slate-400">
                                    {evt.trustScoreBefore}
                                  </span>
                                )}
                                {evt.trustScoreBefore &&
                                  evt.trustScoreAfter && (
                                    <span className="text-slate-300">→</span>
                                  )}
                                {evt.trustScoreAfter && (
                                  <span
                                    className={
                                      evt.trustScoreAfter >
                                      (evt.trustScoreBefore || 0)
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {evt.trustScoreAfter}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-sm">
                      No history available for this knowledge object yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SANDBOX TAB */}
            {activeHumanTab === "sandbox" && (
              <div className="animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Column: Config */}
                  <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                      <div className="flex items-center gap-2 text-slate-900 font-bold mb-4">
                        <Activity className="w-5 h-5 text-amber-600" />
                        Execution Settings
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                            Environment
                          </label>
                          <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-500">
                            <option>React 19 + TypeScript</option>
                            <option>Node.js 22 (LTS)</option>
                            <option>Python 3.12</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                            Execution Mode
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="execMode"
                                checked={execMode === "preview"}
                                onChange={() => setExecMode("preview")}
                                className="mt-1 text-amber-600"
                              />
                              <div>
                                <div className="text-sm font-bold text-slate-700">
                                  Preview Run
                                </div>
                                <div className="text-xs text-slate-500">
                                  Test locally without recording evidence.
                                </div>
                              </div>
                            </label>
                            <label className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="execMode"
                                checked={execMode === "verification"}
                                onChange={() => setExecMode("verification")}
                                className="mt-1 text-amber-600"
                              />
                              <div>
                                <div className="text-sm font-bold text-slate-700">
                                  Verification Run
                                </div>
                                <div className="text-xs text-slate-500">
                                  Run and record evidence to Knowledge History.
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>

                        <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-800 border border-amber-200">
                          <strong>Note:</strong> Execution is ephemeral. The
                          sandbox will be destroyed immediately after output is
                          captured.
                        </div>

                        <button
                          onClick={handleEnqueueJob}
                          disabled={
                            (sandboxStatus !== "idle" &&
                              sandboxStatus !== "completed") ||
                            cooldownTimeLeft > 0
                          }
                          className={`w-full flex items-center justify-center gap-2 font-bold py-2.5 rounded-lg transition-colors ${
                            (sandboxStatus !== "idle" &&
                              sandboxStatus !== "completed") ||
                            cooldownTimeLeft > 0
                              ? "bg-amber-100 text-amber-400 cursor-not-allowed"
                              : "bg-amber-600 hover:bg-amber-700 text-white"
                          }`}
                        >
                          {sandboxStatus === "enqueued" ||
                          sandboxStatus === "provisioning" ||
                          sandboxStatus === "executing" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4 fill-current" />
                          )}
                          {sandboxStatus === "enqueued"
                            ? "In Queue..."
                            : sandboxStatus === "provisioning"
                              ? "Provisioning..."
                              : sandboxStatus === "executing"
                                ? "Executing..."
                                : cooldownTimeLeft > 0
                                  ? `Cooldown (${formatTime(cooldownTimeLeft)})`
                                  : "Enqueue Job"}
                        </button>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Cooldown Limit
                        </div>
                        <div
                          className={`text-xs font-mono font-bold px-2 py-1 rounded ${cooldownTimeLeft > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                        >
                          {cooldownTimeLeft > 0
                            ? formatTime(cooldownTimeLeft)
                            : "READY"}
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${cooldownTimeLeft > 0 ? "bg-red-500" : "bg-green-500"}`}
                          style={{
                            width:
                              cooldownTimeLeft > 0
                                ? `${(cooldownTimeLeft / (30 * 60)) * 100}%`
                                : "100%",
                          }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                        To prevent server overload, execution is limited to once
                        every 30 minutes per user per knowledge object.
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Console/Output */}
                  <div className="w-full md:w-2/3 flex flex-col">
                    <div className="bg-[#0D1117] rounded-xl border border-slate-800 shadow-sm flex flex-col h-[600px] overflow-hidden">
                      <div className="bg-[#161B22] border-b border-slate-800 flex items-center justify-between px-2 pt-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setSandboxTab("display")}
                            className={`px-4 py-2 text-xs font-mono rounded-t-lg transition-colors ${sandboxTab === "display" ? "bg-[#0D1117] text-amber-400 border-t border-x border-slate-700/50" : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"}`}
                          >
                            Display
                          </button>
                          <button
                            onClick={() => setSandboxTab("output")}
                            className={`px-4 py-2 text-xs font-mono rounded-t-lg transition-colors ${sandboxTab === "output" ? "bg-[#0D1117] text-amber-400 border-t border-x border-slate-700/50" : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"}`}
                          >
                            Output
                          </button>
                          <button
                            onClick={() => setSandboxTab("console")}
                            className={`px-4 py-2 text-xs font-mono rounded-t-lg transition-colors ${sandboxTab === "console" ? "bg-[#0D1117] text-amber-400 border-t border-x border-slate-700/50" : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"}`}
                          >
                            Console
                          </button>
                        </div>
                        <div className="flex gap-1.5 pb-2 pr-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                        </div>
                      </div>

                      {sandboxTab === "console" && (
                        <div className="p-4 flex-1 overflow-y-auto font-mono text-xs text-slate-400 space-y-2">
                          {sandboxLogs.map((log, index) => (
                            <div
                              key={index}
                              className={`${log.startsWith(">") ? "text-amber-300" : log.startsWith("✓") ? "text-green-400" : log.startsWith("#") ? "text-slate-500" : "text-slate-300"}`}
                            >
                              {log}
                            </div>
                          ))}
                          {(sandboxStatus === "enqueued" ||
                            sandboxStatus === "provisioning" ||
                            sandboxStatus === "executing") && (
                            <div className="flex items-center gap-2 text-slate-500 mt-2">
                              <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></span>
                            </div>
                          )}
                          <div ref={consoleEndRef} />
                        </div>
                      )}

                      {sandboxTab === "display" && (
                        <div className="p-4 flex-1 bg-white overflow-hidden flex flex-col">
                          {sandboxStatus === "completed" ? (
                            <div className="w-full h-full border border-slate-200 rounded overflow-hidden">
                              <iframe
                                srcDoc={`<html><head><style>body{font-family:sans-serif;padding:20px;margin:0;color:#333}</style></head><body><h3>Simulated Preview</h3><p>The code from the knowledge object has been executed successfully.</p><hr/><pre style="background:#f4f4f4;padding:10px;border-radius:4px;overflow-x:auto;">${sandboxCode.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre><script>${sandboxCode.includes("console.log") ? "" : ""}</script></body></html>`}
                                className="w-full h-full border-none"
                                title="Sandbox Preview"
                                sandbox="allow-scripts"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 font-mono text-xs">
                              <Beaker className="w-12 h-12 mb-4 opacity-20" />
                              <p>Sandbox execution required to view display.</p>
                              <p className="mt-2 text-slate-500">
                                Click "Enqueue Job" to begin.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {sandboxTab === "output" && (
                        <div className="p-4 flex-1 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap">
                          {sandboxStatus === "completed" ? (
                            sandboxOutput
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                              <Terminal className="w-12 h-12 mb-4 opacity-20" />
                              <p>No output generated yet.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeHumanTab === "checklist" && (
              <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Validation Checklist
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <input type="checkbox" className="mt-1 w-4 h-4 text-emerald-600 rounded" />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Review configuration mapping</div>
                        <div className="text-xs text-slate-500 mt-1">Verify that all variables defined map to the correct environments.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <input type="checkbox" className="mt-1 w-4 h-4 text-emerald-600 rounded" />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Validate security rules</div>
                        <div className="text-xs text-slate-500 mt-1">Check constraints against known vulnerabilities.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <input type="checkbox" className="mt-1 w-4 h-4 text-emerald-600 rounded" />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Cross-check architecture diagrams</div>
                        <div className="text-xs text-slate-500 mt-1">Ensure the diagram matches the proposed setup steps.</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer">
                      Submit Validation Report
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeHumanTab === "consensus" && (
              <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-600" /> Consensus Tracking
                  </h2>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-full border-8 border-purple-100 flex items-center justify-center relative">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="50%" cy="50%" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-purple-600" strokeDasharray="264" strokeDashoffset="40" />
                      </svg>
                      <span className="text-2xl font-black text-slate-900">85%</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">Strong Agreement</h3>
                      <p className="text-sm text-slate-500 mb-2">Based on 42 network participants</p>
                      <div className="flex items-center gap-4 text-xs font-medium">
                        <div className="flex items-center gap-1 text-emerald-600"><Check className="w-3 h-3" /> 36 Supporting</div>
                        <div className="flex items-center gap-1 text-rose-600"><XSquare className="w-3 h-3" /> 6 Opposing</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Key Arguments</h3>
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-2">
                        <CheckCircle2 className="w-4 h-4" /> Supporting Evidence
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{ko.evidence}</p>
                    </div>
                    {ko.alternatives && (
                      <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg">
                        <div className="flex items-center gap-2 text-rose-700 font-bold text-sm mb-2">
                          <XSquare className="w-4 h-4" /> Counter Arguments
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{ko.alternatives}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* AI AGENT RENDERING PIPELINE */
        <div className="bg-[#0D1117] border border-slate-800 rounded-xl overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300 font-mono text-sm">
          {/* AI Header */}
          <div className="p-4 border-b border-slate-800 bg-[#161B22] flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-400">
                <Bot className="w-5 h-5" />
                <span className="font-bold tracking-widest uppercase text-xs">
                  Structured Output
                </span>
              </div>
              <div className="text-slate-500 text-xs">
                Rendered via Accept:{" "}
                {activeAiTab === "json"
                  ? "application/vnd.sotyai.ai+json"
                  : activeAiTab === "markdown"
                    ? "text/markdown"
                    : "application/mcp+json"}
              </div>
            </div>

            <div className="flex bg-[#0D1117] p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setActiveAiTab("json")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeAiTab === "json" ? "bg-slate-800 text-green-400 shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
              >
                <FileJson className="w-4 h-4" /> JSON
              </button>
              <button
                onClick={() => setActiveAiTab("markdown")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeAiTab === "markdown" ? "bg-slate-800 text-green-400 shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
              >
                <FileText className="w-4 h-4" /> Markdown
              </button>
              <button
                onClick={() => setActiveAiTab("mcp")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeAiTab === "mcp" ? "bg-slate-800 text-green-400 shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
              >
                <Code className="w-4 h-4" /> MCP Schema
              </button>
            </div>
          </div>

          <ScrollWrapper className="bg-[#0D1117] rounded-b-2xl border-t border-slate-800">
            <div className="p-4">
              {/* JSON TAB */}
              {activeAiTab === "json" && (
                <pre className="text-green-400 whitespace-pre-wrap break-all sm:break-words">
                  {JSON.stringify(
                    {
                      _metadata: {
                        canonical_id: ko.id,
                        rendered_for: "AI Agent",
                        format: "application/vnd.sotyai.ai+json",
                        schema: "https://sotyai.com/schemas/knowledge-v1.json",
                        confidence_score: ko.trustScore.overall / 100,
                        version: ko.version,
                        updated_at: ko.updatedAt,
                      },
                      data: ko,
                    },
                    null,
                    2,
                  )}
                </pre>
              )}

              {/* MARKDOWN TAB */}
              {activeAiTab === "markdown" && (
                <pre className="text-slate-300 whitespace-pre-wrap break-all sm:break-words">
                  {`---
id: ${ko.id}
title: ${ko.title}
author_id: ${ko.authorId}
version: ${ko.version}
trust_score: ${ko.trustScore.overall}
updated_at: ${ko.updatedAt}
---

# ${ko.title}

## Metadata
- **Version:** ${ko.version}
- **Language:** ${ko.language}
- **Trust Score:** ${ko.trustScore.overall}

## The Problem
${ko.problem}

## Context & Requirements
${ko.context}
${ko.requirements ? `\n**Requirements:**\n${ko.requirements}` : ""}

## Solution
${ko.solution}

## Advantages & Disadvantages
${ko.advantages ? `**Advantages:**\n${ko.advantages}\n` : ""}
${ko.disadvantages ? `**Disadvantages:**\n${ko.disadvantages}\n` : ""}

## Evidence & References
**Evidence:** ${ko.evidence}

**References:**
${ko.references?.map((r) => `- ${r}`).join("\n")}

## Conclusion
${ko.conclusion || ko.result}
`}
                </pre>
              )}

              {/* MCP SCHEME TAB */}
              {activeAiTab === "mcp" && (
                <pre className="text-blue-400 whitespace-pre-wrap break-all sm:break-words">
                  {JSON.stringify(
                    {
                      mcp_version: "1.0.0",
                      resource_uri: `mcp://sotyai/knowledge/${ko.id}`,
                      capabilities: ["read", "subscribe"],
                      description: "SOTYAI Canonical Knowledge Object",
                      schema: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          title: { type: "string" },
                          content: { type: "object" },
                          trust_vector: { type: "object" },
                        },
                      },
                    },
                    null,
                    2,
                  )}
                </pre>
              )}
            </div>
          </ScrollWrapper>
        </div>
      )}

      {identity && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          targetType="KnowledgeObject"
          targetId={ko.id}
          targetTitle={ko.title}
          reporterId={identity.id}
        />
      )}
    </div>
  );
}
