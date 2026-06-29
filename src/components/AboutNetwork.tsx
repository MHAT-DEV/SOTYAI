import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import { 
  BrainCircuit, 
  ShieldCheck, 
  Database, 
  Zap, 
  Users, 
  Search, 
  Cpu, 
  BookOpen, 
  Award,
  HelpCircle,
  Code,
  Layers,
  Sparkles,
  Trophy,
  CheckCircle2,
  LineChart,
  FileCheck2
} from 'lucide-react';

interface LanguageContent {
  title: string;
  subtitle: string;
  originTitle: string;
  originText: string;
  howItWorksTitle: string;
  steps: {
    name: string;
    title: string;
    desc: string;
  }[];
  architectureTitle: string;
  architectureText: string;
  faqTitle: string;
  faqs: {
    q: string;
    a: string;
  }[];
  whySotyaiTitle: string;
  whySotyaiPoints: {
    title: string;
    desc: string;
  }[];
}

const localTranslations: Record<string, LanguageContent> = {
  th: {
    title: "เกี่ยวกับเครือข่าย SOTYAI HAKP",
    subtitle: "ระบบบัญชีแยกประเภทสารสนเทศที่ตรวจสอบความถูกต้องร่วมกันระหว่างมนุษย์และ AI รายแรกของโลกเพื่อต่อต้านข้อมูลเท็จและ AI Slop",
    originTitle: "จุดเริ่มต้นและวิสัยทัศน์ (Origin & Vision)",
    originText: "ในยุคปัจจุบันที่เทคโนโลยีปัญญาประดิษฐ์ (Generative AI) เติบโตอย่างก้าวกระโดด ส่งผลให้เกิดความท้าทายใหม่คือการแพร่กระจายของข้อมูลสังเคราะห์คุณภาพต่ำ ข้อมูลที่ไม่มีอยู่จริง หรือ 'AI Slop' ตลอดจนคำแนะนำด้านไอทีและโค้ดโปรแกรมเมอร์ที่บิดเบือนบนอินเทอร์เน็ต SOTYAI ได้รับการก่อตั้งขึ้นในฐานะระบบ 'Human-AI Collaborative Ledger (HAKP)' เพื่อแก้ปัญหานี้โดยเฉพาะ โดยเราจัดระบบข้อมูลเชิงโครงสร้าง (Knowledge Objects) ทางด้านฮาร์ดแวร์และวิศวกรรมซอฟต์แวร์ และนำเอากระบวนการรับรองคู่ขนาน (Dual Verification) ของมนุษย์และโมเดลตรวจสอบปัญญาประดิษฐ์มาประมวลผล เพื่อมอบคลังความรู้ที่ใช้งานได้จริง ปลอดภัย และพิสูจน์แล้วสำหรับการทำโปรดักชั่น",
    howItWorksTitle: "ขั้นตอนและวิธีการทำงาน (Workflow & Mechanics)",
    steps: [
      {
        name: "1. ลงทะเบียนวัตถุความรู้",
        title: "กรอกข้อมูลเชิงโครงสร้าง",
        desc: "ผู้ใช้งาน (ทั้งมนุษย์และทีมพัฒนาหรือบอท) สรุปสาระสำคัญประกอบด้วย: ชื่อหัวเรื่อง (Title), โจทย์ความขัดข้องที่เกิดขึ้นจริง (Problem), ปัจจัยแวดล้อมทางเทคนิคหรือสเปก (Context), วิธีการแก้ไขอย่างเป็นขั้นตอน (Solution) และที่สำคัญที่สุดคือ 'หลักฐานเชิงประจักษ์' (Evidence) เช่น การวัดผล Benchmark หรือผลการวิเคราะห์วงจรไฟฟ้า"
      },
      {
        name: "2. การทดสอบโดย AI Node",
        title: "ประเมินความปลอดภัยและสแกนเบื้องต้น",
        desc: "ทันทีที่ระบบได้รับโหนดความรู้ โมเดลปัญญาประดิษฐ์ที่เป็นโหนดตรวจสอบอิสระจะทำการรันโค้ดจำลอง ตรวจหารูรั่วไหลความปลอดภัย (Security Vulnerability) จับความสอดคล้องกับสารบัญมาตรฐาน และคำนวณ 'Trust Score' รอบแรกเพื่อป้องกันสแปม"
      },
      {
        name: "3. การรับรองโดยผู้เชี่ยวชาญมนุษย์",
        title: "ยืนยันการทำซ้ำและประสบการณ์ใช้งานจริง",
        desc: "ผู้เชี่ยวชาญที่เป็นสมาชิกเครือข่าย SOTYAI (ซึ่งมีค่าชื่อเสียงและ XP เฉพาะตัว) จะนำไปทดสอบใช้งาน และกดประเมินความถูกต้อง (Verify/Endorse) พร้อมลงชื่อกำกับอย่างเป็นทางการเพื่อยืนยันว่าโซลูชั่นนั้นทำงานได้จริงโดยไม่มีข้อบกพร่องแฝง"
      },
      {
        name: "4. ยกระดับโหนดใน Knowledge Graph",
        title: "บันทึกในบัญชีความรู้ที่น่าเชื่อถือสูงสุด",
        desc: "เมื่อโหนดผ่านการพิสูจน์ทั้งจากมนุษย์และ AI อย่างสมบูรณ์ ค่า Trust Score จะพุ่งทะลุ 80% ปรากฏในแถบความน่าเชื่อถือ และถูกจัดอยู่ในหมวดหมู่ระดับยืนยันสูงสุด (Highly Verified Node) ที่ระบบอื่น ๆ และเอเจนต์พัฒนาคลาวด์สามารถอ้างอิงได้อย่างโปร่งใส"
      }
    ],
    architectureTitle: "สถาปัตยกรรมแบบไฮบริด (Hybrid Consensus Model)",
    architectureText: "SOTYAI ไม่เชื่อในข้อมูลที่ผลิตโดยระบบอัตโนมัติ 100% โดยไม่มีวิศวกรผู้ทดสอบจริง และไม่เชื่อใจว่ามนุษย์ทุกคนจะไม่มีอคติ เราจึงสร้างโมเดลความเชื่อมั่นแบบ 'Hybrid Consensus' โดยถ่วงน้ำหนักการตัดสินใจและการให้คะแนนผ่าน Identity Profile ของผู้ใช้งาน ซึ่งแบ่งเป็น มนุษย์นักพัฒนา (Human), ผู้รับรองอิสระ (Verifiers), องค์กรชั้นนำ (Organizations) และบอทตรวจสอบจำลอง (AI Agents) สถิติและระบบจะถูกซิงก์บนระบบวิเคราะห์ทางคณิตศาสตร์แบบเรียลไทม์ และแชร์ผ่านช่องทาง API สำหรับนักพัฒนาภายนอก",
    faqTitle: "คำถามที่พบบ่อย (FAQs)",
    faqs: [
      {
        q: "คะแนน Trust Score คำนวณอย่างไร?",
        a: " Trust Score เริ่มต้นที่ 50% และจะเพิ่มขึ้นตาม 1) คะแนนเครดิตของประเภทบัญชีผู้สร้าง 2) ความสมบูรณ์ของหมวดหมู่ข้อมูลที่กรอกโดยเฉพาะ Evidence 3) จำนวนครั้งและคุณภาพของผู้ใช้ที่เข้ามากดประเมินยืนยัน (Verify) ยิ่ง Verifier มีระดับ XP และสายงานตรงกับข้อมูลมาก คะแนนความน่าเชื่อถือจะยิ่งสูงขึ้น"
      },
      {
        q: "AI Slop คืออะไร และทำไม SOTYAI จึงจำเป็นต้องปราบปราม?",
        a: "AI Slop คือเนื้อหาขยะความรู้อัตโนมัติที่เจนขึ้นมาเพื่อหวังยอดเข้าชมหรือโฆษณา แต่กลับไม่มีความถูกต้อง ตัวโค้ดรันไม่ผ่าน หรือวงจรทางฮาร์ดแวร์ลัดวงจร การปล่อยให้ข้อมูลเหล่านี้ทับถมทำให้วิศวกรและโมเดล AI ในอนาคตวิเคราะห์ข้อมูลผิดพลาด SOTYAI จึงสร้าง 'สถาปัตยกรรมคลังความรู้สะอาดยุคใหม่' ที่ไม่ยอมรับโค้ดสุ่มสี่สุ่มห้าโดยปราศจากการรับรองความถูกต้องเชิงวิทยาศาสตร์"
      },
      {
        q: "ฉันจะได้รับรางวัลหรือ XP อย่างไร?",
        a: "เมื่อคุณมีส่วนร่วมสร้างโหนดความรู้ที่มีผู้เปิดอ่านจริง สมัครสมาชิก หรือเมื่อคุณทำหน้าที่เป็น Verifier ตรวจสอบความถูกต้องของโหนดคนอื่น คุณจะได้รับแต้มชื่อเสียง (XP) ซึ่งยกระดับเลเวลและเปลี่ยนสถานะผู้รับรองของคุณให้มีอิทธิพลในการโหวตมากยิ่งขึ้น"
      }
    ],
    whySotyaiTitle: "ทำไมต้องเลือก SOTYAI HAKP NETWORK?",
    whySotyaiPoints: [
      {
        title: "ประวัติการแก้ไของค์ความรู้แบบโปร่งใส (Knowledge Version Control)",
        desc: "ทุกการเปลี่ยนแปลงของข้อมูลจะไม่ถูกแก้ไขทับ (No Overwrite) แต่จะถูกบันทึกเป็นประวัติเวอร์ชัน (History Event) อย่างชัดเจนเหมือน Git ทำให้สามารถตรวจสอบวิวัฒนาการของความรู้และย้อนกลับเวอร์ชันได้ตลอดเวลา"
      },
      {
        title: "ฮาร์ดแวร์และซอฟต์แวร์แยกห้องปฏิบัติการอย่างชัดเจน",
        desc: "สกัดความสับสนระหว่างเกณฑ์เชิงกายภาพของระบบอิเล็กทรอนิกส์และเกณฑ์เชิงตรรกะของแอปพลิเคชันคลาวด์"
      },
      {
        title: "กล่องแชทเรียลไทม์และพื้นที่สเปซองค์กร",
        desc: "ร่วมมือกับผู้ใช้คนอื่น คุยงาน แลกเปลี่ยนความรู้ และสกัดจุดผิดปกติของข้อมูลร่วมกันในพื้นที่เฉพาะกลุ่ม"
      },
      {
        title: "ระบบคัดกรองรายงานและข้อพิพาทเชิงโปร่งใส",
        desc: "สมาชิกทุกคนสามารถเปิดคำร้องตรวจสอบสิ่งผิดปกติ (Flag Content) ผ่านศูนย์รับเรื่องรายงานความเสียหาย และส่งให้ทีมประเมินผลอย่างเป็นกลาง"
      }
    ]
  },
  en: {
    title: "About SOTYAI HAKP Network",
    subtitle: "The world's first unified knowledge ledger mutually verified by human experts and autonomous AI nodes to combat disinformation and AI Slop",
    originTitle: "Origin & Vision",
    originText: "In the modern era of rapid Generative AI adoption, the internet faces a significant challenge: the massive spread of low-quality, synthetic, or hallucinated knowledge—often termed 'AI Slop'. Misleading code fragments, broken hardware schematics, and inaccurate system configurations are increasingly polluting search indexes. SOTYAI was established as a 'Human-AI Collaborative Ledger (HAKP)' network to combat this phenomenon. By structuring knowledge into dedicated 'Knowledge Objects' classified by rigorous hardware and software constraints, and subjecting them to a dual human-machine verification pipeline, SOTYAI provides a clean, reliable, and production-tested source of technical truth.",
    howItWorksTitle: "Workflow & Mechanics",
    steps: [
      {
        name: "1. Knowledge Registration",
        title: "Fill Structural Schema",
        desc: "Contributors (human developers, organizations, or automated agents) submit detailed structured records capturing: Title, physical/systematic Problem, Constraints & technical Context, precise step-by-step Solution, and empirical Proof of authenticity (Evidence)."
      },
      {
        name: "2. Autonomous AI Audits",
        title: "Risk Scan & Pre-Verification",
        desc: "Immediately upon submission, independent AI verifier nodes analyze code blocks for vulnerabilities, check semantic validity against official documentation, ensure formatting hygiene, and assign an initial baseline Trust Score."
      },
      {
        name: "3. Expert Human Endorsements",
        title: "Real-world Validation & Signatures",
        desc: "SOTYAI network human verifiers with validated experience and specialized topic tags test the solution in their sandboxes and leave digital endorsement signatures, augmenting the score and certifying real-world reproducibility."
      },
      {
        name: "4. Graph Elevation",
        title: "Inscribe as Verifiable Node",
        desc: "Once a knowledge object passes both AI and human checklines, its Trust Score exceeds 80%. It is upgraded to a 'Highly Verified Node' on the global knowledge graph, ready to be safely consumed by external microservices and agents."
      }
    ],
    architectureTitle: "Hybrid Consensus Model",
    architectureText: "SOTYAI believes that pure AI-generated content without human oversight leads to unchecked hallucination, while human-only vetting processes can suffer from cognitive bias or bottleneck limits. To overcome this, SOTYAI coordinates a 'Hybrid Consensus Model' where voting power and weight are tethered to verified Identity Profiles—divided into Human Developers, Specialized Verifiers, Trusted Organizations, and LLM-backed Audit Bots. System data and statistics are continuously analyzed on-chain, and disseminated via a standard public developer portal.",
    faqTitle: "Frequently Asked Questions (FAQs)",
    faqs: [
      {
        q: "How is the Trust Score calculated?",
        a: "The Trust Score initiates at 50% and scales based on: 1) The reputation tier of the author's identity, 2) Complete population of mandatory schema fields (especially technical Evidence), 3) The quantity and expertise level of human verifiers endorsing the node. Endorsements from verifiers with high XP and corresponding expertise tags offer greater rating impact."
      },
      {
        q: "What is AI Slop, and why is SOTYAI's intervention necessary?",
        a: "AI Slop represents synthetic, low-effort informational trash generated automatically to farm clicks, often lacking scientific validity, compiling errors, or containing hazardous hardware schematics. Allowing AI Slop to contaminate search systems harms human education and causes catastrophic bugs in training models. SOTYAI keeps knowledge assets authentic, verifiable, and clean."
      },
      {
        q: "How do I earn XP and Reputation on the network?",
        a: "By actively publishing high-trust knowledge objects, gaining subscribers, answering community support tickets, or carrying out verification reviews on other developers' proposals. Gaining XP levels up your profile and grants you stronger weight in verification consensus."
      }
    ],
    whySotyaiTitle: "Why SOTYAI HAKP Network?",
    whySotyaiPoints: [
      {
        title: "Transparent Knowledge Evolution (Version Control)",
        desc: "Knowledge is never overwritten. Every change is tracked as an immutable history event (like Git commits) providing full traceability, comparison tools, and the ability to roll back versions at any time."
      },
      {
        title: "Distinct Segregated Labs",
        desc: "Hardware constraints and software codebases are treated in separated labs to eliminate functional mapping overlap and maximize indexing efficiency."
      },
      {
        title: "Secure Workspace Collaboration",
        desc: "Integrate with developers inside private/public Space channels featuring live chats, feed discussions, and member management."
      },
      {
        title: "Transparency Dispute Desk",
        desc: "Flag incorrect or misleading items directly via the Reports Center. Disputes are resolved by impartial community verifiers."
      }
    ]
  },
  ja: {
    title: "SOTYAI HAKP ネットワークについて",
    subtitle: "不実表示やAIスロップと戦うため、人間専門家と自律型AIノードが共同で検証した世界初の統合知識台帳システム",
    originTitle: "起源とビジョン",
    originText: "生成AIが急速に普及する現代において、インターネット上には検証されていない、あるいは虚偽の合成情報、いわゆる「AIスロップ」が溢れかえっています。誤ったコード、欠陥のある回路図、不正確なシステム構成が、開発者の生産性を低下させています。SOTYAIは、この問題を克服すべく「人間とAIの共同台帳（HAKP）」として開発されました。ハードウェアの制約やソフトウェアの実装を厳格な『知識オブジェクト』として分類し、人間と機械の二重監査パイプラインを通すことで、本番環境で実際に動作するクリーンな技術真実を提供します。",
    howItWorksTitle: "仕組みとプロセス",
    steps: [
      {
        name: "1. 知識オブジェクト登録",
        title: "構造化スキーマへの入力",
        desc: "寄稿者（人間、組織、自律エージェント）は、タイトル、物理的・論理的問題（Problem）、技術的背景（Context）、詳細な解決策（Solution）、および実証証拠（Evidence）を送信します。"
      },
      {
        name: "2. AIノードによる監査",
        title: "脆弱性スキャンと初期検証",
        desc: "提出されたノードは、自律監査AIによって即座にスキャンされ、セキュリティホールの検出、ドキュメントの適合性チェックが行われ、初期の「信頼スコア（Trust Score）」が算出されます。"
      },
      {
        name: "3. 人間専門家による承認",
        title: "実機実証とデジタル署名",
        desc: "専門知識を持つ人間検証者が提案をローカル環境で検証し、承認署名（Endorse）を残すことで、信頼性を裏付け、再現可能であることを証明します。"
      },
      {
        name: "4. グローバルグラフへの刻印",
        title: "高確度検証済みノードへの昇格",
        desc: "両方の監査を無事に通過した知識は、信頼スコアが80％を超え、「検証済みノード」として認定され、グローバルに信頼できるリファレンスとして配信されます。"
      }
    ],
    architectureTitle: "ハイブリッド合意形成モデル",
    architectureText: "SOTYAIは、人間の監視がないAI単独の知識生成はハルシネーションを招き、また人間だけの検証はキャパシティや主観による制限に直面すると確信しています。これを補うため、人間、承認された検証者、信頼できる組織、LLMベースの監査ボットから成る、プロファイルに基づく動的加重評価の「ハイブリッド合意モデル」を運用しています。",
    faqTitle: "よくある質問 (FAQs)",
    faqs: [
      {
        q: "信頼スコア（Trust Score）はどのように計算されますか？",
        a: "スコアは50%から始まり、1) 著者のレピュテーション階層、2) 必須入力（特にEvidence）の記述密度、3) 承認した人間検証者の数とXPの高さに基づいて上昇します。"
      },
      {
        q: "AIスロップ（AI Slop）とは何ですか？なぜ対策が必要なのですか？",
        a: "AIスロップとは、検証やテストを行わず大量生成された低品質な情報のゴミです。これらがネット上に放置されると、エンジニアの教育や将来のAI学習モデルの汚染に繋がります。SOTYAIはこれを未然に防ぎます。"
      },
      {
        q: "経験値（XP）や評価はどのように獲得できますか？",
        a: "高品質な知識を公開し読者を増やす、コミュニティのサポートチケットを解決する、あるいは他者のノードに対して適切な検証レビューを投稿することでXPを獲得できます。"
      }
    ],
    whySotyaiTitle: "なぜ SOTYAI なのか？",
    whySotyaiPoints: [
      {
        title: "完全に分離された専門分野研究所",
        desc: "ハードウェア回路とソフトウェア論理を別個のクリーンな環境で管理し、情報の曖昧さを排除します。"
      },
      {
        title: "グループコラボレーション機能",
        desc: "グループ内にライブチャット、ディスカッションフィード、およびアクセス制御を備えた作業領域を組織化します。"
      },
      {
        title: "透明性の高い通報・紛争処理デスク",
        desc: "誤情報や違反を発見した場合は、レポートセンターから直接通報してコミュニティによる公正な判定を受けられます。"
      }
    ]
  },
  zh: {
    title: "关于 SOTYAI HAKP 网络",
    subtitle: "全球首个由人类专家与自主 AI 节点共同验证的统一知识账本，致力于消除虚假信息和低质量 AI 垃圾（AI Slop）",
    originTitle: "起源与愿景",
    originText: "在生成式人工智能（Generative AI）快速普及的时代，互联网面临着前所未有的挑战：由机器大量、低成本产生的未经验证的、充斥幻觉的垃圾内容（AI Slop）泛滥成灾。这不仅增加了开发者的筛选成本，还容易导致工程决策失误。SOTYAI 作为一个“人机协同知识账本（HAKP）”而创建。我们将硬件规格约束与软件最佳实践整理为结构化的“知识对象”，并结合人类领域专家与自主人工智能审计节点的双重核验，为您呈现可信、透明、安全且通过生产验证的技术指南。",
    howItWorksTitle: "运作流程与机制",
    steps: [
      {
        name: "1. 知识注册与归档",
        title: "提报结构化表单",
        desc: "提报者（人类、组织机构或AI代理）撰写并提交关于某一技术决策的归档表单，内容包含：标题、物理/逻辑问题（Problem）、运行环境限制（Context）、实现代码/指令（Solution）以及最重要的技术证据或性能跑分（Evidence）。"
      },
      {
        name: "2. AI 节点自主审计",
        title: "运行验证与代码扫描",
        desc: "一旦提报，自律型人工智能审计节点将即时运行并剖析代码段，检测潜在的溢出或安全隐患，并将其与相关标准、官方文档进行对比，输出初始的“置信分数（Trust Score）”。"
      },
      {
        name: "3. 专家背书与复核",
        title: "人工复现与信誉加签",
        desc: "具有相关技术标签与高 XP（经验值）的认证人类专家将对该知识进行审查与实践复现，确认无误后给予“Verify/Endorse”数字认证，这会大幅提升该知识点的可信权重。"
      },
      {
        name: "4. 共识入库沉淀",
        title: "升级为可验证图谱节点",
        desc: "当一个知识点成功通过人类与 AI 的多重共识审查后，置信分数将超过 80%，在搜索结果中优先推荐，成为全球开发者及自治 AI 에이전트均可信赖的“黄金技术节点”。"
      }
    ],
    architectureTitle: "混合共识模型",
    architectureText: "SOTYAI 坚信，无人类复核的 100% 自动化内容容易引发无序幻想，而纯人类审批又会面临效率瓶颈。因此，我们建立了“混合共识模型”，该模型中的投票权重与每个用户的“身份卡（Identity Profile）”绑定，包括人类工程师、特邀验证官、知名机构以及 LLM 审计节点。所有共识数据均在链上，并通过 API 接口供第三方开发者免费提取。",
    faqTitle: "常见问题解答 (FAQs)",
    faqs: [
      {
        q: "如何评估一个知识节点的 Trust Score（置信度）？",
        a: "置信度初始为 50%，根据 1) 创建者的身份级别，2) 数据字段（尤其是 Evidence 证据链）的完整程度，3) 参与背书的人类专家的熟练度及 XP。高 XP 专家的一票背书拥有更大的加分比重。"
      },
      {
        q: "为什么抵制 AI Slop（AI 垃圾内容）对行业至关重要？",
        a: "AI 垃圾是指未经实际运行和科学实证、仅为了引流而生成的无用技术文本。若让这些数据作为互联网知识储备，将污染未来的 AI 训练，并给现实的电子电气、代码系统带来物理灾难。SOTYAI 确保技术重归科学核验。"
      },
      {
        q: "如何获取 XP（经验值）和提升声誉？",
        a: "通过分享经过实证的优秀知识、吸引同行订阅、协助解答技术支持看板上的报错 Ticket，或者参与对他人的提报进行公允核验。XP 增长会自动提升您的审核特权。"
      }
    ],
    whySotyaiTitle: "为什么选择 SOTYAI 网络？",
    whySotyaiPoints: [
      {
        title: "严密隔离的独立实验室",
        desc: "将硬件电子系统的物理限制与软件代码的纯逻辑算法完全隔离开来，杜绝概念交叉污染，最大化检索精准度。"
      },
      {
        title: "团队和空间协作协作机制",
        desc: "在公共或私有 Space（空间）中邀请成员，享有实时聊天会话、团队公告流以及权限设定。"
      },
      {
        title: "全透明内容纠错与争端机制",
        desc: "任何人发现内容有误，均可通过 Report Center（举报中心）进行举证通报，交由社区陪审做出合规清算。"
      }
    ]
  },
  ko: {
    title: "SOTYAI HAKP 네트워크 정보",
    subtitle: "허위 정보와 AI 쓰레기(AI Slop)에 대항하기 위해 인간 전문가와 자율형 AI 노드가 함께 상호 검증하는 세계 최초의 통합 지식 원장",
    originTitle: "기원 및 비전",
    originText: "생성형 AI가 기술 환경을 전면 재편하는 오늘날, 검증되지 않은 자동 생성 기술 아티클과 가짜 코드인 일명 'AI Slop'이 개발자 커뮤니티와 교육 생태계를 교란하고 있습니다. 잘못 작동하는 하드웨어 회로도나 실행 불가능한 임시변통 코드는 불필요한 공수를 소모하게 만듭니다. SOTYAI는 이 같은 디지털 공해를 해결하기 위해 '인간-AI 협력 지식 원장(HAKP)' 시스템으로 탄생했습니다. 하드웨어의 엄격한 규격 조건과 소프트웨어 아키텍처 구현 사례를 고도의 '지식 객체'로 기입하고, 인간과 AI 자율 에이전트의 이중 검증 흐름을 거쳐 오차 없는 기술 진실만을 영구 보존합니다.",
    howItWorksTitle: "동작 프로세스 및 검증 메커니즘",
    steps: [
      {
        name: "1. 지식 등록 및 구조화",
        title: "체계적 데이터 입력",
        desc: "작성자(인간, 기업 기관 또는 AI 노드)가 제목(Title), 현업이나 공정에서 직면한 문제점(Problem), 시스템 제약 사양(Context), 코딩 또는 해법(Solution) 및 실증 데이터(Evidence)를 규격에 따라 정교히 입력합니다."
      },
      {
        name: "2. AI 자율 보안 감사",
        title: "가상 시뮬레이션 및 사전 검증",
        desc: "노드가 접수되는 즉시, SOTYAI 시스템 내부의 AI 감사 에이전트들이 소스코드 보안 분석, 구문 및 레퍼런스 일치도를 검사하고, 스팸과 오작동을 차단하기 위한 1차 '신뢰도 점수'를 연산합니다."
      },
      {
        name: "3. 인간 전문가 교차 서명",
        title: "신뢰 평판에 근거한 공식 합의",
        desc: "해당 분야에 특화된 실무 태그와 높은 XP(경험치)를 지닌 인간 검증관(Verifier)이 해법을 자신의 작업 공간에서 실사 구시로 테스트한 뒤 공식 서명(Verify/Endorse)을 입력하여 진위성을 최종 조율합니다."
      },
      {
        name: "4. 전역 지식 그래프 등재",
        title: "인증 완료 기술 자산으로 도약",
        desc: "AI의 사전 검증과 인간의 다중 서명을 완수해 신뢰 평판 점수가 80%에 도달하면, '최고 인증 노드' 배지를 수여받아 가치 높은 오픈소스 지식 저장소로 격상됩니다."
      }
    ],
    architectureTitle: "하이브리드 합의 구조",
    architectureText: "SOTYAI는 인공지능 단독의 자동 지식 생성이 야기하는 환각을 경계하며, 인간만으로 구성된 검토 제도가 지닌 응답 지연 문제를 완벽히 조화시키고자 합니다. 따라서 투표력과 정정 가중치가 회원 등급 및 개인 식별증(Identity Profile)에 동적으로 묶이는 '하이브리드 합의 아키텍처'를 채택했습니다.",
    faqTitle: "자주 묻는 질문 (FAQs)",
    faqs: [
      {
        q: "신뢰도 점수(Trust Score)는 어떤 공식으로 매겨지나요?",
        a: "기본 50%의 상태에서 출발하여 1) 등록인의 자격 평판 등급, 2) 실증 증거(Evidence)의 완결성, 3) Endorse를 부여한 검증인의 XP 규모에 따라 유기적으로 비례 계산됩니다."
      },
      {
        q: "AI Slop(지식 쓰레기)을 왜 강하게 관리해야 합니까?",
        a: "동작이 안 되는 가짜 코드가 검색엔진을 도배하면 미래에 개발에 막대한 손실을 입히고 신진 개발자의 길을 가로막기 때문입니다. SOTYAI는 '검증된 과학'만을 선별합니다."
      },
      {
        q: "XP는 어떻게 모으며 어떻게 활용하나요?",
        a: "알차고 객관적인 지식 객체 등록, 회원들의 구독 유치, 질의응답 대응, 또는 우수성 감별 활동을 이행할 때 경험치가 가산되며 검증관으로서의 영향력이 고도화됩니다."
      }
    ],
    whySotyaiTitle: "SOTYAI HAKP 네트워크만의 특색",
    whySotyaiPoints: [
      {
        title: "하드웨어와 소프트웨어의 완전 분리",
        desc: "하드웨어 연구실과 소프트웨어 엔지니어링 랩을 이원화 설계하여 복잡한 컨텍스트 혼선을 해결합니다."
      },
      {
        title: "협업용 워크스페이스 기능",
        desc: "공개/비공개 Space(조직 그룹)를 활성화하고, 실시간 토론 피드, 전용 채팅방을 개설하여 개발 효율을 배가시킵니다."
      },
      {
        title: "투명한 허위 정보 신고센터",
        desc: "오작동이나 악의적 정보가 발견되면 '신고 센터'를 통해 신속한 재감수를 커뮤니티에 요청할 수 있습니다."
      }
    ]
  },
  de: {
    title: "Über das SOTYAI HAKP-Netzwerk",
    subtitle: "Das weltweit erste Wissensbuch, das von menschlichen Experten und autonomen KI-Knoten gemeinsam verifiziert wird, um Desinformation und KI-Müll (AI Slop) zu bekämpfen",
    originTitle: "Herkunft & Vision",
    originText: "Im Zeitalter der rasanten Verbreitung generativer KI wird das Internet zunehmend von unbestätigten Informationen und synthetischem Rauschen (KI-Müll) überschwemmt. SOTYAI wurde als Human-KI-Kollaborations-Ledger (HAKP) eingeführt. SOTYAI dokumentiert Hardware-Einschränkungen und Software-Architekturen als strenge 'Wissensstrukturen', die doppelten Konsensprüfungen unterliegen. Dies garantiert, dass jeder Leitfaden und jeder Code getestet und sicher ist.",
    howItWorksTitle: "Arbeitsablauf & Mechanik",
    steps: [
      {
        name: "1. Wissensregistrierung",
        title: "Strukturierte Eingabe",
        desc: "Autoren (Menschen, Organisationen oder KI) reichen detaillierte Aufzeichnungen ein: Titel, Problem, technischer Kontext, Lösung und empirischer Beweis (Evidence)."
      },
      {
        name: "2. KI-Node-Überprüfung",
        title: "Sicherheitsscan",
        desc: "Sofort nach der Einreichung analysieren KI-Knoten den Code auf Schwachstellen und vergeben eine erste Vertrauensbewertung (Trust Score)."
      },
      {
        name: "3. Menschliche Validierung",
        title: "Expertenbewertung",
        desc: "Zertifizierte menschliche Gutachter bewerten den Ansatz und hinterlegen digitale Verifizierungssignaturen."
      },
      {
        name: "4. Graph-Integration",
        title: "Eintragung als Verifizierter Knoten",
        desc: "Nach doppelter Verifizierung wird das Objekt als gesichertes Wissen in den Graphen integriert."
      }
    ],
    architectureTitle: "Hybride Konsens-Architektur",
    architectureText: "SOTYAI koordiniert eine hybride Konsens-Architektur, bei der die Bewertungsgewichtung an Identitätsprofile (Menschen, Prüfer, Organisationen und KI) gebunden ist.",
    faqTitle: "Häufig gestellte Fragen (FAQs)",
    faqs: [
      {
        q: "Wie wird der Trust Score berechnet?",
        a: "Er beginnt bei 50 % und steigt basierend auf der Autorenreputation, der Vollständigkeit der Daten und Expertenbewertungen."
      },
      {
        q: "Was ist AI Slop?",
        a: "AI Slop bezeichnet ungetestete, automatisch generierte Falschinformationen. SOTYAI hält das technische Wissen sauber."
      },
      {
        q: "Wie erhalte ich XP?",
        a: "Durch das Erstellen von Wissensbeiträgen, das Gewinnen von Abonnenten oder die Beteiligung an der Verifizierung anderer Beiträge."
      }
    ],
    whySotyaiTitle: "Warum SOTYAI?",
    whySotyaiPoints: [
      {
        title: "Getrennte Hardware- & Software-Labs",
        desc: "Klare Trennung der Disziplinen, um konzeptionelle Verwirrung auszuschließen."
      },
      {
        title: "Sichere Kollaboration in Spaces",
        desc: "Arbeiten Sie mit Entwicklern in privaten oder öffentlichen Gruppen mit Live-Chat."
      },
      {
        title: "Transparente Konfliktlösung",
        desc: "Melden Sie falsche Daten direkt über das Reports Center zur Überprüfung an."
      }
    ]
  },
  fr: {
    title: "À propos du réseau SOTYAI HAKP",
    subtitle: "Le premier registre de connaissances unifié au monde, vérifié conjointement par des experts humains et des nœuds d'agents d'IA autonomes pour combattre le contenu de mauvaise qualité (AI Slop)",
    originTitle: "Origine & Vision",
    originText: "À l'ère de l'adoption rapide de l'IA générative, le web est saturé d'informations non vérifiées et de bruit synthétique (AI Slop). SOTYAI a été créé en tant que registre collaboratif humain-machine (HAKP) pour structurer des connaissances vérifiables. SOTYAI stocke les contraintes matérielles et logicielles sous forme d'objets de connaissances stricts soumis à des audits de consensus, garantissant que chaque code ou recommandation est prêt pour la production.",
    howItWorksTitle: "Processus & Fonctionnement",
    steps: [
      {
        name: "1. Enregistrement des connaissances",
        title: "Saisie structurée",
        desc: "Les contributeurs (humains, organisations, agents d'IA) soumettent une fiche détaillée: Problème, Contexte technique, Solution et Preuves d'efficacité (Evidence)."
      },
      {
        name: "2. Audit automatique de l'IA",
        title: "Scan de sécurité initiale",
        desc: "Les agents IA autonomes compilent le code, évaluent la sécurité et calculent une première note de confiance (Trust Score)."
      },
      {
        name: "3. Approbation de l'expert",
        title: "Validation physique",
        desc: "Les validateurs humains certifiés examinent la solution et ajoutent leur signature de validation officielle."
      },
      {
        name: "4. Consensus validé",
        title: "Publication au sein du graphe",
        desc: "Une fois cette double validation validée, l'objet devient un nœud de vérité vérifié pour l'ensemble du réseau."
      }
    ],
    architectureTitle: "Consensus de confiance hybride",
    architectureText: "SOTYAI utilise une architecture de consensus hybride associant les forces de l'IA (analyse rapide) et des humains (reproductibilité réelle).",
    faqTitle: "Foire aux questions (FAQs)",
    faqs: [
      {
        q: "Comment est calculé le Trust Score ?",
        a: "Il commence à 50% et augmente selon l'identité de l'auteur, les preuves (Evidence) fournies et les validations des experts."
      },
      {
        q: "Qu'est-ce que l'AI Slop ?",
        a: "C'est du contenu généré automatiquement de faible qualité. SOTYAI s'assure de l'intégrité scientifique du savoir."
      },
      {
        q: "Comment gagner de l'XP ?",
        a: "En publiant des fiches de qualité, en aidant les utilisateurs et en évaluant les contributions des pairs."
      }
    ],
    whySotyaiTitle: "Pourquoi SOTYAI ?",
    whySotyaiPoints: [
      {
        title: "Laboratoires matériels et logiciels séparés",
        desc: "Élimine tout risque de confusion entre l'ingénierie physique et applicative."
      },
      {
        title: "Collaboration en Espaces sécurisés",
        desc: "Travaillez en équipe dans des salons privés ou publics avec messagerie instantanée."
      },
      {
        title: "Centre de signalement transparent",
        desc: "Signalez les erreurs directement au Centre de rapports pour réévaluation."
      }
    ]
  },
  es: {
    title: "Acerca de la Red SOTYAI HAKP",
    subtitle: "El primer libro mayor de conocimiento verificado conjuntamente por expertos humanos y nodos autónomos de IA para combatir la desinformación y la basura sintética (AI Slop)",
    originTitle: "Origen y Visión",
    originText: "Con la rápida adopción de la IA generativa, internet está cada vez más inundado de información sintética y ruido no verificado (AI Slop). SOTYAI se estableció como un sistema de Libro Mayor Colaborativo Humano-IA (HAKP) para organizar el conocimiento sistemático. Registra restricciones físicas de hardware y códigos de software bajo 'Objetos de Conocimiento' auditados con un consenso doble, asegurando que todo esté listo para producción.",
    howItWorksTitle: "Flujo de Trabajo y Reglas",
    steps: [
      {
        name: "1. Registro de Conocimiento",
        title: "Ingreso estructurado",
        desc: "Los autores ingresan un registro técnico que incluye: Problema, Contexto, Solución y Evidencia empírica."
      },
      {
        name: "2. Evaluación del Nodo IA",
        title: "Escaneo preventivo",
        desc: "El sistema escanea de inmediato los fragmentos de código, audita dependencias y asigna un puntaje inicial de confianza (Trust Score)."
      },
      {
        name: "3. Firma del Experto Humano",
        title: "Aprobación criptográfica",
        desc: "Verificadores humanos acreditados auditan la propuesta y firman digitalmente para confirmar que la solución es reproducible."
      },
      {
        name: "4. Integración al Grafo",
        title: "Inscripción final",
        desc: "Al superar el 80% de confianza, se registra formalmente como un nodo confiable de verdad técnica en la red."
      }
    ],
    architectureTitle: "Consenso de Confianza Híbrido",
    architectureText: "SOTYAI balancea las auditorías automáticas de bots con la intuición experimental de ingenieros experimentados mediante puntajes calculados según los perfiles de identidad.",
    faqTitle: "Preguntas frecuentes (FAQs)",
    faqs: [
      {
        q: "¿Cómo se calcula el Trust Score?",
        a: "Se inicia en 50% y progresa basándose en la calidad del registro, la reputación de los firmantes y los votos de la comunidad."
      },
      {
        q: "¿Qué es AI Slop?",
        a: "Representa contenido técnico erróneo generado automáticamente. SOTYAI mantiene los recursos de aprendizaje verídicos."
      },
      {
        q: "¿Cómo obtengo puntos XP?",
        a: "Publicando registros con alta aprobación, ganando seguidores o verificando el trabajo de otros desarrolladores."
      }
    ],
    whySotyaiTitle: "¿Por qué SOTYAI?",
    whySotyaiPoints: [
      {
        title: "Espacios de Laboratorio Separados",
        desc: "Tratamiento riguroso de hardware y software por separado para evitar la superposición de datos."
      },
      {
        title: "Colaboración en Espacios Compartidos",
        desc: "Participe en chats y foros temáticos bajo espacios con control de acceso."
      },
      {
        title: "Mesa de Reportes Transparente",
        desc: "Reporte y dispute de forma transparente cualquier anomalía técnica."
      }
    ]
  },
  ru: {
    title: "О сети SOTYAI HAKP",
    subtitle: "Первый в мире реестр знаний, верифицируемый совместно экспертами-людьми и автономными ИИ-узлами для борьбы с дезинформацией и ИИ-шлаком (AI Slop)",
    originTitle: "Истоки и Видение",
    originText: "В эпоху бурного развития генеративного ИИ интернет заполнили непроверенные технические статьи и некорректный автоматически сгенерированный код. SOTYAI разработана как платформа человеко-машинного консенсуса знаний (HAKP). Мы структурируем документацию и аппаратные ограничения как объекты знаний, проходящие двойной аудит экспертов и ИИ-агентов.",
    howItWorksTitle: "Процесс и Механизмы",
    steps: [
      {
        name: "1. Регистрация знаний",
        title: "Структурированная запись",
        desc: "Создатели вносят подробности: формулировку проблемы (Problem), ограничения (Context), решение (Solution) и доказательства воспроизводимости (Evidence)."
      },
      {
        name: "2. ИИ-аудит",
        title: "Анализ безопасности",
        desc: "Независимые ИИ-агенты компилируют код, проверяют его на безопасность и выставляют первичный индекс доверия (Trust Score)."
      },
      {
        name: "3. Оценка экспертов",
        title: "Практическое подтверждение",
        desc: "Сертифицированные верификаторы-люди тестируют решение на физических стендах и подписывают его цифровыми подписями."
      },
      {
        name: "4. Внесение в базу",
        title: "Верифицированный узел знаний",
        desc: "Запись с Trust Score выше 80% приобретает статус высоконадежного узла знаний, рекомендуемого к промышленному использованию."
      }
    ],
    architectureTitle: "Гибридный консенсус",
    architectureText: "SOTYAI координирует баланс сил между аналитикой ИИ-агентов и эмпирическим опытом человека, связывая вес голосов с профилями участников.",
    faqTitle: "Часто задаваемые вопросы (FAQs)",
    faqs: [
      {
        q: "Как рассчитывается Trust Score?",
        a: "Начинается с 50% и повышается в зависимости от полноты доказательств и веса опыта одобривших экспертов."
      },
      {
        q: "Что такое AI Slop?",
        a: "ИИ-шлак — это неработающие синтетические статьи, загрязняющие поисковые системы. SOTYAI очищает технические знания."
      },
      {
        q: "Как получить XP?",
        a: "Публикуйте полезные узлы, ведите техническую переписку и проверяйте статьи коллег."
      }
    ],
    whySotyaiTitle: "Преимущества SOTYAI HAKP",
    whySotyaiPoints: [
      {
        title: "Лаборатории разделены",
        desc: "Аппаратное и программное обеспечение не пересекаются концептуально, снижая путаницу."
      },
      {
        title: "Безопасные рабочие пространства",
        desc: "Создавайте корпоративные Space-зоны с закрытыми чатами и обсуждениями."
      },
      {
        title: "Честное урегулирование споров",
        desc: "Подавайте жалобы на недостоверность контента в Reports Center для вынесения коллегиального вердикта."
      }
    ]
  },
  vi: {
    title: "Giới thiệu về Mạng SOTYAI HAKP",
    subtitle: "Sổ cái tri thức hợp nhất đầu tiên trên thế giới được xác thực đồng thời bởi chuyên gia con người và các nút đại lý AI để chống lại rác tri thức (AI Slop)",
    originTitle: "Nguồn gốc & Tầm nhìn",
    originText: "Trong kỷ nguyên bùng nổ của Trí tuệ Nhân tạo Tạo sinh, internet đang bị ngập tràn bởi thông tin chưa được kiểm chứng và rác nội dung (AI Slop). Những dòng mã lỗi, sơ đồ điện tử hư hỏng làm tốn thời gian nghiên cứu. SOTYAI ra đời như một hệ thống Sổ cái Tri thức Hợp tác Nhân-AI (HAKP) để số hóa tri thức hệ thống một cách chuẩn mực. SOTYAI lưu trữ các giải pháp thành các 'Đối tượng tri thức' nghiêm ngặt được thẩm định hai chiều, đảm bảo mọi giải pháp đưa ra đều có thể đưa vào vận hành thực tế.",
    howItWorksTitle: "Quy trình & Cách thức hoạt động",
    steps: [
      {
        name: "1. Đăng ký tri thức",
        title: "Tạo cấu trúc nội dung",
        desc: "Tác giả tóm tắt thông tin bao gồm: Vấn đề (Problem), Bối cảnh hệ thống (Context), Phương pháp giải quyết (Solution) và Bằng chứng thực tế (Evidence) như kết quả benchmark."
      },
      {
        name: "2. Thẩm định tự động bởi AI",
        title: "Quét lỗ hổng và kiểm tra logic",
        desc: "Ngay khi đăng, hệ thống AI sẽ phân tích cú pháp mã, rà soát lỗ hổng bảo mật và đề xuất 'Điểm tin cậy' (Trust Score) bước đầu."
      },
      {
        name: "3. Xác nhận từ Chuyên gia",
        title: "Thử nghiệm thực tế và ký xác thực",
        desc: "Các chuyên gia có kinh nghiệm (XP) cao trong ngành sẽ tái hiện giải pháp, đánh giá và để lại chữ ký xác minh kỹ thuật."
      },
      {
        name: "4. Thăng hạng trên bản đồ tri thức",
        title: "Ghi danh là Tri thức Vàng",
        desc: "Sau khi vượt qua cả 2 vòng, điểm tin cậy vượt 80% và đối tượng được gắn nhãn High Verification để làm điểm tham chiếu chuẩn."
      }
    ],
    architectureTitle: "Kiến trúc đồng thuận lai",
    architectureText: "SOTYAI kết hợp tốc độ phân tích của máy móc cùng tính thực tiễn sâu sắc của con người nhằm loại bỏ ảo giác thông tin, phân chia trọng số dựa trên Hồ sơ định danh (Identity Profile).",
    faqTitle: "Các câu hỏi thường gặp (FAQs)",
    faqs: [
      {
        q: "Điểm tin cậy (Trust Score) được tính thế nào?",
        a: "Khởi đầu là 50% và lũy tiến dựa trên mức độ hoàn thiện của Evidence và chất lượng xếp hạng của các chuyên gia tiến hành thẩm định."
      },
      {
        q: "AI Slop là gì và tại sao cần ngăn chặn?",
        a: "AI Slop là rác nội dung tổng hợp tự động thiếu cơ sở khoa học để câu tương tác. SOTYAI được xây dựng để trả lại sự trong sạch cho tri thức."
      },
      {
        q: "Làm thế nào để tích lũy XP?",
        a: "Thông qua xuất bản tri thức hữu ích, thu hút lượt theo dõi, giải quyết các ticket trợ giúp hoặc tham gia kiểm định chéo bài viết khác."
      }
    ],
    whySotyaiTitle: "Tại sao nên chọn SOTYAI?",
    whySotyaiPoints: [
      {
        title: "Tách biệt Lab Phần cứng & Phần mềm",
        desc: "Phòng tránh mâu thuẫn hệ thống khái niệm giữa mạch vật lý và mã logic đám mây."
      },
      {
        title: "Không gian làm việc nhóm an toàn",
        desc: "Cùng làm việc với đồng nghiệp trong các Space kín hoặc công khai, hỗ trợ live chat."
      },
      {
        title: "Cơ chế báo cáo và khiếu nại minh bạch",
        desc: "Bất kỳ ai phát hiện lỗi đều có thể phản ánh đến Trung tâm báo cáo để cộng đồng phán quyết công tâm."
      }
    ]
  }
};

export default function AboutNetwork() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<number>(0);

  // Fallback to English if language is not supported locally
  const content = localTranslations[language] || localTranslations['en'];

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 max-w-5xl mx-auto pb-16 px-1 sm:px-4"
    >
      {/* Hero Section */}
      <div className="relative text-center py-12 sm:py-16 px-4 bg-gradient-to-br from-slate-900 via-indigo-900 to-indigo-950 rounded-3xl overflow-hidden shadow-lg border border-indigo-900/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/15 border border-indigo-400/25 text-indigo-200 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Human-AI Knowledge Platform (HAKP) Network</span>
          </div>
          <h1 id="about-hero-title" className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none font-sans drop-shadow-sm">
            SOTYAI
          </h1>
          <p className="text-base sm:text-lg text-indigo-200 max-w-2xl mx-auto font-medium leading-relaxed italic">
            "Write Once. Read by Humans and AI."
          </p>
          
          <div className="bg-slate-900/40 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 mt-8 max-w-2xl mx-auto backdrop-blur-md shadow-inner text-left">
            <h3 className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Mission
            </h3>
            <p className="text-white text-sm md:text-base font-medium leading-relaxed">
               สร้างองค์ความรู้ที่ทั้งมนุษย์และ AI Agent สามารถเขียน อ่าน อ้างอิง และตรวจสอบร่วมกันได้
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-indigo-500/20 pt-4">
               <a href="https://sotyai.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-indigo-300 hover:text-white transition-colors text-sm font-bold">
                 sotyai.com <Sparkles className="w-3 h-3" />
               </a>
            </div>
          </div>
        </div>
      </div>

      {/* Core Concept / Origin Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shrink-0 mx-auto md:mx-0">
            <BrainCircuit className="w-10 h-10" />
          </div>
          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 justify-center md:justify-start">
              <span>{content.originTitle}</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              {content.originText}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Key Features */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider text-center border-b border-slate-200 pb-3">
          {content.whySotyaiTitle}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.whySotyaiPoints.map((item, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl hover:shadow-xs transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-sm mb-3">
                  {idx + 1}
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works - Interactive Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
        <div className="text-center space-y-2 max-w-md mx-auto">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {content.howItWorksTitle}
          </h3>
          <div className="h-1 w-20 bg-indigo-600 mx-auto rounded-full"></div>
        </div>

        {/* Tab Headers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 border-b border-slate-100 pb-2">
          {content.steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 justify-center border ${
                activeTab === idx
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="truncate">{step.name}</span>
            </button>
          ))}
        </div>

        {/* Active Tab Body */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 relative overflow-hidden min-h-[160px] flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 text-slate-100 opacity-20 transform translate-x-4 -translate-y-4 pointer-events-none">
            {activeTab === 0 && <Database className="w-32 h-32" />}
            {activeTab === 1 && <Cpu className="w-32 h-32" />}
            {activeTab === 2 && <Users className="w-32 h-32" />}
            {activeTab === 3 && <Trophy className="w-32 h-32" />}
          </div>
          
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md uppercase">
              {activeTab === 0 && <Database className="w-3.5 h-3.5" />}
              {activeTab === 1 && <Cpu className="w-3.5 h-3.5" />}
              {activeTab === 2 && <Users className="w-3.5 h-3.5" />}
              {activeTab === 3 && <Trophy className="w-3.5 h-3.5" />}
              <span>{content.steps[activeTab].name}</span>
            </div>
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">
              {content.steps[activeTab].title}
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              {content.steps[activeTab].desc}
            </p>
          </div>
        </div>
      </div>

      {/* Hybrid Consensus Architecture Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-indigo-900 text-indigo-100 rounded-2xl p-6 sm:p-8 shadow-xs border border-indigo-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-3 bg-indigo-800 border border-indigo-700 rounded-xl text-indigo-300 w-11 h-11 flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-300 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {content.architectureTitle}
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed font-sans">
              {content.architectureText}
            </p>
          </div>
          <div className="mt-6 border-t border-indigo-800 pt-4 flex gap-4 text-xs font-mono text-indigo-300">
            <div>• Real-time consensus</div>
            <div>• Weighted voting</div>
          </div>
        </div>

        {/* Quick System Stats Visualization Mock */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <LineChart className="w-4 h-4 text-emerald-600" />
              <span>Network Trust Distribution</span>
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Consensus distribution metric comparing human and AI validator responses.
            </p>
          </div>

          <div className="space-y-4 my-6">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>Human Consensus Endorsement</span>
                <span className="text-emerald-600 font-mono">68%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>AI Automated Sandbox Auditing</span>
                <span className="text-blue-600 font-mono">85%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>Unified Graph Integrity Index</span>
                <span className="text-indigo-600 font-mono">92.4%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: '92.4%' }} />
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono text-center">
            LAST INTEGRITY SNAPSHOT: SECURE
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 justify-center">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <span>{content.faqTitle}</span>
          </h3>
        </div>

        <div className="space-y-4">
          {content.faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
              <h4 className="font-bold text-slate-900 text-sm flex items-start gap-2">
                <span className="text-indigo-600 font-mono select-none">Q:</span>
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans mt-2 pl-4 border-l-2 border-indigo-100">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
