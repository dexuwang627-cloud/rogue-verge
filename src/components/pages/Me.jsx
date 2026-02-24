import React, { useEffect, useState, useRef } from 'react';
import { TRANSLATIONS } from '../../data/constants';

/**
 * SecureChannel — Terminal-styled contact section
 * Features: CRT scanlines, encrypted data stream, copy-to-clipboard with glitch feedback
 */
const SecureChannel = ({ isZh }) => {
    const [copied, setCopied] = useState(false);
    const [terminalLines, setTerminalLines] = useState([]);
    const terminalRef = useRef(null);
    const email = 'rogueverge@gmail.com';

    // Terminal boot sequence on mount
    useEffect(() => {
        const bootLines = [
            { text: '> INITIALIZING SECURE CHANNEL...', delay: 0 },
            { text: '> ENCRYPTION PROTOCOL: AES-256-GCM', delay: 300 },
            { text: '> HANDSHAKE COMPLETE.', delay: 600 },
            { text: '> AWAITING INPUT_', delay: 900 },
        ];

        bootLines.forEach(({ text, delay }) => {
            setTimeout(() => {
                setTerminalLines(prev => [...prev, text]);
            }, delay);
        });
    }, []);

    // Auto-scroll terminal to bottom
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalLines]);

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(email);
            setCopied(true);

            // Add transmission lines to terminal
            const transmitLines = [
                `> EXEC copy --target=${email}`,
                '> ENCRYPTING DATA_PACKET...',
                '> TRANSMISSION STATUS: ✓ SUCCESS',
            ];
            transmitLines.forEach((line, i) => {
                setTimeout(() => {
                    setTerminalLines(prev => [...prev, line]);
                }, i * 200);
            });

            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            setTerminalLines(prev => [...prev, '> ERROR: CLIPBOARD ACCESS DENIED']);
        }
    };

    const links = [
        {
            label: 'GITHUB',
            protocol: 'REPO_LINK',
            status: 'ACTIVE',
            href: 'https://github.com/dexuwang627-cloud',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
            ),
        },
        {
            label: 'LINKEDIN',
            protocol: 'NEURAL_NET',
            status: 'CONNECTED',
            href: 'https://www.linkedin.com/in/te-shu-wang-5455142a2',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            ),
        },
        {
            label: 'INSTAGRAM',
            protocol: 'SIGNAL_FEED',
            status: 'BROADCASTING',
            href: 'https://www.instagram.com/dexuwang',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
            ),
        },
    ];

    // Generate random hex string for data stream effect
    const randomHex = () => {
        return Array.from({ length: 32 }, () =>
            Math.floor(Math.random() * 16).toString(16).toUpperCase()
        ).join('');
    };

    const [hexStream, setHexStream] = useState(randomHex());

    useEffect(() => {
        const interval = setInterval(() => {
            setHexStream(randomHex());
        }, 150);
        return () => clearInterval(interval);
    }, []);

    return (
        <section>
            <h2 className="text-2xl font-serif text-white border-b border-white/20 pb-4 mb-8 flex items-center">
                <span className="text-red-500 mr-2">05 //</span>
                {isZh ? '安全通道' : 'SECURE CHANNEL'}
            </h2>

            {/* Terminal Window */}
            <div className="relative border border-white/10 bg-[#050505] overflow-hidden group hover:border-red-500/30 transition-colors duration-500">

                {/* CRT Scanlines Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-20 z-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)' }}></div>

                {/* Terminal Header */}
                <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border-b border-white/10">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                    <span className="ml-2 text-[10px] font-mono text-gray-600 tracking-widest">COMM_LINK // ENCRYPTED CHANNEL</span>
                </div>

                <div className="p-6 space-y-6">

                    {/* Mini Terminal Output */}
                    <div ref={terminalRef} className="font-mono text-[11px] text-green-500/70 bg-black/50 border border-white/5 p-3 h-24 overflow-y-auto space-y-0.5">
                        {terminalLines.map((line, i) => (
                            <div key={i} className={line.includes('SUCCESS') ? 'text-green-400 font-bold' : line.includes('ERROR') ? 'text-red-500' : ''}>
                                {line}
                            </div>
                        ))}
                    </div>

                    {/* Email — Click to Copy */}
                    <div
                        onClick={handleCopyEmail}
                        className={`relative cursor-pointer border p-4 transition-all duration-300 group/email ${copied
                                ? 'border-green-500/50 bg-green-500/5'
                                : 'border-white/10 bg-white/[0.02] hover:border-red-500/50 hover:bg-red-500/5'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 transition-colors duration-300 ${copied ? 'bg-green-500 animate-pulse' : 'bg-gray-600 group-hover/email:bg-red-500 group-hover/email:animate-pulse'}`}></div>
                                <div>
                                    <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-1">
                                        {'>'} EMAIL // {copied ? (isZh ? '傳輸完成' : 'TRANSMISSION COMPLETE') : (isZh ? '點擊複製' : 'CLICK TO COPY')}
                                    </div>
                                    <div className={`font-mono text-sm transition-all duration-300 ${copied ? 'text-green-400' : 'text-white group-hover/email:text-red-400'}`}>
                                        {email}
                                    </div>
                                </div>
                            </div>
                            <div className={`font-mono text-xs transition-all duration-300 ${copied ? 'text-green-500' : 'text-gray-600'}`}>
                                {copied ? '[ ✓ COPIED ]' : '[ COPY ]'}
                            </div>
                        </div>
                        {/* Flash effect on copy */}
                        {copied && <div className="absolute inset-0 bg-green-500/10 animate-pulse pointer-events-none"></div>}
                    </div>

                    {/* External Links */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {links.map((link, idx) => (
                            <a
                                key={idx}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/link flex items-center gap-3 border border-white/10 bg-white/[0.02] p-4 hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-300"
                            >
                                <div className="w-2 h-2 bg-gray-600 group-hover/link:bg-red-500 group-hover/link:animate-pulse transition-colors"></div>
                                <div className="text-gray-500 group-hover/link:text-red-400 transition-colors">
                                    {link.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-mono text-[10px] text-gray-600 tracking-widest">
                                        {'>'} {link.protocol} :: {link.status}
                                    </div>
                                    <div className="font-mono text-xs text-white group-hover/link:text-red-400 transition-colors truncate">
                                        {link.label}
                                    </div>
                                </div>
                                <span className="text-gray-700 group-hover/link:text-red-500 text-xs transition-colors">→</span>
                            </a>
                        ))}
                    </div>

                    {/* Encrypted Data Stream */}
                    <div className="font-mono text-[8px] text-gray-800 tracking-widest overflow-hidden whitespace-nowrap select-none opacity-60">
                        {hexStream}
                    </div>
                </div>
            </div>
        </section>
    );
};

export const Me = ({ lang }) => {
    const isZh = lang === 'zh-TW';
    const t = TRANSLATIONS[lang]?.me || TRANSLATIONS.en.me;
    const education = {
        school: isZh ? '國立清華大學 — 經濟學系' : 'National Tsing Hua University - Economics Department',
        period: 'Sep 2022 - Present',
        desc: isZh
            ? '以數據驅動的行銷與市場分析為核心，透過自有品牌進行市場驗證與消費者評估，將數據洞察轉化為可量化的行銷成果。'
            : 'Data-driven marketing and market analysis encompass market validation and consumer assessment through proprietary brands, with the objective of converting data insights into measurable marketing outcomes.'
    };

    const experiences = [
        {
            company: isZh ? '系統整合與專案開發 | 綠世得科技有限公司' : 'System Integration & Project Development | Greenworld Technology Corp.',
            period: 'Jul 2024 - Present',
            role: isZh ? '創辦人' : 'Founder',
            details: isZh ? [
                '開發可與電池管理系統 (BMS) 及太陽能儲能設備整合的消防安全通訊與控制系統。',
                '運用 Zabbix 與 Grafana 進行系統監控、架構設計與數據視覺化。',
                '負責企業補助案撰寫與計畫書規劃，協助推進公司專案與技術發展。'
            ] : [
                'Developed a fire safety communication and control system integrable with BMS and solar energy storage devices.',
                'Utilized Zabbix and Grafana for system monitoring, architecture design, and data visualization.',
                'Authored government subsidy applications and project proposals, advancing company initiatives and technical development.'
            ]
        },
        {
            company: isZh ? '網頁效能優化與後端重構 | 世和智能' : 'Web Performance & Backend Refactoring | Shih-Ho Intelligent Corp.',
            period: 'Sep 2023 - Present',
            role: '',
            details: isZh ? [
                '執行網站的 SEO 規劃與整體效能優化。',
                '導入 Supabase 進行後端架構重構，提升系統穩定度與資料處理效率。',
                '實作網站安全標頭 (Security Headers) 並處理前後端部署與基礎設施架設。'
            ] : [
                'Executed SEO planning and comprehensive website performance optimization.',
                'Introduced Supabase for backend restructuring, improving system stability and data processing efficiency.',
                'Implemented Security Headers and managed full-stack deployment and infrastructure setup.'
            ]
        },
        {
            company: isZh ? '駿達彩色沖印 / 灣興實業' : 'Junda Color Photo Finishing / Wanxing Industrial Co., Ltd.',
            period: 'Jun 2024 - Jun 2025',
            role: '',
            details: isZh ? [
                '協助設計與編輯平面廣告，確保內容符合目標受眾的偏好。',
                '支援客戶印刷專案執行與作品集優化。'
            ] : [
                "Assisted in the design and editing of print advertisements, ensuring content resonates with the target audience.",
                'Supported clients in printing projects and portfolio optimization.'
            ]
        }
    ];

    const leadership = [
        {
            organization: isZh
                ? '科技管理學院學刊 — 經濟學系'
                : 'Journal of the School of Science and Technology Management - Department of Economics',
            role: isZh ? '影片製作' : 'Video Production',
            period: 'Sep 2024 - Present',
            details: isZh ? [
                '統籌製作組的季刊影片內容，管理從訪談到刊出的編輯流程。',
                '協助萃取關鍵訪談片段，確保準時交付。'
            ] : [
                "Oversee the production team's quarterly video content and manage the editorial process from interviews to publication.",
                'Facilitate the extraction of essential interview excerpts to guarantee prompt delivery.'
            ]
        },
        {
            organization: isZh ? '經濟學系系學會' : 'Department of Economics - Department Association Personnel',
            role: isZh ? '學術及活動組' : 'Academic and Activities Division',
            period: 'Dec 2024 - Dec 2025',
            details: isZh ? [
                '統籌系上烤肉活動與校友聚會。',
                '邀請校友與業界人士舉辦講座，充實系上學術資源。',
                '安排企業參訪、法人展覽及相關活動。'
            ] : [
                'Coordinate departmental barbecue events and alumni gatherings.',
                'Organize lectures featuring alumni and industry professionals to equip the department with professional resources.',
                'Facilitate company visits, corporate exhibitions, and associated activities.'
            ]
        }
    ];

    const skills = [
        {
            label: isZh ? '程式開發與維運' : 'DEV & DEVOPS',
            items: ['Python', 'Docker', 'GitHub', 'Supabase', 'Mermaid']
        },
        {
            label: isZh ? '系統架構與監控管理' : 'ARCHITECTURE & MONITORING',
            items: isZh ? ['系統架構設計', 'Zabbix', 'Grafana', '資料視覺化', 'SEO', '資訊安全'] : ['System Architecture', 'Zabbix', 'Grafana', 'Data Visualization', 'SEO', 'Web Security']
        },
        {
            label: isZh ? '設計與後製軟體' : 'DESIGN & PRODUCTION',
            items: ['DaVinci Resolve', 'CapCut', 'Adobe Illustrator', 'Affinity', 'Canva']
        },
        {
            label: isZh ? '語言與其他' : 'LANGUAGES & OTHERS',
            items: isZh ? ['中文 (Native)', '英文 (Fluent)', '方舟協會志工', '跑步', '羽毛球', '時尚設計'] : ['Chinese (Native)', 'English (Fluent)', 'Ark Association Vol.', 'Running', 'Badminton', 'Fashion']
        }
    ];

    const labels = {
        subtitle: isZh ? '履歷 / 職涯資料' : 'Resume / Professional Data',
        edu: isZh ? '學歷' : 'EDUCATION',
        exp: isZh ? '專業經歷' : 'PROFESSIONAL EXPERIENCE',
        lead: isZh ? '領導力與專案管理職務' : 'LEADERSHIP & PROJECT MANAGEMENT',
        supp: isZh ? '其他技能' : 'SUPPLEMENTARY SKILLS',
    };

    return (
        <div className={`pt-32 px-6 md:px-20 max-w-5xl mx-auto min-h-screen pb-20 fade-in ${isZh ? 'font-serif' : 'font-sans'}`}>
            <header className="mb-16 border-l-4 border-red-600 pl-6">
                <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight mb-2">Wang Te-Hsu</h1>
                <p className="text-red-500 font-mono tracking-widest text-sm uppercase">{labels.subtitle}</p>
            </header>

            <div className="space-y-16">
                {/* EDUCATION */}
                <section>
                    <h2 className="text-2xl font-serif text-white border-b border-white/20 pb-4 mb-8 flex items-center">
                        <span className="text-red-500 mr-2">01 //</span> {labels.edu}
                    </h2>
                    <div className="md:grid md:grid-cols-[1fr_auto] gap-4 mb-4">
                        <h3 className="text-xl font-bold text-gray-200">{education.school}</h3>
                        <div className="text-red-500 font-mono text-sm">{education.period}</div>
                    </div>
                    <p className="text-gray-400 leading-relaxed max-w-3xl">{education.desc}</p>
                </section>

                {/* PROFESSIONAL EXPERIENCE */}
                <section>
                    <h2 className="text-2xl font-serif text-white border-b border-white/20 pb-4 mb-8 flex items-center">
                        <span className="text-red-500 mr-2">02 //</span> {labels.exp}
                    </h2>
                    <div className="space-y-10">
                        {experiences.map((exp, idx) => (
                            <div key={idx} className="relative pl-6 border-l border-white/10 hover:border-red-500/50 transition-colors">
                                <div className="absolute top-0 left-[-4px] w-2 h-2 bg-red-600 rounded-full"></div>
                                <div className="md:flex justify-between items-baseline mb-2">
                                    <h3 className="text-xl font-bold text-gray-200">{exp.company}</h3>
                                    <span className="text-red-500 font-mono text-xs whitespace-nowrap">{exp.period}</span>
                                </div>
                                {exp.role && <div className="text-white/80 font-serif italic mb-3">{exp.role}</div>}
                                <ul className="space-y-2">
                                    {exp.details.map((detail, dIdx) => (
                                        <li key={dIdx} className="text-gray-400 text-sm leading-relaxed flex items-start">
                                            <span className="text-red-900 mr-2 mt-1">::</span>
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* LEADERSHIP */}
                <section>
                    <h2 className="text-2xl font-serif text-white border-b border-white/20 pb-4 mb-8 flex items-center">
                        <span className="text-red-500 mr-2">03 //</span> {labels.lead}
                    </h2>
                    <div className="space-y-10">
                        {leadership.map((item, idx) => (
                            <div key={idx} className="relative group">
                                <div className="md:flex justify-between items-baseline mb-2">
                                    <h3 className="text-lg font-bold text-gray-200 group-hover:text-red-500 transition-colors">{item.organization}</h3>
                                    <span className="text-gray-600 font-mono text-xs whitespace-nowrap">{item.period}</span>
                                </div>
                                <div className="text-white/80 font-serif italic mb-3">{item.role}</div>
                                <ul className="space-y-2 border-l border-white/5 pl-4 ml-1">
                                    {item.details.map((detail, dIdx) => (
                                        <li key={dIdx} className="text-gray-400 text-sm leading-relaxed">
                                            - {detail}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SKILLS */}
                <section>
                    <h2 className="text-2xl font-serif text-white border-b border-white/20 pb-4 mb-8 flex items-center">
                        <span className="text-red-500 mr-2">04 //</span> {labels.supp}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300">
                        {skills.map((s, idx) => (
                            <div key={idx} className="border border-white/10 p-5 bg-[#0a0a0a] hover:border-red-500/50 transition-colors group">
                                <div className="flex items-center mb-4">
                                    <div className="w-1.5 h-1.5 bg-red-600 mr-2 group-hover:animate-pulse"></div>
                                    <strong className="text-white font-serif tracking-widest uppercase">{s.label}</strong>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {s.items.map((item, iIdx) => (
                                        <span key={iIdx} className="border border-white/20 bg-white/5 px-2.5 py-1 text-xs font-mono text-gray-400 group-hover:border-red-500/30 group-hover:text-red-100 transition-colors">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECURE CHANNEL — Contact */}
                <SecureChannel isZh={isZh} />
            </div>
        </div>
    );
};
