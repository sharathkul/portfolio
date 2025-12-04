"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import {
    Network,
    MessageSquare,
    ArrowRight,
    Stethoscope,
    CreditCard,
    Terminal,
    Map,
    ChevronRight,
    TrendingUp,
    ShieldCheck,
    BookOpen,
    GraduationCap,
    Award,
    Linkedin
} from "lucide-react";

// --- 1. UTILITY COMPONENTS & STYLES ---

const Section = ({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) => (
    <section id={id} className={`relative w-full min-h-screen flex flex-col justify-start md:justify-center px-6 md:px-12 lg:px-24 py-20 ${className}`}>
        {children}
    </section>
);

const MonoLabel = ({ children, color = "text-cyan-400" }: { children: React.ReactNode; color?: string }) => (
    <span className={`font-mono text-xs tracking-widest uppercase ${color} mb-2 block opacity-80`}>
        {children}
    </span>
);

// --- SCRAMBLE TEXT (Futuristic Text Effect) ---
const ScrambleText = ({ text, className }: { text: string; className?: string }) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
    const [display, setDisplay] = useState(text);
    const [hovering, setHovering] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (hovering) {
            let iteration = 0;
            interval = setInterval(() => {
                setDisplay(
                    text
                        .split("")
                        .map((letter, index) => {
                            if (index < iteration) return text[index];
                            return chars[Math.floor(Math.random() * chars.length)];
                        })
                        .join("")
                );
                if (iteration >= text.length) clearInterval(interval);
                iteration += 1 / 3;
            }, 30);
        } else {
            setDisplay(text);
        }
        return () => clearInterval(interval);
    }, [hovering, text]);

    return (
        <span
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className={`cursor-default ${className}`}
        >
            {display}
        </span>
    );
};

// --- HOLO AVATAR ---
const HoloAvatar = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="relative w-24 h-24 md:w-32 md:h-32 mb-8 group"
        >
            {/* Rotating Outer Ring */}
            <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30 animate-[spin_10s_linear_infinite]" />

            {/* Glowing Container */}
            <div className="absolute inset-1 rounded-full overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.3)] bg-slate-900 z-10">
                <Image
                    src="/profile.jpg"
                    alt="Sharath Kulkarni"
                    fill
                    className="object-cover opacity-90 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                />

                {/* Scanner Line Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent w-full h-[20%] animate-[scan_3s_ease-in-out_infinite] pointer-events-none" />
            </div>

            {/* Static decorative marks */}
            <div className="absolute -inset-2 border border-transparent border-t-cyan-500/60 border-b-cyan-500/60 rounded-full opacity-50 rotate-45 pointer-events-none" />
        </motion.div>
    );
};

// --- HOLO CARD (Mobile Optimized) ---
const HoloCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-0.5, 0.5], [5, -5]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (window.innerWidth < 768) return;
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`
        relative bg-slate-900/40 border border-slate-700/50 backdrop-blur-md p-6 md:p-8 rounded-xl overflow-hidden
        hover:border-cyan-500/50 hover:bg-slate-800/60 transition-colors duration-500 group
        ${className}
      `}
        >
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(34, 211, 238, 0.5) 45%, rgba(255, 255, 255, 0.3) 50%, transparent 54%)",
                    mixBlendMode: "color-dodge"
                }}
            />

            <div style={{ transform: "translateZ(20px)" }}>
                {children}
            </div>
        </motion.div>
    );
};


// --- 2. DYNAMIC BACKGROUNDS (Web Visibility Boosted) ---

const TrajectoryBackground = ({ activeType }: { activeType: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.parentElement?.offsetWidth || window.innerWidth;
        let height = canvas.parentElement?.offsetHeight || window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const isMobile = width < 768;
        const radiusScale = isMobile ? 0.45 : 0.35;

        const nodes = [
            { label: "AI", x: 0, y: 0, z: 0, angle: 0, speed: 0.002, type: "ai" },
            { label: "CLINICAL", x: 0, y: 0, z: 0, angle: 2, speed: 0.003, type: "ops" },
            { label: "DATA", x: 0, y: 0, z: 0, angle: 4, speed: 0.002, type: "ai" },
            { label: "OPS", x: 0, y: 0, z: 0, angle: 1, speed: 0.004, type: "ops" },
            { label: "AUTOMATION", x: 0, y: 0, z: 0, angle: 1, speed: 0.004, type: "automation" },
            { label: "REVENUE", x: 0, y: 0, z: 0, angle: 3, speed: 0.003, type: "ops" },
            { label: "BRAND", x: 0, y: 0, z: 0, angle: 5, speed: 0.002, type: "brand" },
        ];

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            const cx = width / 2;
            const cy = height / 2;
            const radius = Math.min(width, height) * radiusScale;

            nodes.forEach((node) => {
                node.angle += node.speed;
                const x = Math.cos(node.angle) * radius;
                const z = Math.sin(node.angle) * radius;
                const scale = (z + 1000) / 1000;
                const px = cx + x * scale;
                const py = cy + z * 0.2 * scale;

                const isRelevant =
                    (activeType === "ai" && (node.type === "ai" || node.type === "data")) ||
                    (activeType === "ops" && (node.type === "ops" || node.type === "clinical")) ||
                    (activeType === "brand" && node.type === "brand") ||
                    (activeType === "founder");

                const baseOpacity = isMobile ? 0.6 : 0.8;
                const dimOpacity = isMobile ? 0.1 : 0.2;
                const opacity = isRelevant ? baseOpacity : dimOpacity;
                const color = isRelevant ? "#22d3ee" : "#475569";

                ctx.font = isMobile ? `8px 'JetBrains Mono'` : `10px 'JetBrains Mono'`;
                ctx.fillStyle = color;
                ctx.globalAlpha = opacity;
                ctx.fillText(node.label, px, py);

                if (isRelevant) {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(px, py);
                    ctx.stroke();
                }
            });
            requestAnimationFrame(animate);
        };
        const animId = requestAnimationFrame(animate);

        const handleResize = () => {
            width = canvas.parentElement?.offsetWidth || window.innerWidth;
            height = canvas.parentElement?.offsetHeight || window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener("resize", handleResize);
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", handleResize);
        };
    }, [activeType]);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-50" />;
};

// ** UPDATED ANCHOR VISUAL FOR BETTER DESKTOP VISIBILITY **
const AnchorVisual = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const isMobile = width < 768;

        // VISIBILITY ADJUSTMENTS:
        // Desktop: 450 stars (was 200) for density on large screens
        // Mobile: 60 stars (kept same)
        const starCount = isMobile ? 60 : 450;

        // Desktop: Connect further away to create webs (120px)
        // Mobile: Connect close (40px)
        const connectionDistance = isMobile ? 40 : 120;

        // Base opacity for connection lines
        const baseLineOpacity = isMobile ? 0.1 : 0.2;

        const stars: { x: number; y: number; z: number; o: number }[] = [];
        const focalLength = canvas.width / 2;
        const centerX = width / 2;
        const centerY = height / 2;

        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * width - centerX,
                y: Math.random() * height - centerY,
                z: Math.random() * width,
                o: Math.random(),
            });
        }

        const animate = () => {
            ctx.fillStyle = "#0f1014";
            ctx.fillRect(0, 0, width, height);

            const targetX = (mouseRef.current.x - width / 2) * 0.1;
            const targetY = (mouseRef.current.y - height / 2) * 0.1;

            stars.forEach((star) => {
                star.z -= 2;

                if (star.z <= 0) {
                    star.x = Math.random() * width - centerX;
                    star.y = Math.random() * height - centerY;
                    star.z = width;
                }

                const perspective = focalLength / (star.z + 100);
                const starX = centerX + star.x * perspective + (targetX * (1 - perspective));
                const starY = centerY + star.y * perspective + (targetY * (1 - perspective));

                const radius = 1.5 * (1 - star.z / width);
                const alpha = star.o * (1 - star.z / width);

                ctx.beginPath();
                ctx.arc(starX, starY, radius > 0 ? radius : 0, 0, 2 * Math.PI);
                ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`;
                ctx.fill();

                stars.forEach((otherStar) => {
                    if (star === otherStar) return;
                    if (Math.abs(star.z - otherStar.z) > 100) return;

                    const otherPerspective = focalLength / (otherStar.z + 100);
                    const otherX = centerX + otherStar.x * otherPerspective + (targetX * (1 - otherPerspective));
                    const otherY = centerY + otherStar.y * otherPerspective + (targetY * (1 - otherPerspective));

                    const dist = Math.sqrt((starX - otherX) ** 2 + (starY - otherY) ** 2);

                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(starX, starY);
                        ctx.lineTo(otherX, otherY);
                        // Using higher base opacity for desktop
                        ctx.strokeStyle = `rgba(34, 211, 238, ${baseLineOpacity * (1 - dist / connectionDistance)})`;
                        ctx.stroke();
                    }
                });
            });

            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />;
};

const SystemStatus = () => {
    const { scrollYProgress } = useScroll();
    const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    return (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 z-50 mix-blend-difference">
            <div className="text-[10px] font-mono text-cyan-500 rotate-180" style={{ writingMode: 'vertical-rl' }}>
                <ScrambleText text="SYSTEM_ACTIVE" />
            </div>
            <div className="w-[1px] h-32 bg-slate-800 relative overflow-hidden">
                <motion.div style={{ scaleY, transformOrigin: "top" }} className="absolute top-0 left-0 w-full h-full bg-cyan-400" />
            </div>
            <div className="text-[10px] font-mono text-slate-500">
                V 2.1
            </div>
        </div>
    );
};


// --- 4. DATA CONSTANTS ---

const CAREER_DATA = [
    {
        id: "current-ai",
        type: "ai",
        label: "Current — AI & systems lead",
        title: "AI and systems lead for a specialty network",
        desc: "Works closely with physicians, nurses and clinic staff across multiple sites in a specialty network.",
        bullets: [
            "Shapes how referrals, programs and visits actually move through the day, from first contact to follow up.",
            "Designs analytics that give leaders a clean view of access, throughput and value based care performance.",
            "Experiments with AI where it helps most, such as summarising information, highlighting risk and supporting conversation-based tools, while keeping clinical teams in control."
        ],
        takeaway: "Comfortable translating messy front line reality into roadmaps and systems that both clinicians and product teams trust."
    },
    {
        id: "current-ops",
        type: "ops",
        label: "Current — Operations & platform lead",
        title: "Operations and platform lead for a management organisation",
        desc: "Leads the management and revenue cycle organisation that supports the multiple primary & specialty networks.",
        bullets: [
            "Built and now guides a compact engineering team that designs and ships the internal tools everyone uses, from worklists and dashboards to AI supported workflows.",
            "Leads a team of about fifty people across charge capture, billing, accounts receivable and denials, with a simple goal: clean claims, clear aging and fewer surprises.",
            "Connects issues in claims, contracts and operations back to their source so fixes are made in the system instead of through one off workarounds."
        ],
        takeaway: "Brings an operator’s view to product and process decisions, measured in clean claims, aging, denials and team stability."
    },
    {
        id: "earlier-founder",
        type: "founder",
        label: "Earlier — Co-founder and operator",
        title: "Co-founder and operator in design and architecture",
        desc: "Helped build an architectural and interior design studio from the ground up.",
        bullets: [
            "Built the studio from scratch on the business side – brand, positioning, go-to-market, pricing, service roadmap, and client pipeline.",
            "Managed projects end to end, from early sketches and 3D visualizations through coordination with contractors, vendors, and on-site execution.",
            "Coordinated a small team of designers and partners, balancing aesthetics, feasibility, budgets, and timelines, and keeping delivery predictable."
        ],
        takeaway: "Operates with a founder mindset and is comfortable going from a blank page to a shipped experience, balancing what users want with what the business and delivery teams can support."
    },
    {
        id: "earlier-brand",
        type: "brand",
        label: "Earlier — Brand, marketing & growth",
        title: "Brand, marketing and growth work",
        desc: "Spent time working on brand and growth before moving fully into operations and healthcare.",
        bullets: [
            "Crafting messages and campaigns that made sense to ordinary people, not just insiders.",
            "Testing different ways to tell the same story and keeping the ones that actually moved behaviour.",
            "Aligning the experience on the ground with whatever was being promised in the pitch."
        ],
        takeaway: "Comfortable sitting in front of customers, executives or investors and explaining complex systems in clear, everyday language."
    }
];

const EDUCATION_DATA = [
    {
        title: "MS in Computer Science",
        subtitle: "[Sofia University – California]",
        body: "Focus on AI, data and software engineering while working full time in health care operations.",
        icon: GraduationCap
    },
    {
        title: "Master’s degree",
        subtitle: "[California State University, Fresno]",
        body: "Foundation in business, analytics and operations.",
        icon: GraduationCap
    },
    {
        title: "Bachelor’s degree",
        subtitle: "[Bangalore University]",
        body: "Foundation in business, analytics and operations.",
        icon: GraduationCap
    },
    {
        title: "Additional certifications",
        subtitle: "Professional Development",
        body: "Independent certifications in product management, marketing, AI and data visualization.",
        icon: Award
    },
];

const SYSTEM_STEPS = [
    { step: "01", title: "First contact", desc: "Referrals, calls and digital requests land in one place instead of being scattered across fax queues, inboxes and sticky notes. Repetitive intake questions are handled by simple automations so staff can focus on people, not paperwork.", icon: MessageSquare, color: "emerald" },
    { step: "02", title: "Coverage and readiness", desc: "Eligibility, benefits and basic checks are pulled earlier in the journey. The system flags gaps in coverage, missing authorizations and high-risk cases before the visit, so there are fewer surprises for patients and fewer write-offs for the practice.", icon: ShieldCheck, color: "emerald" },
    { step: "03", title: "Visits and programs", desc: "Visits, procedures and longer-running programs show up as a clean timeline across locations. Notes, orders and follow ups are supported by lightweight voice and text tools, so what actually happened in the room is what shows up in the record.", icon: Stethoscope, color: "emerald" },
    { step: "04", title: "Turning care into data", desc: "Charges, codes and program enrollment are captured once, in a structure that flows cleanly into billing, quality reporting and value-based contracts. Rules live in one place, so teams do not have to remember every edge case for every plan.", icon: Terminal, color: "cyan" },
    { step: "05", title: "Money in motion", desc: "Claims go out clean, and status comes back into a single view instead of a dozen portals. Worklists are generated automatically, routing issues and next steps to the right people instead of another shared spreadsheet.", icon: CreditCard, color: "cyan" },
    { step: "06", title: "Learning from the loop", desc: "Denials, underpayments and performance trends roll up into simple views that point to what needs to change in the system – front-end checks, documentation, coding or follow up – instead of just adding more tasks to the queue.", icon: TrendingUp, color: "cyan" },
];

const SNAPSHOTS = [
    {
        title: "Giving payer & vendor contracts a home; the team actually uses",
        context: "Rates, terms and renewal dates lived in PDFs, email threads and paper folders. Underpayments were spotted one claim at a time.",
        action: "Introduced Nexus, an internal contract and rate layer that stores fee schedules, terms and key dates in a structured way. Connected Nexus to ClaimCatalyst so every claim carries its expected allowed amount and basic rules for that plan.",
        result: "Underpayments and bad terms are no longer a guessing game. Difficult or unprofitable plans rise to the surface, and leaders can see which contracts need attention without starting a months long forensic project."
    },
    {
        title: "Making denials less mysterious",
        context: "Denials and follow up work lived in portals, spreadsheets and personal notes. Patterns were hard to see.",
        action: "Brought claims, reasons and actions into one view with simple categories that operators actually use.",
        result: "Leaders can now ask why a plan is difficult and get an answer that is backed by data, not just frustration."
    },
    {
        title: "Trying conversational AI where it helps",
        context: "Teams and patients spent too much time inside rigid phone trees and scripts that did not respect context.",
        action: "Started layering voice and text AI on top of existing workflows for routine questions and status checks, with clear boundaries.",
        result: "Early signs show less friction on simple tasks and more time for staff to handle the hard ones."
    }
];

// --- 5. MAIN PAGE COMPONENT ---

const SystemSection = () => (
    <Section id="system" className="py-24">
        <div className="max-w-7xl mx-auto w-full relative z-10">
            <MonoLabel>Current build</MonoLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5"><ScrambleText text="What is being built right now" /></h2>
            <h2 className="text-3xl md:text-2xl font-mono text-white mb-16"><ScrambleText text="Building a centralized AI-powered layer that sits on top of existing tools so intake, coverage, visits, billing and learning all feel like one connected system instead of silos." /></h2>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SYSTEM_STEPS.map((step, i) => (
                    <HoloCard key={i} className="flex flex-col h-full group hover:bg-slate-800/80 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-lg bg-${step.color}-500/10 border border-${step.color}-500/20 text-${step.color}-400`}>
                                <step.icon size={24} />
                            </div>
                            <span className="font-mono text-xs text-slate-600">STEP {step.step}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                        <p className="text-slate-400 leading-relaxed text-sm flex-grow">{step.desc}</p>
                    </HoloCard>
                ))}
            </div>
        </div>
    </Section>
);

const SnapshotsSection = () => (
    <Section id="snapshots" className="py-24 bg-slate-900/20">
        <div className="max-w-6xl mx-auto w-full relative z-10">
            <MonoLabel>Case Studies</MonoLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-16"><ScrambleText text="System Snapshots" /></h2>

            <div className="space-y-24">
                {SNAPSHOTS.map((snap, i) => (
                    <div key={i} className="grid md:grid-cols-12 gap-8 md:gap-16 items-center">
                        <div className="md:col-span-4 relative">
                            <div className="absolute -left-4 -top-4 text-9xl font-bold text-slate-800/50 select-none -z-10">
                                0{i + 1}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{snap.title}</h3>
                            <div className="w-12 h-1 bg-cyan-500 mb-6" />
                            <p className="text-slate-400 italic">"{snap.context}"</p>
                        </div>
                        <div className="md:col-span-8">
                            <HoloCard className="relative overflow-hidden">
                                <div className="grid md:grid-cols-2 gap-8 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3 text-cyan-400">
                                            <Terminal size={16} />
                                            <span className="font-mono text-xs uppercase tracking-wider">Action</span>
                                        </div>
                                        <p className="text-slate-300">{snap.action}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-3 text-emerald-400">
                                            <TrendingUp size={16} />
                                            <span className="font-mono text-xs uppercase tracking-wider">Result</span>
                                        </div>
                                        <p className="text-slate-300">{snap.result}</p>
                                    </div>
                                </div>
                            </HoloCard>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </Section>
);

const EducationSection = () => (
    <Section id="education" className="py-24">
        <div className="max-w-5xl mx-auto w-full relative z-10">
            <MonoLabel>Knowledge Base</MonoLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-16"><ScrambleText text="Education & Training" /></h2>

            <div className="grid md:grid-cols-4 gap-8">
                {EDUCATION_DATA.map((edu, i) => (
                    <div key={i} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                        <div className="relative p-6 border-l-2 border-slate-800 group-hover:border-cyan-500 transition-colors">
                            <div className="mb-4 text-slate-500 group-hover:text-cyan-400 transition-colors">
                                <edu.icon size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{edu.title}</h3>
                            <p className="text-cyan-400/80 text-sm font-mono mb-4">{edu.subtitle}</p>
                            <p className="text-slate-400 text-sm leading-relaxed">{edu.body}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </Section>
);

export default function OperatorInterface() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [activeNodeIndex, setActiveNodeIndex] = useState(0);
    const activeCareerNode = CAREER_DATA[activeNodeIndex];

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <main className="relative text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-100 font-sans overflow-x-hidden">
            {/* Global Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-cyan-500 origin-left z-50"
                style={{ scaleX }}
            />

            {/* Global Background (Warp Speed) */}
            <AnchorVisual />
            <SystemStatus />

            {/* --- HERO SECTION --- */}
            <Section id="hero" className="items-start justify-center">
                <div className="grid lg:grid-cols-2 gap-12 w-full max-w-7xl mx-auto items-center pt-12">

                    {/* Left Content */}
                    <div className="max-w-2xl z-10">
                        {/* PROFILE PICTURE */}
                        <HoloAvatar />

                        <div className="flex items-center gap-3">
                            <MonoLabel>Operator Profile</MonoLabel>
                            {/* LINKEDIN ICON */}
                            <a
                                href="https://www.linkedin.com/in/sharathkulkarni/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-200 transition-colors mb-2"
                            >
                                <Linkedin size={16} />
                            </a>
                        </div>

                        <h1 className="text-5xl md:text-8xl font-bold text-white mb-6 tracking-tight leading-none">
                            <ScrambleText text="Sharath" /> <br /> <ScrambleText text="Kulkarni" />
                        </h1>
                        <h2 className="text-lg md:text-2xl text-cyan-400/90 font-light mb-8 max-w-lg">
                            Building applied AI systems in Healthcare
                        </h2>

                        <div className="space-y-6 text-base md:text-lg text-slate-400 max-w-lg leading-relaxed mb-12 border-l-2 border-slate-800 pl-6">
                            <p>I work inside a healthcare organisation & MSO where care delivery, operations and revenue all meet. Most days are spent aligning clinicians, front desk teams, billers and engineers around the same problems.</p>
                            <p>Over the past few years that has meant shaping an internal platform that follows a patient from first contact to final payment. Referrals, intake, eligibility, scheduling, program workflows, claim status, denials and leadership analytics now share one set of rails, with early voice and text AI layered on top.</p>
                            <p>This site is a quick tour of that work and a way to show how the same mix of provider side experience, MSO operations and product leadership can help other teams who are trying to build practical AI in healthcare.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => scrollToSection('trajectory')}
                                className="px-8 py-4 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 rounded text-sm font-mono tracking-wider transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2 group justify-center"
                            >
                                <Map className="w-4 h-4" />
                                FOLLOW THE JOURNEY
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                            <button
                                onClick={() => scrollToSection('system')}
                                className="px-8 py-4 text-slate-400 hover:text-white text-sm font-mono tracking-wider transition-colors border border-transparent hover:border-slate-800 rounded flex items-center gap-2 justify-center"
                            >
                                <Network className="w-4 h-4" />
                                SEE TODAY’S SYSTEM
                            </button>
                        </div>
                    </div>

                    {/* Right Animation (CORE) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="flex justify-center items-center relative h-[300px] md:h-[500px] w-full mt-8 lg:mt-0 z-10"
                    >
                        <div className="absolute w-32 h-32 rounded-full border border-cyan-500/30 bg-cyan-900/10 backdrop-blur-sm flex items-center justify-center animate-pulse">
                            <div className="w-24 h-24 rounded-full border border-cyan-400/50 flex items-center justify-center">
                                <span className="font-mono text-xs text-cyan-300">CORE</span>
                            </div>
                        </div>

                        {["CLINICAL", "REVENUE", "DATA", "AI", "OPS"].map((label, i) => (
                            <motion.div
                                key={label}
                                className="absolute flex flex-col items-center gap-2"
                                animate={{
                                    rotate: 360,
                                }}
                                transition={{
                                    duration: 20 + i * 5,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                style={{
                                    transformOrigin: "center center",
                                    width: "100%",
                                    height: "100%"
                                }}
                            >
                                <div
                                    className="w-full h-full relative"
                                    style={{ transform: `rotate(${i * 72}deg)` }}
                                >
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                                        <span className="text-[10px] font-mono text-slate-500 uppercase bg-slate-900/80 px-1 border border-slate-800 backdrop-blur-md">
                                            {label}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                </div>
            </Section>

            {/* --- UNIFIED TRAJECTORY & EXPERIENCE SECTION --- */}
            <section id="trajectory" className="relative w-full min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 py-24 overflow-hidden">
                <TrajectoryBackground activeType={activeCareerNode.type} />

                <div className="relative z-10 max-w-6xl mx-auto w-full">
                    <MonoLabel>Trajectory</MonoLabel>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-12"><ScrambleText text="Path and roles so far" /></h2>

                    {/* Timeline Navigation */}
                    <div className="relative mb-8 md:mb-16">
                        <div className="absolute top-6 left-[12.5%] right-[12.5%] h-[1px] bg-slate-800 hidden md:block">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${(activeNodeIndex / (CAREER_DATA.length - 1)) * 100}%` }}
                                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                            />
                        </div>

                        {/* MOBILE OPTIMIZATION */}
                        <div className="relative group">
                            <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-4 snap-x md:pb-0 md:overflow-visible no-scrollbar">
                                {CAREER_DATA.map((node, index) => {
                                    const isActive = index === activeNodeIndex;
                                    return (
                                        <button
                                            key={node.id}
                                            onClick={() => setActiveNodeIndex(index)}
                                            className={`
                                                relative flex flex-col items-center p-4 rounded-xl transition-all duration-300 text-center outline-none shrink-0 w-40 md:w-auto snap-center
                                                ${isActive ? 'bg-slate-800/80 border border-cyan-500/30' : 'hover:bg-slate-800/40 border border-transparent'}
                                            `}
                                        >
                                            <div className={`
                                                hidden md:flex items-center justify-center w-4 h-4 rounded-full mb-4 z-10 transition-all duration-500 relative
                                                ${isActive ? 'bg-cyan-950 border-2 border-cyan-400 scale-125' : 'bg-slate-900 border border-slate-700 group-hover:border-slate-500'}
                                            `}>
                                                {isActive && <div className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />}
                                            </div>

                                            <span className={`text-xs font-mono mb-1 block ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                                                {index === 0 || index === 1 ? 'Current' : 'Earlier'}
                                            </span>
                                            <span className={`text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                                {node.label.replace(/Current — |Earlier — /, "")}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* SCROLL INDICATORS FOR MOBILE */}
                            <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-slate-900 via-slate-900/50 to-transparent pointer-events-none md:hidden" />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 md:hidden animate-pulse pointer-events-none text-cyan-400">
                                <ChevronRight size={24} strokeWidth={3} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                            </div>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* ... content panels ... */}
                        <div className="lg:col-span-8">
                            <HoloCard className="h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-2 h-2 rounded-full ${activeCareerNode.type === 'ai' ? 'bg-purple-400' : activeCareerNode.type === 'ops' ? 'bg-cyan-400' : 'bg-orange-400'}`} />
                                    <MonoLabel color="text-slate-300">{activeCareerNode.label}</MonoLabel>
                                </div>

                                <motion.div
                                    key={activeCareerNode.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                        {activeCareerNode.title}
                                    </h3>
                                    <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                                        {activeCareerNode.desc}
                                    </p>

                                    <ul className="space-y-4 mb-8">
                                        {activeCareerNode.bullets.map((bullet, i) => (
                                            <li key={i} className="flex items-start gap-3 text-slate-400">
                                                <ChevronRight className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                                                <span>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>

                                <div className="pt-6 border-t border-slate-700/50">
                                    <p className="text-sm font-mono text-cyan-400 mb-2">TAKEAWAY</p>
                                    <p className="text-slate-300 italic">"{activeCareerNode.takeaway}"</p>
                                </div>
                            </HoloCard>
                        </div>

                        <div className="lg:col-span-4 flex flex-col gap-4">
                            <HoloCard className="flex-1 flex flex-col justify-center bg-gradient-to-br from-slate-900/80 to-slate-900/40">
                                <MonoLabel>Common Thread</MonoLabel>
                                <p className="text-slate-300 leading-relaxed">
                                    Understand the ground reality first, then design systems and stories that respect it.
                                </p>
                            </HoloCard>
                            <HoloCard className="flex-1 flex flex-col justify-center">
                                <MonoLabel>Focus Area</MonoLabel>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {activeCareerNode.type === 'ai' && (
                                        <>
                                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30">AI Agents</span>
                                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30">Analytics</span>
                                        </>
                                    )}
                                    {activeCareerNode.type === 'ops' && (
                                        <>
                                            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded border border-cyan-500/30">Revenue Cycle</span>
                                            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded border border-cyan-500/30">Team Mgmt</span>
                                        </>
                                    )}
                                    {(activeCareerNode.type === 'founder' || activeCareerNode.type === 'brand') && (
                                        <>
                                            <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded border border-orange-500/30">Strategy</span>
                                            <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded border border-orange-500/30">Growth</span>
                                        </>
                                    )}
                                </div>
                            </HoloCard>
                        </div>
                    </div>
                </div>
            </section>

            {/* ... rest of sections ... */}
            <SystemSection />
            <SnapshotsSection />
            <EducationSection />

            {/* --- CONTACT --- */}
            <Section id="contact" className="py-32">
                <div className="max-w-4xl mx-auto w-full">
                    <MonoLabel>Next Steps</MonoLabel>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                        Where this experience helps
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-3">0 to 1 Building</h3>
                            <p className="text-slate-400">
                                Setting up the first version of operations, data infrastructure, or tech-enabled service lines.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-3">Scaling & Fixing</h3>
                            <p className="text-slate-400">
                                Diagnosing why a system is broken, why claims are denied, or why the team is burning out—and fixing it.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {/* GET IN TOUCH BUTTON - UPDATED LINK */}
                        <a href="https://www.linkedin.com/in/sharathkulkarni/" target="_blank" rel="noopener noreferrer">
                            <button className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-lg transition-colors shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                                Get in Touch
                            </button>
                        </a>
                        <button className="px-8 py-4 border border-slate-700 hover:border-slate-500 text-white rounded-lg transition-colors">
                            View Resume
                        </button>
                    </div>
                </div>
            </Section>

            <footer className="py-8 text-center border-t border-slate-800/50 relative z-10 bg-slate-950">
                <p className="text-slate-600 text-xs font-mono">
                    SYSTEM_ID: 8492-A // STATUS: OPTIMAL
                </p>
            </footer>
        </main>
    );
}