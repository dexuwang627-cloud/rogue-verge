import React, { useEffect } from 'react';
import { TRANSLATIONS } from '../../data/constants';

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
            </div>
        </div>
    );
};
