"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Zap, Bot, Shield, ChevronRight, Play, 
    CheckCircle2, AlertCircle, RefreshCw, 
    ArrowRight, BarChart3, Users, Clock,
    Undo2, Cpu, Sparkles, MessageSquare, X
} from 'lucide-react';

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [demoState, setDemoState] = useState<'idle' | 'creating' | 'assigning' | 'rebalancing' | 'done'>('idle');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const runDemo = async () => {
        setDemoState('creating');
        await new Promise(r => setTimeout(r, 1000));
        setDemoState('assigning');
        await new Promise(r => setTimeout(r, 1500));
        setDemoState('rebalancing');
        await new Promise(r => setTimeout(r, 2000));
        setDemoState('done');
    };

    return (
        <div className="landing-container">
            {/* Navigation */}
            <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
                <div className="nav-content">
                    <div className="logo">
                        <Zap color="#0052CC" fill="#0052CC" size={24} />
                        <span>Stroovo</span>
                    </div>
                    <div className="nav-links">
                        <a href="#features">Features</a>
                        <a href="#demo">Demo</a>
                        <a href="#solution">Solution</a>
                        <Link href="/login" className="btn-secondary">Login</Link>
                        <Link href="/signup" className="btn-primary">Start Free</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="badge">AI-Powered Autonomous Operations</div>
                    <h1>Your Team. <span className="gradient-text">Running Itself.</span></h1>
                    <p className="subheadline">
                        Stop managing work. Let AI run it. Stroovo automatically assigns, 
                        balances, and fixes your team's work in real-time.
                    </p>
                    <div className="hero-ctas">
                        <Link href="/signup" className="btn-primary-lg">Start Free <ChevronRight size={20} /></Link>
                        <button onClick={() => document.getElementById('demo')?.scrollIntoView()} className="btn-outline-lg">
                            <Play size={18} fill="currentColor" /> See it in action
                        </button>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="visual-wrapper">
                        <img src="/stroovo_hero_visual_1777192929982.png" alt="Stroovo AI Dashboard" />
                        <div className="glass-card floating-1">
                            <Bot size={20} color="#0052CC" />
                            <div>
                                <h6>AI Optimized</h6>
                                <p>Efficiency up 42%</p>
                            </div>
                        </div>
                        <div className="glass-card floating-2">
                            <Zap size={20} color="#FFAB00" />
                            <div>
                                <h6>Auto Rebalanced</h6>
                                <p>3 Tasks reassigned</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Demo Section */}
            <section id="demo" className="demo-section">
                <div className="section-header">
                    <h2>Experience the <span className="gradient-text">Autopilot.</span></h2>
                    <p>Watch Stroovo handle complex team operations in seconds.</p>
                </div>
                
                <div className="demo-container">
                    <div className="demo-sidebar">
                        <div className={`demo-step ${demoState === 'creating' ? 'active' : ''}`}>
                            <div className="step-num">1</div>
                            <div>
                                <h6>Create Task</h6>
                                <p>Input your requirements</p>
                            </div>
                        </div>
                        <div className={`demo-step ${demoState === 'assigning' ? 'active' : ''}`}>
                            <div className="step-num">2</div>
                            <div>
                                <h6>AI Assigns</h6>
                                <p>Best fit selected instantly</p>
                            </div>
                        </div>
                        <div className={`demo-step ${demoState === 'rebalancing' ? 'active' : ''}`}>
                            <div className="step-num">3</div>
                            <div>
                                <h6>AI Rebalances</h6>
                                <p>Prevents team burnout</p>
                            </div>
                        </div>
                        <button onClick={runDemo} className="btn-demo-run" disabled={demoState !== 'idle' && demoState !== 'done'}>
                            {demoState === 'idle' || demoState === 'done' ? 'Run Live Demo' : 'Running...'}
                        </button>
                    </div>
                    
                    <div className="demo-view">
                        <div className="mock-ui">
                            <div className="mock-header">
                                <div className="mock-dot" />
                                <div className="mock-dot" />
                                <div className="mock-dot" />
                                <span className="mock-title">Stroovo Autonomous Engine</span>
                            </div>
                            <div className="mock-content">
                                {demoState === 'idle' && <div className="demo-placeholder">Press Run to see the magic</div>}
                                
                                {demoState === 'creating' && (
                                    <div className="demo-anim-card">
                                        <div className="skeleton title" />
                                        <div className="skeleton line" />
                                        <div className="tag">Creating Task...</div>
                                    </div>
                                )}
                                
                                {demoState === 'assigning' && (
                                    <div className="demo-anim-card active-pulse">
                                        <div className="card-header">
                                            <h6>Cloud Migration</h6>
                                            <span className="priority">Urgent</span>
                                        </div>
                                        <div className="ai-logic">
                                            <Cpu size={14} /> AI Analyzing Best Assignee...
                                        </div>
                                        <div className="assignee-preview">
                                            <div className="avatar">AJ</div>
                                            <span>Alex Johnson (98% match)</span>
                                        </div>
                                    </div>
                                )}
                                
                                {demoState === 'rebalancing' && (
                                    <div className="rebalance-view">
                                        <div className="warning-pill"><AlertCircle size={14} /> Alex Overloaded (120%)</div>
                                        <div className="transfer-anim">
                                            <div className="user-node">AJ</div>
                                            <div className="arrow-flow"><ArrowRight size={20} /></div>
                                            <div className="user-node highlight">SS</div>
                                        </div>
                                        <p>Reassigning 2 tasks to Sarah Smith to ensure deadline.</p>
                                        <button className="undo-pill"><Undo2 size={14} /> Undo Action</button>
                                    </div>
                                )}

                                {demoState === 'done' && (
                                    <div className="done-view">
                                        <CheckCircle2 size={48} color="#36B37E" />
                                        <h4>Workflow Optimized</h4>
                                        <p>Risks mitigated. Team balanced. Deadlines secured.</p>
                                        <button onClick={() => setDemoState('idle')} className="btn-secondary">Reset</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem & Solution */}
            <section id="solution" className="compare-section">
                <div className="compare-grid">
                    <div className="compare-card problem">
                        <h4>The Old Way</h4>
                        <ul>
                            <li><X size={18} /> Manual task assignment (hours wasted)</li>
                            <li><X size={18} /> Overloaded teams & burnout</li>
                            <li><X size={18} /> Missed deadlines due to poor visibility</li>
                            <li><X size={18} /> Constant status update meetings</li>
                        </ul>
                    </div>
                    <div className="compare-card solution">
                        <div className="sol-badge">The Stroovo Way</div>
                        <h4>Autonomous Future</h4>
                        <ul>
                            <li><CheckCircle2 size={18} /> AI assigns work instantly</li>
                            <li><CheckCircle2 size={18} /> AI detects risks before they happen</li>
                            <li><CheckCircle2 size={18} /> AI fixes bottlenecks automatically</li>
                            <li><CheckCircle2 size={18} /> Real-time visibility, zero meetings</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="features-section">
                <div className="section-header">
                    <h2>Built for <span className="gradient-text">Scale & Safety.</span></h2>
                    <p>Enterprise-grade AI that you can trust with your operations.</p>
                </div>
                <div className="features-grid">
                    <div className="feat-card">
                        <div className="feat-icon"><Cpu /></div>
                        <h5>Autonomous Mode</h5>
                        <p>Let Stroovo take full control or just provide suggestions. You decide the level of autonomy.</p>
                    </div>
                    <div className="feat-card">
                        <div className="feat-icon"><RefreshCw /></div>
                        <h5>Real-time Updates</h5>
                        <p>Every action is broadcasted instantly via WebSockets. No more page refreshes.</p>
                    </div>
                    <div className="feat-card">
                        <div className="feat-icon"><Zap /></div>
                        <h5>Decision Engine</h5>
                        <p>Logic-based smart assignments considering workload, skills, and past performance.</p>
                    </div>
                    <div className="feat-card">
                        <div className="feat-icon"><Undo2 /></div>
                        <h5>Full Rollback</h5>
                        <p>Every AI action is logged and can be undone with a single click. Total control.</p>
                    </div>
                    <div className="feat-card">
                        <div className="feat-icon"><Shield /></div>
                        <h5>Safe Automation</h5>
                        <p>Built-in safety layers prevent over-assignment and respect manual overrides.</p>
                    </div>
                    <div className="feat-card">
                        <div className="feat-icon"><BarChart3 /></div>
                        <h5>Executive Intel</h5>
                        <p>High-level insights into team health, performance scores, and risk levels.</p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="cta-section">
                <div className="cta-box">
                    <h2>Ready to let AI run your team?</h2>
                    <p>Join high-performing teams who have automated their daily operations.</p>
                    <div className="hero-ctas">
                        <Link href="/signup" className="btn-primary-lg">Get Started Free</Link>
                        <Link href="/login" className="btn-outline-lg">Talk to Sales</Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="logo">
                            <Zap color="#0052CC" fill="#0052CC" size={20} />
                            <span>Stroovo</span>
                        </div>
                        <p>Autonomous Team Operations Engine.</p>
                    </div>
                    <div className="footer-links">
                        <div className="link-group">
                            <h6>Product</h6>
                            <a href="#">Features</a>
                            <a href="#">Demo</a>
                            <a href="#">Security</a>
                        </div>
                        <div className="link-group">
                            <h6>Company</h6>
                            <a href="#">About</a>
                            <a href="#">Careers</a>
                            <a href="#">Contact</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    &copy; 2026 Stroovo AI. All rights reserved.
                </div>
            </footer>

            <style jsx>{`
                .landing-container {
                    background: #FFFFFF;
                    color: #172B4D;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    overflow-x: hidden;
                }

                .gradient-text {
                    background: linear-gradient(135deg, #0052CC 0%, #00B8D9 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                /* Nav */
                .nav {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    padding: 0 5%;
                    z-index: 1000;
                    transition: all 0.3s ease;
                }
                .nav-scrolled {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                    height: 70px;
                }
                .nav-content {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 22px;
                    font-weight: 800;
                    color: #172B4D;
                }
                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 32px;
                }
                .nav-links a {
                    text-decoration: none;
                    color: #42526E;
                    font-size: 14px;
                    font-weight: 600;
                    transition: color 0.2s;
                }
                .nav-links a:hover { color: #0052CC; }

                /* Buttons */
                .btn-primary {
                    background: #0052CC;
                    color: white !important;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 700 !important;
                }
                .btn-secondary {
                    color: #0052CC !important;
                }
                .btn-primary-lg {
                    background: #0052CC;
                    color: white;
                    padding: 16px 32px;
                    border-radius: 12px;
                    font-weight: 700;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 16px;
                    box-shadow: 0 10px 25px rgba(0, 82, 204, 0.2);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .btn-primary-lg:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(0, 82, 204, 0.3); }
                
                .btn-outline-lg {
                    background: white;
                    color: #172B4D;
                    border: 2px solid #EBECF0;
                    padding: 16px 32px;
                    border-radius: 12px;
                    font-weight: 700;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-outline-lg:hover { background: #F4F5F7; }

                /* Hero */
                .hero {
                    padding: 180px 5% 100px;
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    align-items: center;
                    gap: 80px;
                }
                .badge {
                    background: #DEEBFF;
                    color: #0052CC;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 700;
                    display: inline-block;
                    margin-bottom: 24px;
                }
                .hero h1 {
                    font-size: 72px;
                    font-weight: 850;
                    line-height: 1.1;
                    margin-bottom: 24px;
                    letter-spacing: -0.03em;
                }
                .subheadline {
                    font-size: 20px;
                    color: #42526E;
                    line-height: 1.6;
                    margin-bottom: 48px;
                    max-width: 540px;
                }
                .hero-ctas {
                    display: flex;
                    gap: 20px;
                }
                .hero-visual {
                    position: relative;
                }
                .visual-wrapper {
                    position: relative;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.1);
                    border: 8px solid #FFFFFF;
                }
                .visual-wrapper img { width: 100%; display: block; }
                
                .glass-card {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(10px);
                    padding: 16px 20px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }
                .glass-card h6 { margin: 0; font-size: 14px; font-weight: 700; }
                .glass-card p { margin: 0; font-size: 12px; color: #6B778C; }
                
                .floating-1 { top: 20%; left: -40px; animation: float 6s infinite ease-in-out; }
                .floating-2 { bottom: 15%; right: -30px; animation: float 6s infinite ease-in-out 1s; }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }

                /* Sections */
                .section-header {
                    text-align: center;
                    max-width: 700px;
                    margin: 0 auto 60px;
                }
                .section-header h2 { font-size: 48px; font-weight: 800; margin-bottom: 20px; letter-spacing: -0.02em; }
                .section-header p { font-size: 18px; color: #6B778C; }

                .demo-section, .compare-section, .features-section, .cta-section {
                    padding: 120px 5%;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                /* Demo */
                .demo-container {
                    background: #FFFFFF;
                    border-radius: 24px;
                    border: 1px solid #EBECF0;
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    overflow: hidden;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.04);
                }
                .demo-sidebar {
                    background: #F8F9FB;
                    padding: 40px;
                    border-right: 1px solid #EBECF0;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .demo-step {
                    display: flex;
                    gap: 16px;
                    opacity: 0.4;
                    transition: all 0.3s;
                }
                .demo-step.active { opacity: 1; transform: translateX(10px); }
                .step-num {
                    width: 24px;
                    height: 24px;
                    background: #0052CC;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 800;
                    flex-shrink: 0;
                }
                .demo-step h6 { margin: 0 0 4px; font-size: 15px; font-weight: 700; }
                .demo-step p { margin: 0; font-size: 12px; color: #6B778C; }
                .btn-demo-run {
                    margin-top: auto;
                    background: #0052CC;
                    color: white;
                    border: none;
                    padding: 14px;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                }
                .btn-demo-run:disabled { opacity: 0.6; }

                .demo-view { padding: 40px; background: white; }
                .mock-ui {
                    background: #F4F5F7;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid #EBECF0;
                    height: 400px;
                    display: flex;
                    flex-direction: column;
                }
                .mock-header {
                    background: #FFFFFF;
                    padding: 12px 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border-bottom: 1px solid #EBECF0;
                }
                .mock-dot { width: 8px; height: 8px; border-radius: 50%; background: #EBECF0; }
                .mock-title { font-size: 11px; font-weight: 700; color: #8A94A6; margin-left: auto; text-transform: uppercase; }
                .mock-content { flex: 1; padding: 40px; display: flex; align-items: center; justify-content: center; }
                
                .demo-placeholder { font-size: 14px; color: #8A94A6; font-style: italic; }
                .demo-anim-card {
                    background: white;
                    width: 320px;
                    padding: 24px;
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
                }
                .skeleton { background: #F4F5F7; border-radius: 4px; margin-bottom: 12px; }
                .skeleton.title { width: 60%; height: 20px; }
                .skeleton.line { width: 90%; height: 12px; }
                .tag { display: inline-block; padding: 4px 10px; background: #DEEBFF; color: #0052CC; font-size: 11px; font-weight: 700; border-radius: 6px; }
                .active-pulse { animation: pulse 2s infinite; }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                .rebalance-view { text-align: center; }
                .warning-pill { display: inline-flex; align-items: center; gap: 6px; background: #FFEBE6; color: #FF5630; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 20px; }
                .transfer-anim { display: flex; align-items: center; gap: 24px; justify-content: center; margin-bottom: 20px; }
                .user-node { width: 48px; height: 48px; border-radius: 12px; background: #0052CC; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; }
                .user-node.highlight { background: #36B37E; }
                .undo-pill { background: #F4F5F7; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #42526E; cursor: pointer; display: flex; align-items: center; gap: 6px; margin: 16px auto 0; }

                /* Compare */
                .compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
                .compare-card { padding: 48px; border-radius: 24px; }
                .compare-card.problem { background: #F4F5F7; }
                .compare-card.solution { background: #172B4D; color: white; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15); }
                .compare-card h4 { font-size: 24px; font-weight: 800; margin-bottom: 32px; }
                .compare-card ul { list-style: none; padding: 0; display: flex; flexDirection: column; gap: 20px; }
                .compare-card li { display: flex; align-items: center; gap: 16px; font-size: 16px; font-weight: 500; }
                .sol-badge { background: #36B37E; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-block; margin-bottom: 16px; }

                /* Features */
                .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
                .feat-card { padding: 32px; border-radius: 20px; border: 1px solid #EBECF0; transition: all 0.3s; }
                .feat-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05); border-color: #0052CC; }
                .feat-icon { width: 48px; height: 48px; background: #DEEBFF; color: #0052CC; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
                .feat-card h5 { font-size: 20px; font-weight: 750; margin-bottom: 16px; }
                .feat-card p { font-size: 15px; color: #6B778C; line-height: 1.6; }

                /* Final CTA */
                .cta-section { padding-top: 60px; }
                .cta-box { background: #0052CC; border-radius: 32px; padding: 80px; text-align: center; color: white; }
                .cta-box h2 { font-size: 48px; font-weight: 800; margin-bottom: 24px; letter-spacing: -0.02em; }
                .cta-box p { font-size: 20px; opacity: 0.9; margin-bottom: 48px; }
                .cta-box .hero-ctas { justify-content: center; }

                /* Footer */
                .footer { background: #F4F5F7; padding: 80px 5% 40px; border-top: 1px solid #EBECF0; }
                .footer-content { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; margin-bottom: 60px; }
                .footer-brand p { color: #6B778C; font-size: 14px; margin-top: 16px; }
                .footer-links { display: flex; gap: 80px; }
                .link-group h6 { font-size: 14px; font-weight: 800; margin-bottom: 24px; color: #172B4D; }
                .link-group a { display: block; text-decoration: none; color: #6B778C; font-size: 14px; margin-bottom: 12px; transition: color 0.2s; }
                .link-group a:hover { color: #0052CC; }
                .footer-bottom { text-align: center; font-size: 13px; color: #8A94A6; border-top: 1px solid #EBECF0; padding-top: 40px; }

                @media (max-width: 1024px) {
                    .hero { grid-template-columns: 1fr; text-align: center; padding-top: 140px; }
                    .hero h1 { font-size: 56px; }
                    .subheadline { margin: 0 auto 48px; }
                    .hero-ctas { justify-content: center; }
                    .demo-container { grid-template-columns: 1fr; }
                    .compare-grid { grid-template-columns: 1fr; }
                    .features-grid { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 768px) {
                    .features-grid { grid-template-columns: 1fr; }
                    .cta-box { padding: 40px 20px; }
                    .cta-box h2 { font-size: 32px; }
                    .nav-links { display: none; }
                }
            `}</style>
        </div>
    );
}
