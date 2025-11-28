import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Loader2, Sparkles, Download, ChevronRight, Phone, Mail, MapPin, 
  ExternalLink, HelpCircle, Info, X, Camera, ScanFace, FileText, 
  ShieldAlert, Building2, UserCheck, Share2, Quote, RefreshCw
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import ImageUploader from './components/ImageUploader';
import AestheticRadarChart from './components/RadarChart';
import { analyzeFaceMetrics, generateAestheticPoster, optimizePortrait, validateImage } from './services/geminiService';
import { AppState, ReportData } from './types';

// --- QUOTES DATABASE ---
const QUOTES = [
    // Professional / Medical
    "面部美学不是改变你是谁，而是还原你最好的样子。",
    "骨相决定上限，皮相决定下限，光影决定瞬间。",
    "真正的美，是面部比例与个人气质的完美共鸣。",
    "黄金比例0.618，是上帝留给人类的审美密码。",
    "三庭五眼，四高三低，这是东方美学的经典韵律。",
    "对称是美的基础，而不对称往往是灵动的来源。",
    "优秀的医美设计，应当是'以此为基，顺势而为'。",
    "皮肤的质感，往往比五官的形状更显年轻。",
    "面部轮廓的流畅度，决定了视觉上的舒适区。",
    "美，是医学、数学与艺术的终极交汇。",
    
    // Philosophical / Emotional
    "美不是被制造出来的，而是被发现的。",
    "你的脸，是你灵魂的某种外在显现。",
    "自信，是最高级的面部高光。",
    "岁月在脸上留下的，不只是痕迹，还有故事。",
    "接纳自己的独特，是变美的第一步。",
    "美不仅悦目，更应悦己。",
    "在光影流转中，看见未曾发现的自己。",
    "每一张脸都是独一无二的艺术品。",
    "审美没有标准答案，适合你的就是最佳解。",
    "所谓氛围感，不过是与自己和解后的从容。",

    // Humorous / Witty
    "主要看气质，其次看数值。",
    "颜值的尽头是物理学，美学的尽头是数学。",
    "今天也是被自己美醒的一天。",
    "你的美丽，不需要滤镜来定义。",
    "确认过眼神，是懂审美的人。",
    "我在等风，也在等你发现我的美。",
    "别低头，双下巴会笑。",
    "熬夜使人丑陋，早睡使人美丽（虽然做不到）。",
    "除了美貌，我一无所有（开玩笑的）。",
    "今日份的快乐，是AI给的。",

    // Internet Slang / Pop Culture
    "这颜值，简直是女娲的毕设作品。",
    "从此小说女主有了脸。",
    "美到犯规，建议红牌罚下（去我心里）。",
    "是心动的感觉没错了。",
    "这大概就是传说中的'建模脸'吧。",
    "生图直出，也很能打。",
    "颜值在线营业中。",
    "美商在线，拒绝流水线。",
    "这侧颜，想在鼻梁上滑滑梯。",
    "氛围感拉满，绝绝子。",

    // Short & Punchy
    "Less is More.",
    "RealFace, Real You.",
    "Be Your Own Muse.",
    "Elegance is an attitude.",
    "Beauty varies.",
    "Discover your ratio.",
    "Art of Face.",
    "Unlock Beauty.",
    "Aesthetic Intelligence.",
    "Beyond Surface.",

    // More Mix... (Filling to 100 conceptually)
    "美是和谐，而非完美的堆砌。",
    "保留个人特色，才是高级的微调。",
    "年轻态的关键，在于筋膜层的抗争。",
    "眼神的清澈度，是年龄的减法。",
    "下颌线的清晰度，是自律的加法。",
    "即使是AI，也惊叹于你的细节。",
    "每一次快门，都是对美的定格。",
    "数据是冰冷的，但美是温暖的。",
    "不仅要美得标准，更要美得生动。",
    "让科技，为你的美丽加冕。",
    "别让别人的审美，定义你的人生。",
    "你本来就很美，我们只是擦亮了镜子。",
    "愿你拥有雕塑般的轮廓，和诗一般的灵魂。",
    "美，是一种无需翻译的语言。",
    "在千篇一律中，寻找万里挑一。",
    "细节决定成败，也决定颜值。",
    "光，是最好的化妆师。",
    "面部折叠度，是上镜的秘密。",
    "T区立体，U区收紧，美学铁律。",
    "眉眼之间，藏着山川湖海。",
    "唇角的弧度，是情绪的开关。",
    "苹果肌的饱满，是少女感的入场券。",
    "鼻基底的高度，决定了面部的贵气。",
    "每一条皱纹，都是笑过的证据。",
    "不盲从，不焦虑，静待花开。",
    "医美是手段，变美是过程，自信是终点。",
    "联合丽格，懂医术，更懂艺术。",
    "科技向善，美学向心。",
    "让每一次改变，都值得被看见。",
    "你的美，由数据见证，由内心定义。",
    "精准，是AI的态度；优雅，是你的本能。",
    "在数字世界里，重构现实的美。",
    "这是一场关于'美'的深度对话。",
    "准备好遇见更完美的自己了吗？",
    "Loading Beauty...",
    "Decoding Aesthetics...",
    "Analyzing Ratios...",
    "Optimizing Angles...",
    "Calculating Harmony...",
    "Rendering Elegance...",
    // ... adding more placeholders to reach simulated 100 for variety
    "美学算法正在加载中...",
    "正在连接你的美学灵感...",
    "寻找面部的高光时刻...",
    "美，一触即发。",
    "打破平庸，重塑经典。",
    "你的美学报告，正在生成。",
    "比你更懂你的，是数据。",
    "不仅仅是看脸，更是看结构。",
    "透过现象看骨相。",
    "美，有迹可循。",
    "让专业，成就卓越。",
    "致敬每一位追求完美的你。",
    "美，无止境。",
    "开启你的颜值元宇宙。",
    "此刻，就是最好的时刻。",
    "让美学成为一种生活方式。",
    "联合丽格，为美而生。",
    "AI 赋能，颜值进阶。",
    "探索未知，发现真我。",
    "Hello, Beautiful."
];

// Background Decoration Images
const bgImages = [
  "https://docs.bccsw.cn/images/chacha/faceonly.jpg",
  "https://docs.bccsw.cn/images/chacha/manke1.jpg",
  "https://docs.bccsw.cn/images/chacha/manke2.jpg",
  "https://docs.bccsw.cn/images/chacha/splendeur.jpg",
  "https://docs.bccsw.cn/images/chacha/superorder.jpg",
  "https://docs.bccsw.cn/images/chacha/xinfuyuan1.jpg",
  "https://docs.bccsw.cn/images/chacha/xinfuyuan2.jpg",
  "https://docs.bccsw.cn/images/chacha/xinfuyuan3.jpg",
  "https://docs.bccsw.cn/images/chacha/xinfuyuan4.jpg"
];

// Helper to shuffle array
const shuffleArray = (array: string[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const BackgroundWaterfall = () => {
  const [columns, setColumns] = useState<{imgs: string[], duration: string, delay: string}[]>([]);

  useEffect(() => {
    // Create 5 columns for denser feel with high randomness
    const cols = Array.from({ length: 5 }).map(() => {
        const shuffled = shuffleArray(bgImages);
        // Random duration between 40s and 90s
        const duration = `${40 + Math.random() * 50}s`;
        // Random negative delay to start at different positions
        const delay = `-${Math.random() * 50}s`;
        
        return {
            imgs: [...shuffled, ...shuffled, ...shuffled], // Triple for longer loop
            duration,
            delay
        }; 
    });
    setColumns(cols);
  }, []);

  return (
    <div className="fixed inset-0 z-0 flex gap-2 md:gap-4 justify-between pointer-events-none opacity-[0.08] grayscale overflow-hidden">
      {columns.map((col, colIndex) => (
        <div 
          key={colIndex} 
          className={`
             flex flex-col gap-4 w-1/3 md:w-1/5 animate-scroll-up
             ${colIndex > 2 ? 'hidden md:flex' : 'flex'}
          `}
          style={{ 
             animationDuration: col.duration,
             animationDelay: col.delay
          }}
        >
          {col.imgs.map((src, imgIndex) => (
            <div key={imgIndex} className="w-full rounded-lg overflow-hidden shrink-0">
               <img src={src} alt="" className="w-full h-auto object-cover opacity-80" />
            </div>
          ))}
        </div>
      ))}
      
      {/* Overlay gradient to soften */}
      <div className="absolute inset-0 bg-gradient-to-b from-sys-bg via-transparent to-sys-bg"></div>
    </div>
  );
};

// --- SPLASH SCREEN COMPONENT ---
const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
    const [quote, setQuote] = useState("");
    const [effectClass, setEffectClass] = useState("");
    const [bgEffect, setBgEffect] = useState("");

    useEffect(() => {
        // Pick random quote
        const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        setQuote(randomQuote);

        // Pick random text effect
        const textEffects = [
            "animate-fade-in-up", 
            "animate-zoom-fade", 
            "animate-blur-in", 
            "animate-typewriter overflow-hidden whitespace-nowrap border-r-2 border-brand-rose pr-1",
            "animate-slide-in-left",
            "animate-glitch",
            "animate-scale-up"
        ];
        setEffectClass(textEffects[Math.floor(Math.random() * textEffects.length)]);

        // Pick random background effect
        const bgEffects = [
            "bg-gradient-to-tr from-brand-rose/10 to-sys-bg",
            "bg-gradient-to-b from-sys-bg via-mint-mist/20 to-brand-gold/10",
            "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lavender-mist/40 via-sys-bg to-sys-bg",
            "bg-sys-bg"
        ];
        setBgEffect(bgEffects[Math.floor(Math.random() * bgEffects.length)]);

        // Timer to finish splash
        // Random duration between 2.5s and 3.5s
        const duration = 2500 + Math.random() * 1000;
        const timer = setTimeout(() => {
            onComplete();
        }, duration);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 ${bgEffect} transition-colors duration-1000`}>
            <div className="max-w-2xl text-center relative">
                {/* Decorative Icon */}
                <div className="mb-8 flex justify-center animate-float">
                    <img src="https://docs.bccsw.cn/logo.png" className="h-12 w-auto opacity-80" alt="Logo" />
                </div>
                
                {/* Dynamic Quote */}
                <h1 className={`text-2xl md:text-4xl font-serif text-sys-text-main leading-relaxed mb-6 ${effectClass}`}>
                    {quote}
                </h1>
                
                {/* Loading Indicator */}
                <div className="mt-12 flex flex-col items-center gap-3">
                    <div className="w-48 h-0.5 bg-sys-text-light/10 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-rose animate-[typewriter_2s_linear_forwards] w-full origin-left"></div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-sys-text-light animate-pulse">
                        Loading Experience
                    </span>
                </div>
            </div>
            
            {/* Version Info (Splash) */}
            <div className="absolute bottom-8 text-[10px] text-sys-text-light/40 font-mono">
                v0.1.8 | 2025.11.28
            </div>
        </div>
    );
};

// Reusable Modal Header Component with Random Image
const ModalHeader = () => {
    // Pick random image only on mount
    const randomImg = useMemo(() => {
        return bgImages[Math.floor(Math.random() * bgImages.length)];
    }, []);

    return (
        <div className="relative w-full aspect-[2.35/1] rounded-xl overflow-hidden mb-6 bg-sys-bg shrink-0 group">
             <img 
               src={randomImg} 
               className="w-full h-full object-cover opacity-90 transition-transform duration-[10s] ease-in-out group-hover:scale-110" 
               alt="Header Visual" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>
    );
};

type AngleOption = 'frontal' | 'side45' | 'side90';

// Reusable Angle Selector Component
const AngleSelector = ({ 
    selectedAngle, 
    onChange, 
    className = "" 
}: { 
    selectedAngle: AngleOption, 
    onChange: (a: AngleOption) => void,
    className?: string 
}) => {
    return (
        <div className={`flex items-center bg-white p-1 rounded-full border border-sys-text-light/20 shadow-sm ${className}`}>
            {(['frontal', 'side45', 'side90'] as const).map((angle) => (
                <button
                    key={angle}
                    onClick={() => onChange(angle)}
                    className={`
                        flex items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                        ${selectedAngle === angle 
                            ? 'bg-brand-rose text-white shadow-md' 
                            : 'text-sys-text-light hover:text-sys-text-main hover:bg-sys-bg'}
                    `}
                >
                    {angle === 'frontal' && <FaceFrontIcon className="w-3 h-3" />}
                    {angle === 'side45' && <Face45Icon className="w-3 h-3" />}
                    {angle === 'side90' && <Face90Icon className="w-3 h-3" />}
                    <span>{angle === 'frontal' ? '正面' : angle === 'side45' ? '侧颜 45°' : '侧颜 90°'}</span>
                </button>
            ))}
        </div>
    );
};

// Simple SVG Icons for Faces
const FaceFrontIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <circle cx="12" cy="12" r="8" />
        <path d="M9 10h.01" />
        <path d="M15 10h.01" />
        <path d="M10 15a2 2 0 0 0 4 0" />
    </svg>
);
const Face45Icon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
        <path d="M15 10h.01" />
        <path d="M10 15a3 3 0 0 0 3-1" />
        <path d="M12 4v16" strokeOpacity="0.3" />
    </svg>
);
const Face90Icon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M9 20a8 8 0 1 1 0-16" />
        <path d="M15 10h.01" />
        <path d="M15 15a1 1 0 0 1-1 1" />
        <path d="M9 4v16" strokeOpacity="0.3" />
    </svg>
);

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [selectedAngle, setSelectedAngle] = useState<AngleOption>('frontal');
  const [posterLoaded, setPosterLoaded] = useState(false);

  // Hidden Ref for capturing full report
  const printRef = useRef<HTMLDivElement>(null);

  // Modal States
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showInstructions || showAbout) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showInstructions, showAbout]);

  // Simulate progress when analyzing
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state === AppState.ANALYZING) {
      interval = setInterval(() => {
        setProgress((prev) => {
          // Stall at 95% until manually set to 100%
          if (prev >= 95) return prev;
          // Slow down as it gets closer to 95%
          const increment = prev < 30 ? 2 : prev < 70 ? 0.5 : 0.2;
          return prev + increment;
        });
      }, 100);
    } else if (state === AppState.IDLE) {
      setProgress(0);
      setPosterLoaded(false);
    }
    return () => clearInterval(interval);
  }, [state]);

  const handleImageSelected = (base64: string) => {
    setInputImage(base64);
    setReportData(null);
    setState(AppState.IDLE);
    setErrorMsg(null);
  };

  const handleClear = () => {
    setInputImage(null);
    setReportData(null);
    setState(AppState.IDLE);
    setErrorMsg(null);
  };

  // Switch angle. If in success state, reset to IDLE so user can re-generate.
  const handleAngleChange = (angle: AngleOption) => {
      setSelectedAngle(angle);
      if (state === AppState.SUCCESS) {
          setState(AppState.IDLE);
          setReportData(null);
          // Keep inputImage
      }
  };

  const handleAnalyze = async () => {
    if (!inputImage) return;

    setState(AppState.ANALYZING);
    setErrorMsg(null);
    setProgress(0);

    try {
      // Step 0: Validate Image (Pre-check)
      setLoadingStep("AI 正在检测图片质量...");
      
      const validation = await validateImage(inputImage);
      if (!validation.isValid) {
        throw new Error(validation.reason || "图片不符合分析要求，请上传清晰的人像照片。");
      }
      
      // Step 1: Optimize Portrait (Standardize angle based on selection, remove sunglasses, etc.)
      setLoadingStep(`AI 正在进行${selectedAngle === 'frontal' ? '正面' : selectedAngle === 'side45' ? '45°侧颜' : '90°侧颜'}矫正...`);
      setProgress(20);
      
      const optimizedImageBase64 = await optimizePortrait(inputImage, selectedAngle);
      const optimizedImage = `data:image/jpeg;base64,${optimizedImageBase64}`;
      
      // Update the input image to show the user the optimized version
      // Bump progress to indicate optimization is done
      setProgress(45);
      setInputImage(optimizedImage);

      // Step 2: Analyze & Generate Poster using the OPTIMIZED image
      setLoadingStep("正在进行面部黄金比例分析...");
      
      const [analysis, posterImageBase64] = await Promise.all([
        analyzeFaceMetrics(optimizedImage),
        generateAestheticPoster(optimizedImage)
      ]);

      setProgress(100);
      
      // Small delay to allow user to perceive 100% completion
      await new Promise(resolve => setTimeout(resolve, 600));

      setReportData({
        analysis: analysis,
        generatedImage: `data:image/jpeg;base64,${posterImageBase64}`,
      });
      setState(AppState.SUCCESS);

    } catch (err: any) {
      console.error(err);
      setState(AppState.ERROR);
      setErrorMsg(err.message || "分析过程中出现错误，请尝试更换更清晰的照片。");
    }
  };

  const handleDownloadFullPoster = async () => {
    if (printRef.current) {
        try {
            // Wait for image to be loaded inside the hidden div if needed, 
            // but usually base64 is instant.
            const canvas = await html2canvas(printRef.current, {
                useCORS: true,
                scale: 2, // Retina quality
                backgroundColor: '#FAF9F6', // Match sys-bg explicitly to avoid transparency
                logging: false,
                ignoreElements: (element) => {
                    // Double check to ignore the background waterfall if it somehow got selected (unlikely via ref)
                    return element.classList.contains('fixed') && element.classList.contains('z-0');
                }
            });
            const link = document.createElement('a');
            link.download = 'RealFace_Aesthetic_Full_Report.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error("Poster generation failed", e);
            alert("海报生成失败，请稍后重试");
        }
    }
  };

  const handleShare = async () => {
      if (navigator.share && reportData) {
          try {
              // Create a blob from the generated image to share
              const res = await fetch(reportData.generatedImage);
              const blob = await res.blob();
              const file = new File([blob], "aesthetic_report.jpg", { type: "image/jpeg" });
              await navigator.share({
                  title: '我的面部美学报告',
                  text: '通过 AI 解锁我的面部黄金比例，你也来试试吧！',
                  files: [file]
              });
          } catch (err) {
              console.log('Share failed or canceled', err);
          }
      } else {
          // Fallback: Copy link or show message
          alert("您的浏览器不支持直接分享，请截图或下载海报后分享。");
      }
  };

  // If splash is active, show it
  if (showSplash) {
      return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-sys-text-main relative overflow-x-hidden animate-fade-in">
      
      {/* Dynamic Background Decoration */}
      <BackgroundWaterfall />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-sys-text-light/10 shadow-sm transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.location.reload()}>
            <img 
              src="https://docs.bccsw.cn/logo.png" 
              alt="重庆联合丽格 Logo" 
              className="h-8 md:h-10 w-auto object-contain" 
            />
          </div>
          <nav className="flex items-center gap-1 md:gap-6">
            <button 
              onClick={() => setShowInstructions(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-sys-text-light hover:text-brand-rose transition-colors rounded-full hover:bg-sys-bg"
            >
              <HelpCircle size={16} />
              <span className="hidden sm:inline">使用说明</span>
            </button>
            <button 
              onClick={() => setShowAbout(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-sys-text-light hover:text-brand-rose transition-colors rounded-full hover:bg-sys-bg"
            >
              <Info size={16} />
              <span className="hidden sm:inline">关于</span>
            </button>
            <span className="hidden lg:inline-flex text-xs text-brand-rose tracking-widest uppercase border border-brand-rose/30 px-3 py-1 rounded-full ml-2">
              AI 智能美学实验室
            </span>
          </nav>
        </div>
      </header>

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 md:px-6 mt-8 md:mt-12 mb-20 relative z-10">
        
        {/* Hero / Intro */}
        {state === AppState.IDLE && !inputImage && (
          <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto animate-fade-in-up">
            <span className="inline-block text-brand-rose text-xs md:text-sm tracking-[0.2em] mb-4 font-medium uppercase">Discover Your Golden Ratio</span>
            <h2 className="text-3xl md:text-5xl font-extralight text-sys-text-main mb-6 leading-tight">
              探索<span className="font-normal text-brand-rose">面部黄金比例</span>之美
            </h2>
            <p className="text-sys-text-light font-light text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              联合丽格科技为您呈现。采用先进 AI 生物识别技术，智能矫正侧脸与遮挡，<br className="hidden md:block" />
              深度解析骨相与皮相之美，为您生成医疗级面部美学评估报告。
            </p>
          </div>
        )}

        {/* Upload Section */}
        <div className={`${state === AppState.SUCCESS ? 'hidden' : 'block'}`}>
            <ImageUploader 
                onImageSelected={handleImageSelected} 
                selectedImage={inputImage} 
                onClear={handleClear}
                onError={(msg) => { setErrorMsg(msg); setState(AppState.ERROR); }}
            />
        </div>

        {/* Controls & Action Button (Only in IDLE with Image) */}
        {state === AppState.IDLE && inputImage && (
          <div className="flex flex-col items-center gap-6 -mt-6 mb-16 animate-fade-in">
            
            {/* Angle Selector - Centered for initial selection */}
            <AngleSelector selectedAngle={selectedAngle} onChange={handleAngleChange} />

            <button
              onClick={handleAnalyze}
              className="group relative inline-flex items-center justify-center gap-3 px-12 py-4 bg-brand-rose text-white text-sm tracking-[0.2em] uppercase hover:bg-brand-rose/90 transition-all duration-500 shadow-lg shadow-brand-rose/20 rounded-full overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></span>
              <Sparkles size={16} strokeWidth={1.5} className="relative z-10" />
              <span className="relative z-10 font-medium">生成美学报告</span>
            </button>
            <p className="text-xs text-sys-text-light/50 font-light">
                *系统将根据选择的角度自动重绘标准影像
            </p>
          </div>
        )}

        {/* Loading State */}
        {state === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center py-16 px-4 w-full max-w-md mx-auto animate-fade-in">
            {/* Visual Animation */}
            <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
                {/* Outer breathing ring */}
                <div className="absolute inset-0 border border-brand-rose/20 rounded-[40%] animate-[morph_8s_ease-in-out_infinite]"></div>
                {/* Inner spinning rings */}
                <div className="absolute inset-2 border border-mint-mist rounded-[35%] animate-[spin_5s_linear_infinite_reverse]"></div>
                <div className="absolute inset-4 border border-brand-gold/20 rounded-[45%] animate-[spin_6s_linear_infinite]"></div>
                
                {/* Center Glow */}
                <div className="absolute inset-0 m-auto w-16 h-16 bg-brand-rose/10 blur-xl animate-pulse"></div>
                
                {/* Icon */}
                <div className="relative z-10 text-brand-rose/80">
                    {loadingStep.includes("矫正") ? (
                    <Camera size={36} strokeWidth={1} className="animate-pulse" />
                    ) : (
                    <ScanFace size={36} strokeWidth={1} className="animate-pulse" />
                    )}
                </div>
            </div>

            {/* Text Info */}
            <h3 className="text-xl font-light text-sys-text-main mb-2 tracking-widest uppercase text-center">
                {loadingStep.includes("矫正") ? "AI 智能修整" : loadingStep.includes("检测") ? "智能合规检测" : "深度美学分析"}
            </h3>
            <p className="text-sm text-sys-text-light mb-8 h-5 text-center transition-all duration-300">
                {loadingStep}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-sys-text-light/10 h-1.5 rounded-full overflow-hidden relative">
                <div 
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-brand-rose to-brand-gold transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                >
                     <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/50 blur-[2px] animate-pulse"></div>
                </div>
            </div>
            <div className="mt-2 text-xs text-brand-rose/80 font-mono self-end">
                {Math.round(progress)}%
            </div>
          </div>
        )}

        {/* Error State */}
        {state === AppState.ERROR && (
          <div className="text-center py-12 bg-red-50/50 rounded-2xl border border-red-100 max-w-lg mx-auto">
            <p className="text-red-400 mb-6 font-light">{errorMsg}</p>
            <button 
                onClick={() => setState(AppState.IDLE)} 
                className="text-sm border-b border-sys-text-main pb-0.5 text-sys-text-main hover:text-brand-rose hover:border-brand-rose transition-colors"
            >
                返回重试
            </button>
          </div>
        )}

        {/* Results View */}
        {state === AppState.SUCCESS && reportData && (
          <div className="animate-fade-in space-y-12">
            
            {/* Toolbar - Updated with persistent Angle Selector */}
            <div className="flex flex-col md:flex-row justify-between items-center border-b border-sys-text-light/10 pb-6 gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={handleClear} className="text-sm text-sys-text-light hover:text-brand-rose flex items-center gap-2 transition-colors group">
                        <ChevronRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={16} />
                        重新上传
                    </button>
                    
                    <div className="h-4 w-px bg-sys-text-light/20 mx-2"></div>
                    
                    <button 
                        onClick={() => {
                            setState(AppState.IDLE);
                            setReportData(null);
                        }}
                        className="text-sm text-sys-text-light hover:text-brand-rose flex items-center gap-2 transition-colors"
                    >
                        <RefreshCw size={14} />
                        更换角度重测
                    </button>

                    {/* Persistent Angle Selector in Results View (Optional, but good for quick switch visibility) */}
                    <div className="hidden md:flex items-center gap-2 ml-2 pl-4 border-l border-sys-text-light/10">
                        <span className="text-xs text-sys-text-light/60">快速切换:</span>
                        <AngleSelector 
                            selectedAngle={selectedAngle} 
                            onChange={handleAngleChange} 
                            className="bg-sys-bg/50 !p-0.5 scale-90"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleShare}
                        className="flex items-center justify-center w-10 h-10 rounded-full border border-sys-text-light/20 text-sys-text-light hover:text-brand-rose hover:border-brand-rose hover:bg-sys-bg transition-all"
                        title="分享报告"
                    >
                        <Share2 size={16} />
                    </button>
                    <button
                        onClick={handleDownloadFullPoster}
                        className="flex items-center gap-2 px-6 py-2.5 bg-sys-text-main text-white text-xs uppercase tracking-wider rounded-full hover:bg-brand-rose transition-colors shadow-soft"
                    >
                        <Download size={14} />
                        <span>下载海报</span>
                    </button>
                </div>
            </div>
            
            {/* Mobile Angle Selector (shown below toolbar on small screens) */}
            <div className="md:hidden flex justify-center pb-4 border-b border-sys-text-light/10 border-dashed">
                <AngleSelector 
                    selectedAngle={selectedAngle} 
                    onChange={handleAngleChange} 
                    className="bg-sys-bg/50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                
                {/* Left: Generated Poster */}
                <div className="bg-white p-3 shadow-soft rounded-lg transform transition-all hover:shadow-xl duration-500">
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-sys-bg rounded-sm group">
                        {/* Placeholder / Blur Load */}
                        <div 
                           className={`absolute inset-0 bg-sys-bg flex items-center justify-center transition-opacity duration-700 ${posterLoaded ? 'opacity-0' : 'opacity-100'}`}
                        >
                            <Loader2 className="animate-spin text-brand-rose/30" />
                        </div>

                        <img 
                            src={reportData.generatedImage} 
                            alt="面部美学报告海报" 
                            className={`relative w-full h-full object-contain z-10 transition-all duration-1000 ${posterLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} group-hover:scale-[1.01]`}
                            onLoad={() => setPosterLoaded(true)}
                        />
                    </div>
                    <p className="text-center mt-3 text-xs text-sys-text-light/60 font-light">
                      * 图像已经过 AI 智能矫正，还原标准医学影像
                    </p>
                </div>

                {/* Right: Analysis Data */}
                <div className="space-y-8">
                    
                    {/* Summary */}
                    <div className="bg-gradient-to-br from-white to-sys-bg p-8 rounded-2xl shadow-soft border border-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-rose/60"></div>
                        <div className="flex items-center gap-3 mb-4 text-brand-rose">
                            <Sparkles size={18} strokeWidth={1.5} />
                            <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-sys-text-main">AI 智能美学总评</h3>
                        </div>
                        <p className="text-sys-text-main text-sm md:text-base leading-loose font-light text-justify">
                            {reportData.analysis.summary}
                        </p>
                    </div>

                    {/* Radar Chart */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-sys-text-light text-center">多维度美学平衡</h3>
                        <AestheticRadarChart scores={reportData.analysis.scores} />
                    </div>

                    {/* Score Breakdown */}
                    <div className="bg-white p-8 rounded-2xl shadow-soft border border-sys-text-light/5">
                         <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-sys-text-light mb-8">分项指标详解</h3>
                         <div className="space-y-6">
                            <ScoreRow label="眼部灵动与形态" score={reportData.analysis.scores.eyes} />
                            <ScoreRow label="面中与脸颊协调度" score={reportData.analysis.scores.cheeks} />
                            <ScoreRow label="唇形与比例" score={reportData.analysis.scores.lips} />
                            <ScoreRow label="眉弓与眉形设计" score={reportData.analysis.scores.brows} />
                            <ScoreRow label="下颌线与轮廓" score={reportData.analysis.scores.jawline} />
                            <ScoreRow label="面部整体对称性" score={reportData.analysis.scores.symmetry} />
                         </div>
                         <div className="mt-10 pt-6 border-t border-dashed border-sys-text-light/20 flex justify-between items-center">
                             <span className="font-medium text-sys-text-main uppercase tracking-widest text-sm">美学综合评分</span>
                             <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-light text-brand-rose">{reportData.analysis.scores.total}</span>
                                <span className="text-sm text-sys-text-light font-light">%</span>
                             </div>
                         </div>
                    </div>

                </div>
            </div>
          </div>
        )}
      </main>

      {/* Hidden Print Container for Full Poster Download */}
      {state === AppState.SUCCESS && reportData && (
          <div className="fixed top-0 left-[-9999px]" ref={printRef}>
              <div className="w-[800px] bg-[#FAF9F6] p-12 flex flex-col gap-8 items-center font-sans">
                  {/* Header */}
                  <div className="w-full flex justify-between items-center border-b border-gray-200 pb-6">
                      <img src="https://docs.bccsw.cn/logo.png" className="h-12 object-contain" />
                      <span className="text-brand-rose tracking-widest uppercase border border-brand-rose/30 px-4 py-1.5 rounded-full">
                         RealFace Aesthetica Report
                      </span>
                  </div>

                  {/* Main Poster Image */}
                  <div className="w-full bg-white p-4 shadow-sm">
                      <img src={reportData.generatedImage} className="w-full h-auto object-contain" />
                  </div>

                  {/* Summary */}
                  <div className="w-full bg-white p-8 rounded-xl border-l-4 border-brand-rose">
                      <h3 className="text-lg font-medium text-brand-rose mb-3">AI 智能美学总评</h3>
                      <p className="text-gray-700 leading-relaxed text-justify">{reportData.analysis.summary}</p>
                  </div>

                  {/* Charts & Scores Grid */}
                  <div className="w-full grid grid-cols-2 gap-8">
                      {/* Radar */}
                      <div className="bg-white p-6 rounded-xl flex items-center justify-center">
                          <AestheticRadarChart scores={reportData.analysis.scores} />
                      </div>
                      
                      {/* Scores List */}
                      <div className="bg-white p-6 rounded-xl space-y-5">
                            <ScoreRow label="眼部灵动与形态" score={reportData.analysis.scores.eyes} />
                            <ScoreRow label="面中与脸颊协调度" score={reportData.analysis.scores.cheeks} />
                            <ScoreRow label="唇形与比例" score={reportData.analysis.scores.lips} />
                            <ScoreRow label="眉弓与眉形设计" score={reportData.analysis.scores.brows} />
                            <ScoreRow label="下颌线与轮廓" score={reportData.analysis.scores.jawline} />
                            <ScoreRow label="面部整体对称性" score={reportData.analysis.scores.symmetry} />
                            
                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                                <span className="font-bold text-gray-800">综合评分</span>
                                <span className="text-4xl text-brand-rose">{reportData.analysis.scores.total}<span className="text-lg text-gray-400 ml-1">%</span></span>
                            </div>
                      </div>
                  </div>

                  {/* Footer with QR Code */}
                  <div className="w-full mt-8 pt-6 border-t border-gray-200 flex items-end justify-between">
                     {/* Left: App QR Code */}
                     <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white border border-brand-rose/30 rounded-lg shadow-sm">
                           <QRCodeSVG
                              value="https://beautifulface.ebook.bccsw.cn/"
                              size={72}
                              fgColor="#B08D87" 
                              bgColor="#FFFFFF"
                              level="H"
                           />
                        </div>
                        <div className="text-[12px] text-brand-rose font-light flex flex-col tracking-wide">
                            <span>扫码解锁</span>
                            <span>您的美学报告</span>
                        </div>
                     </div>

                     {/* Right: Company Info */}
                     <div className="text-right text-gray-400 text-xs flex flex-col gap-1">
                        <p>重庆联合丽格科技有限公司</p>
                        <p className="text-[10px] uppercase tracking-wider">AI Intelligent Aesthetics Lab</p>
                     </div>
                  </div>
              </div>
          </div>
      )}

      {/* Consultant Welfare Section */}
      <section className="w-full bg-gradient-to-r from-mint-mist/30 to-lavender-mist/30 py-16 px-6 mt-auto border-t border-white relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="flex-1 text-center md:text-left space-y-4">
              <span className="inline-block px-3 py-1 bg-brand-rose/10 text-brand-rose text-xs tracking-widest rounded-full mb-2">Exclusive Service</span>
              <h3 className="text-2xl md:text-3xl font-light text-sys-text-main">专属美学顾问 <span className="font-normal text-brand-rose">福利官</span></h3>
              <p className="text-sys-text-light font-light leading-relaxed max-w-md mx-auto md:mx-0">
                 获取您的一对一面部美学改善方案，领取新人专享礼遇。扫码或点击链接，开启您的美丽进阶之旅。
              </p>
              <div className="pt-4">
                 <a 
                    href="https://work.weixin.qq.com/kfid/kfcfc2a809493f31e8f" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-brand-rose hover:text-brand-rose/80 transition-colors border-b border-brand-rose pb-1"
                 >
                    联系福利官 <ExternalLink size={14} />
                 </a>
              </div>
           </div>
           
           <div className="relative group shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-tr from-brand-rose to-brand-gold opacity-30 blur-lg rounded-xl group-hover:opacity-50 transition-opacity duration-500"></div>
              <a href="https://work.weixin.qq.com/kfid/kfcfc2a809493f31e8f" target="_blank" rel="noopener noreferrer">
                <img 
                    src="https://docs.bccsw.cn/consultant.png" 
                    alt="美学顾问二维码" 
                    className="relative w-24 md:w-28 h-auto rounded-xl shadow-lg bg-white p-2 border border-white/50"
                />
              </a>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-sys-text-light/10 pt-12 pb-8 relative z-10">
         <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-center md:text-left">
               <div className="space-y-4">
                  <img src="https://docs.bccsw.cn/logo.png" alt="Logo" className="h-8 w-auto mx-auto md:mx-0 opacity-80 grayscale hover:grayscale-0 transition-all" />
                  <p className="text-xs text-sys-text-light leading-relaxed">
                     致力于将科技与美学完美融合，为每一位求美者提供专业、安全、个性化的医美服务。
                  </p>
               </div>
               
               <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row justify-around gap-8">
                  <div className="space-y-3">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-sys-text-main mb-4">联系我们</h4>
                     <div className="flex items-start justify-center md:justify-start gap-3 text-xs text-sys-text-light font-light hover:text-brand-rose transition-colors cursor-default">
                        <MapPin size={14} className="mt-0.5 shrink-0" />
                        <span>重庆市渝中区临江支路28号</span>
                     </div>
                     <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-sys-text-light font-light hover:text-brand-rose transition-colors cursor-default">
                        <Phone size={14} className="shrink-0" />
                        <span>023-68726872</span>
                     </div>
                     <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-sys-text-light font-light hover:text-brand-rose transition-colors cursor-default">
                        <Mail size={14} className="shrink-0" />
                        <span>bccsw@cqlhlg.work</span>
                     </div>
                  </div>
                  
                  <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-sys-text-main mb-4">关于与合规</h4>
                      <button onClick={() => setShowAbout(true)} className="block text-xs text-sys-text-light hover:text-brand-rose transition-colors">隐私政策</button>
                      <button onClick={() => setShowAbout(true)} className="block text-xs text-sys-text-light hover:text-brand-rose transition-colors">服务条款</button>
                      <button onClick={() => setShowAbout(true)} className="block text-xs text-sys-text-light hover:text-brand-rose transition-colors">医疗内容和AI内容免责声明</button>
                  </div>
               </div>
            </div>

            <div className="pt-8 border-t border-sys-text-light/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-sys-text-light/60 font-light font-mono">
               <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center">
                   <p>© 2025 重庆联合丽格科技有限公司. All rights reserved.</p>
                   <span className="hidden md:inline">|</span>
                   <p>软件版本 0.1.8 | 部署时间 2025年11月28日</p>
               </div>
               <a 
                 href="https://beian.miit.gov.cn/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="hover:text-sys-text-light transition-colors"
               >
                 渝 ICP 备 2024023473 号
               </a>
            </div>
         </div>
      </footer>

      {/* Instructions Modal */}
      {showInstructions && (
        <Modal onClose={() => setShowInstructions(false)} title="使用说明">
           <div className="space-y-6">
              {/* Reusable Header */}
              <ModalHeader />

              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-brand-rose/10 text-brand-rose flex items-center justify-center shrink-0">
                    <Camera size={20} />
                 </div>
                 <div>
                    <h4 className="text-sys-text-main font-medium mb-2">1. 拍摄或上传照片</h4>
                    <p className="text-sm text-sys-text-light font-light leading-relaxed">
                       请上传一张清晰的正面免冠照片。建议在自然光下拍摄。
                       <strong className="text-brand-rose font-normal"> 新功能：</strong> 系统现支持选择“正面”、“45°”或“90°”侧颜，并自动矫正光影与遮挡。
                    </p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-brand-rose/10 text-brand-rose flex items-center justify-center shrink-0">
                    <ScanFace size={20} />
                 </div>
                 <div>
                    <h4 className="text-sys-text-main font-medium mb-2">2. 智能 AI 分析</h4>
                    <p className="text-sm text-sys-text-light font-light leading-relaxed">
                       系统将自动识别面部关键点，根据“三庭五眼”黄金比例、面部对称性及软组织形态进行多维度计算。
                       过程通常需要 5-10 秒，请耐心等待。
                    </p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-brand-rose/10 text-brand-rose flex items-center justify-center shrink-0">
                    <FileText size={20} />
                 </div>
                 <div>
                    <h4 className="text-sys-text-main font-medium mb-2">3. 获取美学报告</h4>
                    <p className="text-sm text-sys-text-light font-light leading-relaxed">
                       您将获得一份包含六大维度评分的专业美学报告和一张定制化的面部分析海报。
                       您可以保存海报或联系我们的美学顾问进行更深入的面诊咨询。
                    </p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-brand-rose/10 text-brand-rose flex items-center justify-center shrink-0">
                    <ShieldAlert size={20} />
                 </div>
                 <div>
                    <h4 className="text-sys-text-main font-medium mb-2">4. 隐私与分享责任</h4>
                    <p className="text-sm text-sys-text-light font-light leading-relaxed">
                       我们承诺<strong className="text-brand-rose font-normal">不保存您的任何照片</strong>。
                       数据处理在云端即时完成并立即清除。您下载报告后，请自行决定分享方式并对您的个人信息传播负责。
                    </p>
                 </div>
              </div>
           </div>
        </Modal>
      )}

      {/* About Modal */}
      {showAbout && (
        <Modal onClose={() => setShowAbout(false)} title="关于与免责声明">
            <div className="space-y-8 divide-y divide-sys-text-light/10">
                
                {/* Reusable Header */}
                <div className="pt-0">
                    <ModalHeader />
                </div>

                {/* Medical Disclaimer */}
                <div className="pt-2">
                   <div className="flex items-center gap-2 mb-3 text-brand-rose">
                      <ShieldAlert size={18} />
                      <h4 className="font-medium text-sm tracking-wide">医疗内容免责声明</h4>
                   </div>
                   <p className="text-xs text-sys-text-light font-light leading-relaxed text-justify">
                      本应用提供的面部美学分析报告仅供娱乐和美学参考，不构成任何医疗建议、诊断或治疗方案。
                      美学评分基于通用算法标准，个人审美具有主观性。请勿仅依据本报告做出医疗决定。
                      如需进行医疗美容项目，请务必前往正规医疗机构，咨询具有执业资格的专业医生。
                   </p>
                </div>

                {/* AI Disclaimer */}
                <div className="pt-6">
                   <div className="flex items-center gap-2 mb-3 text-brand-rose">
                      <Sparkles size={18} />
                      <h4 className="font-medium text-sm tracking-wide">AI 生成内容免责声明</h4>
                   </div>
                   <p className="text-xs text-sys-text-light font-light leading-relaxed text-justify">
                      本报告内容（包括评分、点评及海报图像）均由人工智能系统基于上传的图像自动生成。
                      系统包含“人像矫正”功能，生成的标准化证件照仅用于美学结构分析，可能与原图存在细节差异。
                      虽然我们致力于提供准确的美学分析，但 AI 模型可能存在偏差、误判或幻觉。
                   </p>
                </div>

                {/* Privacy */}
                <div className="pt-6">
                   <div className="flex items-center gap-2 mb-3 text-brand-rose">
                      <UserCheck size={18} />
                      <h4 className="font-medium text-sm tracking-wide">隐私政策</h4>
                   </div>
                   <p className="text-xs text-sys-text-light font-light leading-relaxed text-justify">
                      我们高度重视您的个人隐私。您上传的照片仅用于实时的美学分析和海报生成处理。
                      图像处理在云端即时完成，系统<span className="font-medium text-sys-text-main">不会永久存储</span>您的面部照片。
                      页面关闭或刷新后，数据即被清除。
                   </p>
                </div>

                {/* Company Info & Consultant */}
                <div className="pt-6">
                   <div className="flex items-center gap-2 mb-4 text-brand-rose">
                      <Building2 size={18} />
                      <h4 className="font-medium text-sm tracking-wide">企业信息与联系</h4>
                   </div>
                   
                   <div className="bg-sys-bg p-5 rounded-xl border border-sys-text-light/10 flex flex-col sm:flex-row gap-6 items-center">
                       {/* Company Text */}
                       <div className="flex-1 space-y-2 text-center sm:text-left">
                          <h5 className="text-sys-text-main font-medium text-sm">重庆联合丽格科技有限公司</h5>
                          <p className="text-xs text-sys-text-light">重庆市渝中区临江支路28号</p>
                          <p className="text-xs text-sys-text-light">电话：023-68726872</p>
                          <p className="text-xs text-sys-text-light">邮箱：bccsw@cqlhlg.work</p>
                       </div>
                       
                       {/* Consultant QR */}
                       <div className="shrink-0 flex flex-col items-center gap-2">
                          <a 
                            href="https://work.weixin.qq.com/kfid/kfcfc2a809493f31e8f" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1 bg-white rounded-lg shadow-sm border border-sys-text-light/10 hover:shadow-md transition-shadow cursor-pointer block"
                          >
                              <img 
                                src="https://docs.bccsw.cn/consultant.png" 
                                alt="福利官二维码" 
                                className="w-24 h-auto object-contain" 
                              />
                          </a>
                          <span className="text-[10px] text-brand-rose tracking-wider uppercase">福利官</span>
                       </div>
                   </div>
                </div>

            </div>
        </Modal>
      )}

    </div>
  );
};

const ScoreRow = ({ label, score }: { label: string; score: number }) => (
    <div className="flex items-center justify-between group cursor-default px-4 py-3 rounded-xl hover:bg-white hover:shadow-md hover:scale-[1.02] transition-all duration-300">
        <span className="text-xs sm:text-sm text-sys-text-light group-hover:text-brand-rose transition-colors font-light tracking-wide duration-300">{label}</span>
        <div className="flex items-center gap-4">
            <div className="w-24 sm:w-32 h-1 bg-sys-bg rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-brand-rose/40 to-brand-rose rounded-full transition-all duration-1000 ease-out relative group-hover:shadow-[0_0_8px_rgba(176,141,135,0.4)]" 
                    style={{ width: `${score}%` }}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[1px]"></div>
                </div>
            </div>
            <span className="text-sm font-light text-sys-text-main w-8 text-right tabular-nums group-hover:font-normal group-hover:scale-110 transition-all duration-300">{score}</span>
        </div>
    </div>
);

// Reusable Modal Component
const Modal = ({ onClose, title, children }: { onClose: () => void, title: string, children?: React.ReactNode }) => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-sys-text-main/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
            
            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-lg max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-sys-text-light/10 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="text-lg text-sys-text-main font-light">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-sys-bg text-sys-text-light hover:text-sys-text-main transition-colors"
                    >
                        <X size={20} strokeWidth={1.5} />
                    </button>
                </div>
                
                {/* Modal Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default App;