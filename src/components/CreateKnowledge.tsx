import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Identity, KnowledgeType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  Info, 
  AlertTriangle, 
  ShieldCheck, 
  Upload, 
  FileText, 
  Check, 
  CheckCircle2, 
  RotateCcw, 
  FileCode, 
  BookOpen, 
  Sparkles, 
  Layers, 
  ArrowRight,
  HelpCircle,
  Code2,
  Settings2,
  MessageSquare
} from 'lucide-react';

const localTranslations: Record<string, any> = {
  th: {
    createTitle: "สร้าง Knowledge Object ใหม่",
    createSub: "ระบบลงทะเบียนวัตถุความรู้ ร่วมวิเคราะห์ความน่าเชื่อถือผ่านกลไกตรวจสอบ",
    step1Title: "ประเภทวัตถุความรู้",
    step2Title: "รูปแบบการบันทึกข้อมูล",
    manualTab: "กรอกข้อมูลโดยตรง",
    importTab: "สกัดข้อมูลจากคู่มือ/เอกสาร",
    titleLabel: "ชื่อวัตถุความรู้ (Title)",
    titlePlaceholder: "ระบุหัวเรื่อง เช่น การใช้งาน AbortController ใน React",
    problemLabelCode: "โจทย์ปัญหาทางเทคนิค (The Problem)",
    problemLabelConfig: "บริบทระบบ/สถาปัตยกรรม (System Context)",
    problemLabelDiscourse: "ประเด็นหลักที่ต้องการโต้แย้ง (Claim/Thesis)",
    problemPlaceholder: "ระบุข้อผิดพลาด เงื่อนไขข้อจำกัด หรือประเด็นที่เกิดขึ้นจริง...",
    contextLabel: "ข้อมูลภูมิหลัง (Context)",
    contextPlaceholder: "ข้อมูลสภาพแวดล้อมระบบ เวอร์ชั่น หรือเงื่อนไขแวดล้อม...",
    solutionLabelCode: "แนวทางแก้ไขปัญหา (Solution)",
    solutionLabelConfig: "ขั้นตอนการติดตั้งใช้งาน (Setup Steps)",
    solutionLabelDiscourse: "บทพิสูจน์/ข้อพิจารณา (Main Argument)",
    solutionPlaceholder: "ระบุคำอธิบายเชิงลึก หรือโค้ดแก้ไขเบื้องหลัง (รองรับ Markdown)...",
    evidenceLabel: "หลักฐานการวิเคราะห์และความเสถียร (Evidence)",
    evidencePlaceholder: "ระบุผลทดสอบ Benchmark สถิติ หรือแหล่งอ้างอิงเพื่อคำนวณคะแนนความน่าเชื่อถือ...",
    tagsLabel: "ป้ายกำกับ (Tags)",
    tagsPlaceholder: "คั่นด้วยเครื่องหมายจุลภาค เช่น React, Memory, NextJS",
    codeLabelCode: "โค้ด / สคริปต์สำหรับการทดสอบจริง (Executable Sandbox Code)",
    codeLabelConfig: "ค่าโครงสร้างระบบ (System Configuration/YAML/JSON)",
    codeLabelDiscourse: "ตรรกะจำลองสถานการณ์โต้แย้ง (Discourse Simulation Logic)",
    codePlaceholderCode: "// เขียนสคริปต์ JS/TS ที่นี่เพื่อประมวลผลจริงใน Sandbox...",
    codePlaceholderConfig: "# ตัวอย่างไฟล์การตั้งค่าระบบ\nport: 3000\nenv: production",
    codePlaceholderDiscourse: "// ตรรกะหรือประโยควิเคราะห์ในรูปแบบ Script...",
    envLabel: "สภาพแวดล้อมระบบ Sandbox (Sandbox Runtime Env)",
    envDesc: "โปรดกำหนดสภาพแวดล้อมที่ Sandbox สามารถนำไปประมวลผลด้วยข้อมูลจริงได้อย่างถูกต้อง",
    buttonSubmit: "ลงทะเบียนและเผยแพร่ข้อมูล",
    savingText: "กำลังตรวจสอบและบันทึก...",
    warningFill: "กรุณากรอกข้อมูลที่จำเป็นทั้งหมดเพื่อให้กลไกวิเคราะห์ความปลอดภัยเสร็จสมบูรณ์",
    dropZoneTitle: "วางไฟล์คู่มือตรงนี้เพื่อสกัดฟิลด์",
    dropZoneSub: "รองรับไฟล์ .txt, .csv, .pdf, .docx",
    mapToField: "จับคู่กับฟิลด์:",
    mappingSuccess: "จับคู่ฟิลด์สำเร็จ",
    placeholderChoose: "-- กรุณาเลือกฟิลด์สำหรับจับคู่ --",
    sandboxSectionTitle: "รัน Sandbox และกำหนดรหัสโครงสร้างโค้ด",
    trustEngineInfo: "คะแนนความน่าเชื่อถือทางสถิติและมติเอกฉันท์จะถูกคำนวณและประมวลผลทันทีที่บันทึกข้อมูล"
  },
  en: {
    createTitle: "Create New Knowledge Object",
    createSub: "Register verified knowledge, evaluate trust using consensus mechanism",
    step1Title: "Knowledge Type",
    step2Title: "Data Input Format",
    manualTab: "Manual Entry Form",
    importTab: "Extract from Document/Manual",
    titleLabel: "Knowledge Object Title",
    titlePlaceholder: "e.g., Implementing memory leak protection with AbortController",
    problemLabelCode: "The Technical Problem",
    problemLabelConfig: "System/Architecture Context",
    problemLabelDiscourse: "Main Claim / Thesis",
    problemPlaceholder: "Describe the actual bug, bottleneck or issue...",
    contextLabel: "Background Context",
    contextPlaceholder: "Runtime versions, environment variables, limitations...",
    solutionLabelCode: "Resolution & Code Fix (Solution)",
    solutionLabelConfig: "Installation & Setup Steps",
    solutionLabelDiscourse: "Analytical Argument (Main Argument)",
    solutionPlaceholder: "Provide a detailed fix explanation or core code snippet (Markdown supported)...",
    evidenceLabel: "Evidence & Stability Proof",
    evidencePlaceholder: "Benchmark tests, analytics, or links to verify trustworthiness...",
    tagsLabel: "Tags",
    tagsPlaceholder: "Separated by commas, e.g., React, Memory, NextJS",
    codeLabelCode: "Code / Executable Script (Sandbox Code)",
    codeLabelConfig: "System Configuration Data (YAML/JSON/Config)",
    codeLabelDiscourse: "Discourse Logic / Simulation Script",
    codePlaceholderCode: "// Write JS/TS script here to execute in the Sandbox...",
    codePlaceholderConfig: "# System configuration parameters\nport: 3000\nenv: production",
    codePlaceholderDiscourse: "// Logical expressions or scripts for discourse checking...",
    envLabel: "Sandbox Runtime Environment",
    envDesc: "Select the runtime environment correctly based on what SOTYAI Sandbox can run with real data without error",
    buttonSubmit: "Register & Publish Knowledge",
    savingText: "Verifying & Saving...",
    warningFill: "Please fill out all required fields to complete the trust rating process",
    dropZoneTitle: "Drop manual files here to parse",
    dropZoneSub: "Supports .txt, .csv, .pdf, .docx",
    mapToField: "Map to Field:",
    mappingSuccess: "Field mapped successfully",
    placeholderChoose: "-- Choose Field to Map --",
    sandboxSectionTitle: "Sandbox Run & Executable Code Setup",
    trustEngineInfo: "Statistical and consensus trust score will be calculated and processed immediately upon save."
  },
  ja: {
    createTitle: "ナレッジオブジェクトの新規作成",
    createSub: "検証済みナレッジを登録し、コンセンサスメカニズムで信頼性を評価します",
    step1Title: "ナレッジのタイプ",
    step2Title: "データ入力形式",
    manualTab: "手動入力フォーム",
    importTab: "ドキュメント/マニュアルから抽出",
    titleLabel: "ナレッジのタイトル",
    titlePlaceholder: "例: AbortControllerによるメモリリーク対策の実装",
    problemLabelCode: "技術的な課題 (The Problem)",
    problemLabelConfig: "システム/アーキテクチャの文脈 (System Context)",
    problemLabelDiscourse: "主張・テーゼ (Claim/Thesis)",
    problemPlaceholder: "実際のバグ、ボトルネック、または課題を説明してください...",
    contextLabel: "背景の文脈 (Context)",
    contextPlaceholder: "実行時のバージョン、環境変数、制限事項...",
    solutionLabelCode: "解決策・修正コード (Solution)",
    solutionLabelConfig: "インストール・セットアップ手順",
    solutionLabelDiscourse: "分析的議論 (Main Argument)",
    solutionPlaceholder: "詳細な修正方法またはコアコードスニペット（Markdown対応）を入力してください...",
    evidenceLabel: "証拠・安定性の証明 (Evidence)",
    evidencePlaceholder: "信頼性を検証するためのベンチマークテスト、分析、またはリンク...",
    tagsLabel: "タグ (Tags)",
    tagsPlaceholder: "カンマ区切り、例: React, Memory, NextJS",
    codeLabelCode: "テスト実行コード (Sandbox Code)",
    codeLabelConfig: "システム設定コード (YAML/JSON/Config)",
    codeLabelDiscourse: "ディスコース評価論理スクリプト",
    codePlaceholderCode: "// Sandboxで実行するJS/TSコードを記述...",
    codePlaceholderConfig: "# システム設定パラメータ\nport: 3000\nenv: production",
    codePlaceholderDiscourse: "// 議論チェック用の論理式またはスクリプト...",
    envLabel: "Sandbox 実行環境 (Sandbox Runtime Env)",
    envDesc: "SOTYAI Sandboxが実データでエラーなく実行できるように、正しい実行環境を選択してください",
    buttonSubmit: "登録してナレッジを公開",
    savingText: "検証と保存中...",
    warningFill: "信頼性評価を完了するために必要なフィールドをすべて入力してください",
    dropZoneTitle: "ファイルをここにドラッグしてパース",
    dropZoneSub: ".txt, .csv, .pdf, .docx に対応",
    mapToField: "フィールドにマップ:",
    mappingSuccess: "マッピング成功",
    placeholderChoose: "-- マップするフィールドを選択 --",
    sandboxSectionTitle: "Sandbox実行と実行可能コードの設定",
    trustEngineInfo: "統計的およびコンセンサスの信頼スコアは、保存時に即座に計算され処理されます。"
  },
  zh: {
    createTitle: "创建新知识对象 (Knowledge Object)",
    createSub: "注册已验证的知识，并通过共识机制评估其信任度",
    step1Title: "知识类型",
    step2Title: "数据输入格式",
    manualTab: "手动填写表单",
    importTab: "从文档/手册中提取",
    titleLabel: "知识对象标题",
    titlePlaceholder: "例如：在 React 中使用 AbortController 防止内存泄漏",
    problemLabelCode: "技术问题 (The Problem)",
    problemLabelConfig: "系统/架构上下文 (System Context)",
    problemLabelDiscourse: "主要主张/论题 (Claim/Thesis)",
    problemPlaceholder: "描述实际的错误、瓶颈或问题...",
    contextLabel: "背景上下文 (Context)",
    contextPlaceholder: "运行时版本、环境变量、系统限制...",
    solutionLabelCode: "解决方案与代码修复 (Solution)",
    solutionLabelConfig: "安装与配置步骤",
    solutionLabelDiscourse: "分析性论证 (Main Argument)",
    solutionPlaceholder: "提供详细的修复说明或核心代码片段（支持 Markdown）...",
    evidenceLabel: "证据与稳定性证明 (Evidence)",
    evidencePlaceholder: "用于计算信任分的基准测试、分析或参考链接...",
    tagsLabel: "标签 (Tags)",
    tagsPlaceholder: "用逗号分隔，例如：React, Memory, NextJS",
    codeLabelCode: "可执行测试代码 (Sandbox Code)",
    codeLabelConfig: "系统配置代码 (YAML/JSON/Config)",
    codeLabelDiscourse: "探讨逻辑评估脚本",
    codePlaceholderCode: "// 在此处编写 JS/TS 代码以便在沙箱中真实执行...",
    codePlaceholderConfig: "# 系统配置参数\nport: 3000\nenv: production",
    codePlaceholderDiscourse: "// 用于讨论检查的逻辑表达式或脚本...",
    envLabel: "沙箱运行环境 (Sandbox Runtime Env)",
    envDesc: "请准确设定运行环境，确保 SOTYAI 沙箱能够通过真实数据无误执行",
    buttonSubmit: "注册并发布知识",
    savingText: "正在验证并保存...",
    warningFill: "请填写所有必需的字段以完成信任度评估过程",
    dropZoneTitle: "拖放文件至此处进行解析",
    dropZoneSub: "支持 .txt, .csv, .pdf, .docx",
    mapToField: "映射到字段:",
    mappingSuccess: "字段映射成功",
    placeholderChoose: "-- 选择要映射的字段 --",
    sandboxSectionTitle: "隔离沙箱运行与可执行代码配置",
    trustEngineInfo: "系统将在保存时自动计算 AI 与社区共识信任分。"
  },
  ko: {
    createTitle: "새 지식 객체 (Knowledge Object) 생성",
    createSub: "검증된 지식을 등록하고 합의 메커니즘을 통해 신뢰도를 평가합니다",
    step1Title: "지식 유형",
    step2Title: "데이터 입력 형식",
    manualTab: "수동 입력 폼",
    importTab: "문서/메뉴얼에서 추출",
    titleLabel: "지식 객체 제목",
    titlePlaceholder: "예: React에서 AbortController를 사용한 메모리 누수 방지 구현",
    problemLabelCode: "기술적 문제 (The Problem)",
    problemLabelConfig: "시스템/아키텍처 컨텍스트 (System Context)",
    problemLabelDiscourse: "주요 주장/논제 (Claim/Thesis)",
    problemPlaceholder: "실제 버그, 병목 현상 또는 문제점을 설명하세요...",
    contextLabel: "배경 컨텍스트 (Context)",
    contextPlaceholder: "런타임 버전, 환경 변수, 제약 조건...",
    solutionLabelCode: "해결 책 및 코드 수정 (Solution)",
    solutionLabelConfig: "설치 및 설정 단계",
    solutionLabelDiscourse: "분석적 논증 (Main Argument)",
    solutionPlaceholder: "자세한 수정 설명 또는 핵심 코드 스니펫(Markdown 지원)을 입력하세요...",
    evidenceLabel: "증거 및 안정성 증명 (Evidence)",
    evidencePlaceholder: "신뢰도 계산을 위한 벤치마크 테스트, 분석 결과 또는 참고 링크...",
    tagsLabel: "태그 (Tags)",
    tagsPlaceholder: "쉼표로 구분, 예: React, Memory, NextJS",
    codeLabelCode: "테스트 실행용 코드 (Sandbox Code)",
    codeLabelConfig: "시스템 구성 코드 (YAML/JSON/Config)",
    codeLabelDiscourse: "토론 평가 논리 스크립트",
    codePlaceholderCode: "// 샌드박스에서 실행할 JS/TS 코드를 작성하세요...",
    codePlaceholderConfig: "# 시스템 구성 파라미터\nport: 3000\nenv: production",
    codePlaceholderDiscourse: "// 토론 확인용 논리식 또는 스크립트...",
    envLabel: "샌드박스 실행 환경 (Sandbox Runtime Env)",
    envDesc: "SOTYAI 샌드박스가 실제 데이터로 오류 없이 동작할 수 있도록 올바른 환경을 구성하세요",
    buttonSubmit: "지식 객체 등록 및 게시",
    savingText: "검증 및 저장 중...",
    warningFill: "신뢰 등급을 지정하려면 모든 필수 필드를 입력하세요",
    dropZoneTitle: "파싱할 파일을 여기에 드롭하세요",
    dropZoneSub: ".txt, .csv, .pdf, .docx 지원",
    mapToField: "필드 매핑:",
    mappingSuccess: "필드 매핑 완료",
    placeholderChoose: "-- 매핑할 필드 선택 --",
    sandboxSectionTitle: "샌드박스 실행 및 실행 가능 코드 설정",
    trustEngineInfo: "통계 및 합의 신뢰 점수는 저장 시 즉시 계산 및 처리됩니다."
  },
  de: {
    createTitle: "Neues Wissensobjekt erstellen",
    createSub: "Registrieren Sie verifiziertes Wissen und bewerten Sie das Vertrauen über den Konsensmechanismus",
    step1Title: "Wissenstyp",
    step2Title: "Dateneingabeformat",
    manualTab: "Manuelles Formular",
    importTab: "Aus Dokument/Handbuch extrahieren",
    titleLabel: "Titel des Wissensobjekts",
    titlePlaceholder: "z. B. Implementierung eines Speicherleckschutzes mit AbortController",
    problemLabelCode: "Das technische Problem",
    problemLabelConfig: "System-/Architekturkontext",
    problemLabelDiscourse: "Hauptbehauptung / These",
    problemPlaceholder: "Beschreiben Sie den tatsächlichen Fehler, Engpass oder das Problem...",
    contextLabel: "Hintergrundkontext (Context)",
    contextPlaceholder: "Laufzeitversionen, Umgebungsvariablen, Einschränkungen...",
    solutionLabelCode: "Lösung & Code-Fix (Solution)",
    solutionLabelConfig: "Installations- & Einrichtungsschritte",
    solutionLabelDiscourse: "Analytische Argumentation (Main Argument)",
    solutionPlaceholder: "Geben Sie eine detaillierte Korrekturerklärung oder ein Code-Snippet an...",
    evidenceLabel: "Beweise & Stabilitätsnachweis (Evidence)",
    evidencePlaceholder: "Benchmark-Tests, Analysen oder Links zur Überprüfung der Vertrauenswürdigkeit...",
    tagsLabel: "Tags",
    tagsPlaceholder: "Durch Kommas getrennt, z. B. React, Memory, NextJS",
    codeLabelCode: "Ausführbarer Sandbox-Code",
    codeLabelConfig: "Systemkonfigurationscode (YAML/JSON)",
    codeLabelDiscourse: "Evaluierungsskript / Diskurslogik",
    codePlaceholderCode: "// Schreiben Sie hier JS/TS-Code, um ihn in der Sandbox auszuführen...",
    codePlaceholderConfig: "# Systemkonfigurationsparameter\nport: 3000\nenv: production",
    codePlaceholderDiscourse: "// Logische Ausdrücke oder Skripte zur Diskursprüfung...",
    envLabel: "Sandbox-Laufzeitumgebung",
    envDesc: "Wählen Sie die Laufzeitumgebung korrekt aus, damit die Sandbox fehlerfrei mit echten Daten läuft",
    buttonSubmit: "Wissen registrieren & veröffentlichen",
    savingText: "Verifizieren & Speichern...",
    warningFill: "Bitte füllen Sie alle erforderlichen Felder aus, um den Bewertungsprozess abzuschließen",
    dropZoneTitle: "Dateien hier ablegen zum Parsen",
    dropZoneSub: "Unterstützt .txt, .csv, .pdf, .docx",
    mapToField: "Feld zuweisen:",
    mappingSuccess: "Erfolgreich zugewiesen",
    placeholderChoose: "-- Feld auswählen --",
    sandboxSectionTitle: "Sandbox-Ausführung & Code-Konfiguration",
    trustEngineInfo: "Statistische und Konsens-Vertrauensbewertungen werden beim Speichern sofort berechnet."
  },
  fr: {
    createTitle: "Créer un nouvel Objet de Connaissance",
    createSub: "Enregistrez des connaissances vérifiées et évaluez la confiance via le mécanisme de consensus",
    step1Title: "Type de Connaissance",
    step2Title: "Format de Saisie des Données",
    manualTab: "Saisie Manuelle",
    importTab: "Extraire d'un Document/Manuel",
    titleLabel: "Titre de l'Objet",
    titlePlaceholder: "ex : Implémentation de la protection contre les fuites de mémoire avec AbortController",
    problemLabelCode: "Le Problème Technique",
    problemLabelConfig: "Contexte Système / Architecture",
    problemLabelDiscourse: "Thèse / Argument Principal",
    problemPlaceholder: "Décrivez le bug réel, le goulot d'étranglement ou le problème...",
    contextLabel: "Contexte Général (Context)",
    contextPlaceholder: "Versions d'exécution, variables d'environnement, limitations...",
    solutionLabelCode: "Résolution & Code Correctif (Solution)",
    solutionLabelConfig: "Étapes d'Installation & Configuration",
    solutionLabelDiscourse: "Argumentation Analytique",
    solutionPlaceholder: "Fournissez une explication ou un extrait de code (Markdown supporté)...",
    evidenceLabel: "Preuve & Validation de Stabilité",
    evidencePlaceholder: "Tests de performance, analyses ou liens pour évaluer l'indice de confiance...",
    tagsLabel: "Mots-clés (Tags)",
    tagsPlaceholder: "Séparés par des virgules, ex: React, Memory, NextJS",
    codeLabelCode: "Code Exécutable pour Sandbox",
    codeLabelConfig: "Configuration Système (YAML/JSON)",
    codeLabelDiscourse: "Script d'Évaluation du Discours",
    codePlaceholderCode: "// Écrivez le script JS/TS ici pour l'exécuter dans la Sandbox...",
    codePlaceholderConfig: "# Paramètres de configuration\nport: 3000\nenv: production",
    codePlaceholderDiscourse: "// Expressions logiques ou scripts pour le contrôle du discours...",
    envLabel: "Environnement d'Exécution Sandbox",
    envDesc: "Sélectionnez correctement l'environnement pour que la Sandbox s'exécute avec de vraies données sans erreur",
    buttonSubmit: "Enregistrer & Publier la Connaissance",
    savingText: "Vérification & Enregistrement...",
    warningFill: "Veuillez remplir tous les champs obligatoires pour finaliser l'évaluation de confiance",
    dropZoneTitle: "Déposer le fichier ici pour l'analyser",
    dropZoneSub: "Prend en charge .txt, .csv, .pdf, .docx",
    mapToField: "Associer au champ :",
    mappingSuccess: "Association réussie",
    placeholderChoose: "-- Choisir le champ à associer --",
    sandboxSectionTitle: "Exécution Sandbox & Configuration du Code",
    trustEngineInfo: "L'indice de confiance statistique et de consensus sera calculé dès l'enregistrement."
  },
  es: {
    createTitle: "Crear Nuevo Objeto de Conocimiento",
    createSub: "Registre conocimientos verificados y evalúe la confianza mediante el consenso",
    step1Title: "Tipo de Conocimiento",
    step2Title: "Formato de Entrada de Datos",
    manualTab: "Formulario Manual",
    importTab: "Extraer de Documento/Manual",
    titleLabel: "Título del Objeto",
    titlePlaceholder: "ej: Implementación de protección contra fugas de memoria con AbortController",
    problemLabelCode: "El Problema Técnico",
    problemLabelConfig: "Contexto del Sistema / Arquitectura",
    problemLabelDiscourse: "Reclamación / Tesis Principal",
    problemPlaceholder: "Describa el error real, cuello de botella o problema...",
    contextLabel: "Contexto de Antecedentes (Context)",
    contextPlaceholder: "Versiones del entorno, variables, limitaciones...",
    solutionLabelCode: "Resolución y Código de Corrección (Solution)",
    solutionLabelConfig: "Pasos de Instalación y Configuración",
    solutionLabelDiscourse: "Argumentación Analítica",
    solutionPlaceholder: "Proporcione una explicación detallada o fragmento de código (soporta Markdown)...",
    evidenceLabel: "Prueba de Estabilidad y Evidencia",
    evidencePlaceholder: "Pruebas de rendimiento, análisis o enlaces para validar la confiabilidad...",
    tagsLabel: "Etiquetas (Tags)",
    tagsPlaceholder: "Separadas por comas, ej: React, Memory, NextJS",
    codeLabelCode: "Código Ejecutable para Sandbox",
    codeLabelConfig: "Código de Configuración del Sistema",
    codeLabelDiscourse: "Script de Evaluación de Discurso",
    codePlaceholderCode: "// Escriba el código JS/TS aquí para ejecutarlo en el Sandbox...",
    codePlaceholderConfig: "# Parámetros de configuración del sistema\nport: 3000\nenv: production",
    codePlaceholderDiscourse: "// Expresiones lógicas o scripts para comprobación de discursos...",
    envLabel: "Entorno de Ejecución Sandbox",
    envDesc: "Seleccione el entorno de ejecución correcto para que el Sandbox funcione con datos reales sin errores",
    buttonSubmit: "Registrar y Publicar Conocimiento",
    savingText: "Verificando y Guardando...",
    warningFill: "Complete todos los campos requeridos para finalizar la calificación de confianza",
    dropZoneTitle: "Suelte el archivo aquí para analizar",
    dropZoneSub: "Soporta .txt, .csv, .pdf, .docx",
    mapToField: "Vincular al campo:",
    mappingSuccess: "Vinculación exitosa",
    placeholderChoose: "-- Seleccionar campo para vincular --",
    sandboxSectionTitle: "Ejecución de Sandbox y Configuración de Código",
    trustEngineInfo: "La puntuación de confianza estadística y de consenso se calculará al guardar."
  },
  ru: {
    createTitle: "Создать новый объект знаний",
    createSub: "Регистрация подтвержденных знаний и оценка доверия с помощью консенсуса",
    step1Title: "Тип знаний",
    step2Title: "Формат ввода данных",
    manualTab: "Ручной ввод в форму",
    importTab: "Извлечь из документа/руководства",
    titleLabel: "Заголовок объекта знаний",
    titlePlaceholder: "например, Предотвращение утечек памяти с помощью AbortController",
    problemLabelCode: "Техническая проблема",
    problemLabelConfig: "Контекст системы / Архитектура",
    problemLabelDiscourse: "Основное утверждение / Тезис",
    problemPlaceholder: "Опишите реальную ошибку, узкое место или проблему...",
    contextLabel: "Фоновый контекст (Context)",
    contextPlaceholder: "Версии среды выполнения, переменные окружения, ограничения...",
    solutionLabelCode: "Решение и исправление кода (Solution)",
    solutionLabelConfig: "Шаги по установке и настройке",
    solutionLabelDiscourse: "Аналитическая аргументация",
    solutionPlaceholder: "Предоставьте подробное описание решения или фрагмент кода (с поддержкой Markdown)...",
    evidenceLabel: "Доказательства и проверка стабильности",
    evidencePlaceholder: "Тесты производительности, аналитика или ссылки для расчета доверия...",
    tagsLabel: "Теги (Tags)",
    tagsPlaceholder: "Разделяйте запятыми, например: React, Memory, NextJS",
    codeLabelCode: "Исполняемый код для песочницы",
    codeLabelConfig: "Код конфигурации системы (YAML/JSON)",
    codeLabelDiscourse: "Скрипт логической оценки дискурса",
    codePlaceholderCode: "// Напишите код JS/TS здесь для запуска в песочнице...",
    codePlaceholderConfig: "# Параметры конфигурации системы\nport: 3000\nenv: production",
    codePlaceholderDiscourse: "// Логические выражения или скрипты для проверки дискурса...",
    envLabel: "Среда выполнения песочницы",
    envDesc: "Выберите правильную среду выполнения, чтобы песочница могла работать с реальными данными без ошибок",
    buttonSubmit: "Зарегистрировать и опубликовать",
    savingText: "Проверка и сохранение...",
    warningFill: "Пожалуйста, заполните все обязательные поля для расчета рейтинга доверия",
    dropZoneTitle: "Перетащите файлы сюда для разбора",
    dropZoneSub: "Поддерживаются .txt, .csv, .pdf, .docx",
    mapToField: "Привязать к полю:",
    mappingSuccess: "Поле успешно привязано",
    placeholderChoose: "-- Выберите поле для привязки --",
    sandboxSectionTitle: "Запуск в песочнице и конфигурация исполняемого кода",
    trustEngineInfo: "Статистический индекс и консенсус доверия будут рассчитаны при сохранении."
  },
  vi: {
    createTitle: "Tạo Đối Tượng Tri Thức Mới",
    createSub: "Đăng ký tri thức đã xác minh, đánh giá mức độ tin cậy bằng cơ chế đồng thuận",
    step1Title: "Loại Tri Thức",
    step2Title: "Định Dạng Nhập Dữ Liệu",
    manualTab: "Nhập Liệu Thủ Công",
    importTab: "Trích xuất từ Tài Liệu/Hướng Dẫn",
    titleLabel: "Tiêu Đề Đối Tượng Tri Thức",
    titlePlaceholder: "ví dụ: Triển khai chống rò rỉ bộ nhớ với AbortController trong React",
    problemLabelCode: "Vấn Đề Kỹ Thuyết (The Problem)",
    problemLabelConfig: "Bối Cảnh Hệ Thống / Kiến Trúc (System Context)",
    problemLabelDiscourse: "Luận Điểm / Tuyên Bố Chính (Claim/Thesis)",
    problemPlaceholder: "Mô tả lỗi thực tế, điểm nghẽn hoặc vấn đề gặp phải...",
    contextLabel: "Bối Cảnh Nền Tảng (Context)",
    contextPlaceholder: "Phiên bản môi trường, biến môi trường, các hạn chế...",
    solutionLabelCode: "Giải Pháp & Sửa Đổi Mã (Solution)",
    solutionLabelConfig: "Các Bước Cài Đặt & Thiết Lập",
    solutionLabelDiscourse: "Luận Cứ Phân Tích (Main Argument)",
    solutionPlaceholder: "Cung cấp hướng dẫn chi tiết hoặc đoạn mã sửa lỗi (hỗ trợ Markdown)...",
    evidenceLabel: "Bằng Chứng & Xác Minh Tính Ổn Định",
    evidencePlaceholder: "Kiểm tra hiệu năng, dữ liệu thống kê hoặc liên kết xác minh độ tin cậy...",
    tagsLabel: "Thẻ (Tags)",
    tagsPlaceholder: "Phân tách bằng dấu phẩy, ví dụ: React, Memory, NextJS",
    codeLabelCode: "Mã Chạy Thử Nghiệm trong Sandbox",
    codeLabelConfig: "Mã Cấu Hình Hệ Thống (YAML/JSON)",
    codeLabelDiscourse: "Kịch Bản Đánh Giá Luận Thuyết",
    codePlaceholderCode: "// Viết mã JS/TS tại đây để chạy thực tế trong Sandbox...",
    codePlaceholderConfig: "# Tham số cấu hình hệ thống\nport: 3000\nenv: production",
    codePlaceholderDiscourse: "// Các biểu thức logic hoặc kịch bản chạy thử nghiệm luận thuyết...",
    envLabel: "Môi Trường Chạy Thử Sandbox",
    envDesc: "Vui lòng chọn môi trường chạy chính xác để Sandbox có thể thực thi với dữ liệu thực tế không lỗi",
    buttonSubmit: "Đăng Ký & Công Bố Tri Thức",
    savingText: "Đang Xác Minh & Lưu Trữ...",
    warningFill: "Vui lòng điền đầy đủ thông tin bắt buộc để hoàn thành tính toán độ tin cậy",
    dropZoneTitle: "Kéo thả tệp vào đây để phân tích",
    dropZoneSub: "Hỗ trợ các tệp .txt, .csv, .pdf, .docx",
    mapToField: "Liên kết với trường:",
    mappingSuccess: "Liên kết trường thành công",
    placeholderChoose: "-- Chọn trường để liên kết --",
    sandboxSectionTitle: "Cấu hình chạy Sandbox & Mã có thể thực thi",
    trustEngineInfo: "Điểm tin cậy thống kê và đồng thuận sẽ được tính toán ngay khi lưu."
  }
};

interface CreateKnowledgeProps {
  identity: Identity | null;
}

interface ExtractedBlock {
  id: string;
  title: string;
  content: string;
  mappedTo?: string;
}

export default function CreateKnowledge({ identity }: CreateKnowledgeProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();
  const tLocal = localTranslations[language] || localTranslations.en;

  const [knowledgeType, setKnowledgeType] = useState<KnowledgeType>('CODE');
  const [entryMode, setEntryMode] = useState<'manual' | 'import'>('manual');
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    problem: '',
    context: '',
    solution: '',
    evidence: '',
    tags: '',
    code: '',
    sandboxEnv: 'Node.js 22 (LTS)'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File Upload & Mapper State
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [extractedBlocks, setExtractedBlocks] = useState<ExtractedBlock[]>([]);
  const [mappedFields, setMappedFields] = useState<Record<string, string>>({}); // blockId -> fieldName

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    
    const newKnowledge = {
      ...formData,
      knowledgeType,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      authorId: identity?.id || 'anonymous',
      references: [] // Simplified for MVP
    };

    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKnowledge)
      });
      const data = await res.json();
      navigate(`/knowledge/${data.id}`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setAnalyzing(true);
    setExtractedBlocks([]);
    setMappedFields({});
    
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string || '';
      let blocks: ExtractedBlock[] = [];

      if (file.name.endsWith('.csv')) {
        // Parse CSV Rows
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        blocks = lines.slice(0, 8).map((line, idx) => {
          const cells = line.split(',');
          return {
            id: `block_${idx}`,
            title: `แถวที่ ${idx + 1} (Row ${idx + 1})`,
            content: cells.join(' | ')
          };
        });
      } else if (file.name.endsWith('.txt')) {
        // Parse TXT by paragraphs
        const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
        blocks = paragraphs.slice(0, 8).map((para, idx) => {
          return {
            id: `block_${idx}`,
            title: `ส่วนที่ ${idx + 1} (Section ${idx + 1})`,
            content: para
          };
        });
      } else {
        // PDF, DOC, DOCX structure analysis simulation
        const baseName = file.name.split('.')[0].replace(/[-_]/g, ' ');
        blocks = [
          {
            id: 'block_1',
            title: 'หัวข้อเนื้อหา (Extracted Title)',
            content: `${baseName}`
          },
          {
            id: 'block_2',
            title: 'ข้อผิดพลาดและปัญหาสนับสนุน (Identified Problem Statement)',
            content: `การทำงานบนแพลตฟอร์มที่ล้าสมัยก่อให้เกิดความไม่เที่ยงตรงของข้อมูลสารสนเทศ ตลอดจนการขาดกลไกตรวจสอบวิเคราะห์ที่โปร่งใสในกลุ่มคอมมูนิตี้`
          },
          {
            id: 'block_3',
            title: 'บริบทและข้อมูลระบบ (Context and Background Info)',
            content: `ระบบจัดทำขึ้นตามเกณฑ์วิเคราะห์แบบไร้ศูนย์กลาง (Decentralized Network Validation) มีความต้องการในการตรวจสอบข้อมูลให้ถูกต้องเกินกว่า 95%`
          },
          {
            id: 'block_4',
            title: 'ทางออกและการตอบสนอง (Solution & Execution Plan)',
            content: `พัฒนาระบบตรวจสอบคะแนนความน่าเชื่อถือ Trust Score ร่วมกับ Multi-dimensional evaluation และระบบรับรองเอกสารรายงานเพื่อคัดกรองเนื้อหาอันตราย`
          },
          {
            id: 'block_5',
            title: 'ตัวชี้วัดความน่าเชื่อถือ (Evidence & Verification Proof)',
            content: `ผลวิจัยทดลองใช้อัลกอริทึมคัดกรองพบลดการสแปมและข้อมูลบิดเบือนได้ถึง 42% ในระยะเวลาการทดสอบ 30 วันแรก`
          },
          {
            id: 'block_6',
            title: 'คำสำคัญ (Keywords / Mapped Tags)',
            content: 'Decentralization, Security Rules, Community Filtering, Integrity'
          }
        ];
      }

      // Simulate a smart parser progress bar
      setTimeout(() => {
        setExtractedBlocks(blocks);
        setAnalyzing(false);
        setUploadedFileName(file.name);
      }, 1500);
    };

    if (file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      // PDF or DOC
      reader.readAsArrayBuffer(file);
    }
  };

  const handleMapField = (blockId: string, fieldName: string) => {
    // 1. Update mapping state
    setMappedFields(prev => ({
      ...prev,
      [blockId]: fieldName
    }));

    // 2. Find block content
    const block = extractedBlocks.find(b => b.id === blockId);
    if (block) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: block.content
      }));
    }
  };

  const handleResetMapping = () => {
    setUploadedFileName(null);
    setExtractedBlocks([]);
    setMappedFields({});
    setFormData({
      title: '',
      problem: '',
      context: '',
      solution: '',
      evidence: '',
      tags: '',
      code: '',
      sandboxEnv: 'Node.js 22 (LTS)'
    });
  };

  if (!identity) return <div className="text-center py-12 text-slate-500 font-medium">Loading profile data...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="bg-blue-50/75 border-b border-blue-100 p-6 flex items-start gap-4">
          <div className="bg-blue-100 p-2.5 rounded-full text-blue-600 shrink-0 border border-blue-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              {tLocal.createTitle}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {tLocal.createSub} <strong className="text-slate-900">{identity.name}</strong> ({identity.type}) 
            </p>
          </div>
        </div>

        {/* Step 1: Select Knowledge Type */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">1</span>
            {tLocal.step1Title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setKnowledgeType('CODE')}
              className={`p-4 text-left rounded-xl border-2 transition-all cursor-pointer ${
                knowledgeType === 'CODE' 
                  ? 'border-blue-500 bg-blue-50/50' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${knowledgeType === 'CODE' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Code / Executable</h3>
              <p className="text-xs text-slate-500 leading-relaxed">มีโค้ด สามารถรันได้ รองรับ Sandbox และ Verification Mode</p>
            </button>
            <button
              onClick={() => setKnowledgeType('CONFIG')}
              className={`p-4 text-left rounded-xl border-2 transition-all cursor-pointer ${
                knowledgeType === 'CONFIG' 
                  ? 'border-amber-500 bg-amber-50/50' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${knowledgeType === 'CONFIG' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                <Settings2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">System / Config</h3>
              <p className="text-xs text-slate-500 leading-relaxed">การตั้งค่า, สถาปัตยกรรม (ไม่มี Sandbox)</p>
            </button>
            <button
              onClick={() => setKnowledgeType('DISCOURSE')}
              className={`p-4 text-left rounded-xl border-2 transition-all cursor-pointer ${
                knowledgeType === 'DISCOURSE' 
                  ? 'border-purple-500 bg-purple-50/50' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${knowledgeType === 'DISCOURSE' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Discussion / Theory</h3>
              <p className="text-xs text-slate-500 leading-relaxed">แนวคิด, ถกเถียง, อ้างอิง (เน้น Citation System)</p>
            </button>
          </div>
        </div>

        {/* Tab Switcher (Step 2) */}
        <div className="flex border-b border-slate-200 p-2 bg-slate-50/50 gap-2 items-center px-6">
          <div className="flex items-center gap-2 mr-4 text-sm font-bold text-slate-900">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</span>
            {tLocal.step2Title}
          </div>
          <button
            onClick={() => setEntryMode('manual')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              entryMode === 'manual'
                ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {tLocal.manualTab}
          </button>
          <button
            onClick={() => setEntryMode('import')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              entryMode === 'import'
                ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
            {tLocal.importTab}
          </button>
        </div>
      </div>

      {entryMode === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* File Upload Zone / Blocks Column (LEFT) */}
          <div className="lg:col-span-5 space-y-4">
            
            {!uploadedFileName && !analyzing && (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`bg-white border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive ? 'border-blue-500 bg-blue-50/40' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".doc,.docx,.pdf,.csv,.txt"
                />
                <div className="w-12 h-12 bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <Upload className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{tLocal.dropZoneTitle}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {tLocal.dropZoneSub}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-150 py-1.5 px-3 rounded-lg w-max mx-auto shadow-xs">
                  <FileCode className="w-3.5 h-3.5" /> {tLocal.fileUploadRawSupport}
                </div>
              </div>
            )}

            {analyzing && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto border border-purple-100 animate-spin">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-950">{tLocal.fileUploadAnalyzing}</h3>
                  <p className="text-xs text-slate-500">{tLocal.fileUploadAnalyzingDesc}</p>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full animate-pulse" style={{ width: '80%' }}></div>
                </div>
              </div>
            )}

            {uploadedFileName && extractedBlocks.length > 0 && (
              <div className="space-y-4">
                
                {/* Active File Header */}
                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-lg shrink-0 border border-purple-200">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-purple-800 uppercase tracking-wider">{tLocal.fileUploadSuccess}</div>
                      <div className="text-xs text-slate-700 font-extrabold truncate max-w-[180px] sm:max-w-[240px]" title={uploadedFileName}>
                        {uploadedFileName}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleResetMapping}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                    title="ล้างข้อมูลไฟล์นี้"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 shrink-0 text-slate-400" />
                  {tLocal.fileUploadGuide}
                </div>

                {/* Blocks list */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {extractedBlocks.map((block) => {
                    const isMapped = !!mappedFields[block.id];
                    const mappedFieldName = mappedFields[block.id];

                    return (
                      <div 
                        key={block.id}
                        className={`bg-white border rounded-xl p-4 shadow-xs transition-all ${
                          isMapped ? 'border-emerald-200 ring-2 ring-emerald-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {block.title}
                          </span>
                          {isMapped && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                              <Check className="w-3 h-3" /> Mapped to {mappedFieldName}
                            </span>
                          )}
                        </div>

                        {/* Raw text */}
                        <div className="text-xs text-slate-700 bg-slate-50 border border-slate-150 rounded-lg p-2.5 max-h-24 overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed mb-3">
                          {block.content}
                        </div>

                        {/* Map select Dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 font-bold uppercase">{tLocal.mapToField}</span>
                          <select
                            value={mappedFields[block.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) {
                                handleMapField(block.id, val);
                              }
                            }}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="">{tLocal.placeholderChoose}</option>
                            <option value="title">{tLocal.fieldTitleOpt}</option>
                            <option value="problem">{tLocal.fieldProblemOpt}</option>
                            <option value="context">{tLocal.fieldContextOpt}</option>
                            <option value="solution">{tLocal.fieldSolutionOpt}</option>
                            <option value="evidence">{tLocal.fieldEvidenceOpt}</option>
                            <option value="tags">{tLocal.fieldTagsOpt}</option>
                            <option value="code">{tLocal.fieldCodeOpt || '💻 โค้ด/คอนฟิก (Code/Config)'}</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Form Column (RIGHT) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  ฟอร์มจัดทำข้อมูล (Mapped Knowledge Form)
                </h2>
                {uploadedFileName && (
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">
                    ผูกข้อมูลจาก: {uploadedFileName}
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>{tLocal.titleLabel}</span>
                    {formData.title && <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1"><Check className="w-3 h-3" /> มีข้อมูลแล้ว</span>}
                  </label>
                  <input 
                    required
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={tLocal.titlePlaceholder}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>{knowledgeType === 'DISCOURSE' ? tLocal.problemLabelDiscourse : knowledgeType === 'CONFIG' ? tLocal.problemLabelConfig : tLocal.problemLabelCode}</span>
                      {formData.problem && <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1"><Check className="w-3 h-3" /> มีข้อมูลแล้ว</span>}
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">{tLocal.problemDesc}</p>
                    <textarea 
                      required
                      name="problem"
                      value={formData.problem}
                      onChange={handleChange}
                      rows={4}
                      placeholder={tLocal.problemPlaceholder}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs sm:text-sm text-slate-700 leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>{tLocal.contextLabel}</span>
                      {formData.context && <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1"><Check className="w-3 h-3" /> มีข้อมูลแล้ว</span>}
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">{tLocal.contextDesc}</p>
                    <textarea 
                      required
                      name="context"
                      value={formData.context}
                      onChange={handleChange}
                      rows={4}
                      placeholder={tLocal.contextPlaceholder}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs sm:text-sm text-slate-700 leading-relaxed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>{knowledgeType === 'DISCOURSE' ? tLocal.solutionLabelDiscourse : knowledgeType === 'CONFIG' ? tLocal.solutionLabelConfig : tLocal.solutionLabelCode}</span>
                    {formData.solution && <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1"><Check className="w-3 h-3" /> มีข้อมูลแล้ว</span>}
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    {knowledgeType === 'CODE' ? tLocal.solutionDescCode : tLocal.solutionDescOther}
                  </p>
                  <textarea 
                    required
                    name="solution"
                    value={formData.solution}
                    onChange={handleChange}
                    rows={6}
                    placeholder={tLocal.solutionPlaceholder}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono text-xs sm:text-sm leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>{tLocal.evidenceLabel}</span>
                    {formData.evidence && <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1"><Check className="w-3 h-3" /> มีข้อมูลแล้ว</span>}
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">{tLocal.evidenceDesc}</p>
                  <textarea 
                    required
                    name="evidence"
                    value={formData.evidence}
                    onChange={handleChange}
                    rows={2}
                    placeholder={tLocal.evidencePlaceholder}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs sm:text-sm text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>{tLocal.tagsLabel}</span>
                    {formData.tags && <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1"><Check className="w-3 h-3" /> มีข้อมูลแล้ว</span>}
                  </label>
                  <input 
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder={tLocal.tagsPlaceholder}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
                  />
                </div>

                {/* Sandbox Run & Code Configuration Section */}
                {knowledgeType === 'CODE' && (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <Code2 className="w-4 h-4 text-amber-600" />
                      <span>{tLocal.sandboxSectionTitle}</span>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {tLocal.codeLabelCode}
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2">
                        {tLocal.codeDescCode}
                      </p>
                      <textarea
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        rows={5}
                        placeholder={tLocal.codePlaceholderCode}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-xs leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {tLocal.envLabel}
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2">
                        {tLocal.envDesc}
                      </p>
                      <select
                        name="sandboxEnv"
                        value={formData.sandboxEnv}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-slate-700 font-semibold"
                      >
                        <option value="Node.js 22 (LTS)">Node.js 22 (LTS)</option>
                        <option value="Node.js 20 (LTS)">Node.js 20 (LTS)</option>
                        <option value="React 19 + TypeScript (Vite)">React 19 + TypeScript (Vite)</option>
                        <option value="React 18 + TypeScript (Vite)">React 18 + TypeScript (Vite)</option>
                        <option value="Python 3.12 (Standard)">Python 3.12 (Standard)</option>
                        <option value="Python 3.10 (Data Science / Pandas)">Python 3.10 (Data Science / Pandas)</option>
                        <option value="Python 3.11 (Django / FastAPI)">Python 3.11 (Django / FastAPI)</option>
                        <option value="Go 1.22 (Go Playground)">Go 1.22 (Go Playground)</option>
                        <option value="Rust 1.78 (Cargo Sandbox)">Rust 1.78 (Cargo Sandbox)</option>
                        <option value="Java 21 (OpenJDK / Gradle)">Java 21 (OpenJDK / Gradle)</option>
                        <option value="Ruby 3.3 (Standard)">Ruby 3.3 (Standard)</option>
                        <option value="PHP 8.3 (CLI)">PHP 8.3 (CLI)</option>
                        <option value="Bash / Shell Script (Alpine 3.19)">Bash / Shell Script (Alpine 3.19)</option>
                        <option value="Docker (Alpine Container Runtime)">Docker (Alpine Container Runtime)</option>
                        <option value="PostgreSQL 16 (Ephemeral DB)">PostgreSQL 16 (Ephemeral DB)</option>
                        <option value="MySQL 8.0 (Ephemeral DB)">MySQL 8.0 (Ephemeral DB)</option>
                        <option value="Redis 7.2 (Cache Sandbox)">Redis 7.2 (Cache Sandbox)</option>
                        <option value="C++ (GCC 13 / Alpine)">C++ (GCC 13 / Alpine)</option>
                        <option value=".NET 8 (C# CLI)">.NET 8 (C# CLI)</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Info className="w-4 h-4 shrink-0" />
                    {tLocal.trustEngineInfo}
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer text-sm"
                  >
                    {isSubmitting ? tLocal.savingText : tLocal.buttonSubmit}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

            </div>
          </div>

        </div>
      )}

      {entryMode === 'manual' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex items-center gap-1.5 text-xs font-bold text-amber-700 border-amber-200/50">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            {tLocal.qualityRequirement}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">{tLocal.titleLabel}</label>
              <input 
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={tLocal.titlePlaceholder}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  {knowledgeType === 'DISCOURSE' ? tLocal.problemLabelDiscourse : knowledgeType === 'CONFIG' ? tLocal.problemLabelConfig : tLocal.problemLabelCode}
                </label>
                <p className="text-[11px] text-slate-500 mb-2">{tLocal.problemDesc}</p>
                <textarea 
                  required
                  name="problem"
                  value={formData.problem}
                  onChange={handleChange}
                  rows={3}
                  placeholder={tLocal.problemPlaceholder}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  {tLocal.contextLabel}
                </label>
                <p className="text-[11px] text-slate-500 mb-2">{tLocal.contextDesc}</p>
                <textarea 
                  required
                  name="context"
                  value={formData.context}
                  onChange={handleChange}
                  rows={3}
                  placeholder={tLocal.contextPlaceholder}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                {knowledgeType === 'DISCOURSE' ? tLocal.solutionLabelDiscourse : knowledgeType === 'CONFIG' ? tLocal.solutionLabelConfig : tLocal.solutionLabelCode}
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                {knowledgeType === 'CODE' ? tLocal.solutionDescCode : tLocal.solutionDescOther}
              </p>
              <textarea 
                required
                name="solution"
                value={formData.solution}
                onChange={handleChange}
                rows={5}
                placeholder={tLocal.solutionPlaceholder}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono text-sm leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                {tLocal.evidenceLabel}
              </label>
              <p className="text-[11px] text-slate-500 mb-2">{tLocal.evidenceDesc}</p>
              <textarea 
                required
                name="evidence"
                value={formData.evidence}
                onChange={handleChange}
                rows={2}
                placeholder={tLocal.evidencePlaceholder}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">{tLocal.tagsLabel}</label>
              <input 
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder={tLocal.tagsPlaceholder}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
              />
            </div>

            {/* Sandbox Run & Code Configuration Section */}
            {knowledgeType === 'CODE' && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Code2 className="w-4 h-4 text-amber-600" />
                  <span>{tLocal.sandboxSectionTitle}</span>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {tLocal.codeLabelCode}
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    {tLocal.codeDescCode}
                  </p>
                  <textarea
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    rows={5}
                    placeholder={tLocal.codePlaceholderCode}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {tLocal.envLabel}
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    {tLocal.envDesc}
                  </p>
                  <select
                    name="sandboxEnv"
                    value={formData.sandboxEnv}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-slate-700 font-semibold"
                  >
                    <option value="Node.js 22 (LTS)">Node.js 22 (LTS)</option>
                    <option value="Node.js 20 (LTS)">Node.js 20 (LTS)</option>
                    <option value="React 19 + TypeScript (Vite)">React 19 + TypeScript (Vite)</option>
                    <option value="React 18 + TypeScript (Vite)">React 18 + TypeScript (Vite)</option>
                    <option value="Python 3.12 (Standard)">Python 3.12 (Standard)</option>
                    <option value="Python 3.10 (Data Science / Pandas)">Python 3.10 (Data Science / Pandas)</option>
                    <option value="Python 3.11 (Django / FastAPI)">Python 3.11 (Django / FastAPI)</option>
                    <option value="Go 1.22 (Go Playground)">Go 1.22 (Go Playground)</option>
                    <option value="Rust 1.78 (Cargo Sandbox)">Rust 1.78 (Cargo Sandbox)</option>
                    <option value="Java 21 (OpenJDK / Gradle)">Java 21 (OpenJDK / Gradle)</option>
                    <option value="Ruby 3.3 (Standard)">Ruby 3.3 (Standard)</option>
                    <option value="PHP 8.3 (CLI)">PHP 8.3 (CLI)</option>
                    <option value="Bash / Shell Script (Alpine 3.19)">Bash / Shell Script (Alpine 3.19)</option>
                    <option value="Docker (Alpine Container Runtime)">Docker (Alpine Container Runtime)</option>
                    <option value="PostgreSQL 16 (Ephemeral DB)">PostgreSQL 16 (Ephemeral DB)</option>
                    <option value="MySQL 8.0 (Ephemeral DB)">MySQL 8.0 (Ephemeral DB)</option>
                    <option value="Redis 7.2 (Cache Sandbox)">Redis 7.2 (Cache Sandbox)</option>
                    <option value="C++ (GCC 13 / Alpine)">C++ (GCC 13 / Alpine)</option>
                    <option value=".NET 8 (C# CLI)">.NET 8 (C# CLI)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Info className="w-4 h-4 shrink-0" />
                {tLocal.trustEngineInfo || ' Trust Score will be computed on save.'}
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer text-sm"
              >
                {isSubmitting ? tLocal.savingText : tLocal.buttonSubmit}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
