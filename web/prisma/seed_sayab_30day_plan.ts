import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Seeding 30-Day REVOTICAI Content Execution Plan ---');

    // 1. Find SAYAB User
    const sayab = await (prisma as any).user.findUnique({
        where: { email: 'founder.revoticai@gmail.com' }
    });

    if (!sayab) {
        console.error("SAYAB user not found! Aborting.");
        return;
    }

    // 2. Find or Create Private Project for 30-Day Execution
    let project = await (prisma as any).project.findFirst({
        where: {
            name: 'REVOTIC AI 30-Day Content Execution Plan',
            managerId: sayab.id
        }
    });

    if (!project) {
        project = await (prisma as any).project.create({
            data: {
                name: 'REVOTIC AI 30-Day Content Execution Plan',
                description: 'Core 30-Day Content & Product Execution Engine for REVOTICAI',
                status: 'ACTIVE',
                priority: 'HIGH',
                managerId: sayab.id,
                tenantId: sayab.tenantId,
                startDate: new Date('2026-08-01T00:00:00Z'),
                endDate: new Date('2026-08-30T23:59:59Z'),
                tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Private']
            }
        });
        console.log(`Created private project: ${project.name}`);
    }

    // 3. Fetch SAYAB's Goals, Objectives, and Key Results to establish OKR links
    const goals = await (prisma as any).goal.findMany({
        where: { ownerId: sayab.id, type: 'PERSONAL' },
        include: {
            objectives: {
                include: { keyResults: true }
            }
        }
    });

    // Helper map to find KR or Objective by title snippet
    const findKR = (titleSnippet: string) => {
        for (const g of goals) {
            for (const obj of g.objectives || []) {
                for (const kr of obj.keyResults || []) {
                    if (kr.title.toLowerCase().includes(titleSnippet.toLowerCase())) {
                        return { goalId: g.id, objectiveId: obj.id, keyResultId: kr.id };
                    }
                }
            }
        }
        return {};
    };

    // Pre-map relevant KRs
    const krStrategy = findKR('social') || findKR('brand') || {};
    const krLongForm = findKR('long-form') || findKR('publish quality youtube') || {};
    const krShortForm = findKR('short-form') || findKR('shorts') || {};
    const krLinkedIn = findKR('linkedin') || {};
    const krProducts = findKR('product') || {};
    const krOwnedAudience = findKR('email') || findKR('newsletter') || {};
    const krExecution = findKR('weekly execution') || findKR('hours') || {};

    const startDateBase = Date.parse('2026-08-01T08:00:00Z');

    const tasksToSeed = [
        // DAY 1
        {
            seedId: 'REVOTICAI-30DAY-DAY01-TASK01',
            day: 1,
            title: 'Write core positioning statement for REVOTICAI',
            description: 'REVOTICAI — AI SaaS Builder | Building Real Products in Public',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 1', 'Week 1'],
            kr: krStrategy
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY01-TASK02',
            day: 1,
            title: 'Define three content pillars (Educational 40%, Build in Public 30%, Product 30%)',
            description: 'Set allocation: Educational / Authority (40%), Build in Public (30%), Product Integration (30%)',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 1', 'Week 1'],
            kr: krStrategy
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY01-TASK03',
            day: 1,
            title: 'Define primary target audience personas',
            description: 'Developers, AI enthusiasts, SaaS builders, Students entering AI/software, Startup founders',
            priority: 'MEDIUM',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 1', 'Week 1'],
            kr: krStrategy
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY01-TASK04',
            day: 1,
            title: 'Define anti-positioning guidelines (what content will NOT become)',
            description: 'Avoid: Generic coding tutorials, Random AI news, Pure product ads, Low-value motivational content',
            priority: 'MEDIUM',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 1', 'Week 1'],
            kr: krStrategy
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY01-TASK05',
            day: 1,
            title: 'Deliverable: Create one-page REVOTICAI Content Strategy Document',
            description: 'Finalize and save the master 1-page strategy document.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 1', 'Week 1', 'Deliverable'],
            kr: krStrategy
        },

        // DAY 2
        {
            seedId: 'REVOTICAI-30DAY-DAY02-TASK01',
            day: 2,
            title: 'Create repeatable YouTube formats list',
            description: 'Deep Educational, Build With Me, Real Product Breakdown, Founder Story, Experiment/Challenge, Technical Case Study',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 2', 'Week 1'],
            kr: krLongForm
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY02-TASK02',
            day: 2,
            title: 'Create repeatable Short-form formats list',
            description: 'AI concept explanation, Quick engineering lesson, Build progress, Product feature, Mistake/lesson, Technical fact, Clip from long-form',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 2', 'Week 1'],
            kr: krShortForm
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY02-TASK03',
            day: 2,
            title: 'Create repeatable LinkedIn formats list',
            description: 'Founder lesson, Technical lesson, Product build update, Case study, Failure/lesson, AI insight',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 2', 'Week 1'],
            kr: krLinkedIn
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY02-TASK04',
            day: 2,
            title: 'Deliverable: Create Content Format Library with 20+ reusable formats',
            description: 'Document at least 20 reusable content formats across channels.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 2', 'Week 1', 'Deliverable'],
            kr: krLongForm
        },

        // DAY 3
        {
            seedId: 'REVOTICAI-30DAY-DAY03-TASK01',
            day: 3,
            title: 'Evaluate 5 products against content criteria',
            description: 'Evaluate visual interest, technical concepts, educational value, production readiness, and problem clarity.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 3', 'Week 1'],
            kr: krProducts
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY03-TASK02',
            day: 3,
            title: 'Select one Flagship Product for August content focus',
            description: 'Choose the single flagship product for primary content demonstration.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 3', 'Week 1'],
            kr: krProducts
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY03-TASK03',
            day: 3,
            title: 'Deliverable: Create & document REVOTICAI Flagship Product Breakdown',
            description: 'Document Problem, Target users, Current state, Tech stack, Architecture, Features, Problems, Roadmap, Next build',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 3', 'Week 1', 'Deliverable'],
            kr: krProducts
        },

        // DAY 4
        {
            seedId: 'REVOTICAI-30DAY-DAY04-TASK01',
            day: 4,
            title: 'Build 12 Educational video ideas',
            description: 'ERP Systems, SaaS DB Design, Multi-Tenant SaaS, RBAC, Backend Architecture, Auth in SaaS, AI in SaaS, API Architecture, Scaling DBs, Real-Time Systems, Design AI SaaS, Production Software',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 4', 'Week 1'],
            kr: krLongForm
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY04-TASK02',
            day: 4,
            title: 'Build 9 Build-in-Public video ideas',
            description: 'Building SaaS ERP Week 1, Learned Building ERP, Production-Ready SaaS, What Went Wrong, Architecture Mistake, MVP to Product, AI Product Scratch, What I Build at REVOTICAI, AI Student to Founder',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 4', 'Week 1'],
            kr: krLongForm
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY04-TASK03',
            day: 4,
            title: 'Build 9 Product Integration video ideas',
            description: 'ERP Inventory System, ERP Database, LMS Architecture, Building AI Into Product, Product Auth, SaaS Organizations, ERP Backend, RBAC in SaaS, Product Architecture',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 4', 'Week 1'],
            kr: krLongForm
        },

        // DAY 5
        {
            seedId: 'REVOTICAI-30DAY-DAY05-TASK01',
            day: 5,
            title: 'Select Video 1: How Real ERP Systems Work',
            description: 'Educational + Product Integration focus.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 5', 'Week 1'],
            kr: krLongForm
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY05-TASK02',
            day: 5,
            title: 'Select Video 2: How to Design a SaaS Product From Scratch',
            description: 'Educational + Authority focus.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 5', 'Week 1'],
            kr: krLongForm
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY05-TASK03',
            day: 5,
            title: 'Select Video 3: I Built a Full ERP System — Here\'s What I Learned',
            description: 'Build in Public + Founder focus.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 5', 'Week 1'],
            kr: krLongForm
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY05-TASK04',
            day: 5,
            title: 'Select Video 4: Building My SaaS ERP — Week 1',
            description: 'Build in Public + Product Integration focus.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 5', 'Week 1'],
            kr: krLongForm
        },

        // DAY 6
        {
            seedId: 'REVOTICAI-30DAY-DAY06-TASK01',
            day: 6,
            title: 'Finalize REVOTICAI Visual Identity assets',
            description: 'Thumbnails, title style, fonts, brand colors, lower thirds, intro/outro, screen recording style, code presentation, background setup',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 6', 'Week 1'],
            kr: krStrategy
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY06-TASK02',
            day: 6,
            title: 'Deliverable: Create reusable REVOTICAI Video Template',
            description: 'Master template ready for video production.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 6', 'Week 1', 'Deliverable'],
            kr: krLongForm
        },

        // DAY 7
        {
            seedId: 'REVOTICAI-30DAY-DAY07-TASK01',
            day: 7,
            title: 'Perform Week 1 CEO Review of Days 1–6 deliverables',
            description: 'Check positioning, 3 pillars, flagship product, 30 ideas, first 4 videos, and visual identity.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 7', 'Week 1', 'Review'],
            kr: krExecution
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY07-TASK02',
            day: 7,
            title: 'Stroovo Week 1 Tracking & Task Completion Audit',
            description: 'Record hours worked (Target >= 21 hrs), task completion (Target >= 90%), problems, and next week priorities.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 7', 'Week 1', 'Review'],
            kr: krExecution
        },

        // DAY 8
        {
            seedId: 'REVOTICAI-30DAY-DAY08-TASK01',
            day: 8,
            title: 'Research Video 1: How Real ERP Systems Work',
            description: 'Research ERP definition, modules (Inventory, Sales, Purchasing, Finance, HR), roles, relationships, and connect to REVOTICAI ERP.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 8', 'Week 2'],
            kr: krLongForm
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY08-TASK02',
            day: 8,
            title: 'Deliverable: Complete Video 1 Outline',
            description: 'Finalize detailed structured outline for Video 1.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 8', 'Week 2', 'Deliverable'],
            kr: krLongForm
        },

        // DAY 9
        {
            seedId: 'REVOTICAI-30DAY-DAY09-TASK01',
            day: 9,
            title: 'Script Video 1 using formula',
            description: 'Write Hook -> Problem -> Educational Breakdown -> Real Implementation -> Founder Insight -> CTA',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 9', 'Week 2'],
            kr: krLongForm
        },

        // DAY 10
        {
            seedId: 'REVOTICAI-30DAY-DAY10-TASK01',
            day: 10,
            title: 'Record Video 1 (A-roll, screen recordings, ERP demo, architecture diagrams, code)',
            description: 'Focus on clear teaching and high-value demonstration.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 10', 'Week 2'],
            kr: krLongForm
        },

        // DAY 11
        {
            seedId: 'REVOTICAI-30DAY-DAY11-TASK01',
            day: 11,
            title: 'Edit Video 1 (Cutting, pacing, screen recordings, graphics, captions, audio)',
            description: 'Complete master edit for Video 1.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 11', 'Week 2'],
            kr: krLongForm
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY11-TASK02',
            day: 11,
            title: 'Create 2–3 thumbnail concepts for Video 1',
            description: 'Design and export 2-3 high CTR thumbnail variations.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 11', 'Week 2'],
            kr: krLongForm
        },

        // DAY 12
        {
            seedId: 'REVOTICAI-30DAY-DAY12-TASK01',
            day: 12,
            title: 'Publish Video 1 on YouTube',
            description: 'Upload, set title, description, tags, thumbnail, and publish.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 12', 'Week 2'],
            kr: krLongForm
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY12-TASK02',
            day: 12,
            title: 'Create 1 LinkedIn post from Video 1',
            description: 'Write engaging text post summarizing key takeaway.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 12', 'Week 2'],
            kr: krLinkedIn
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY12-TASK03',
            day: 12,
            title: 'Extract 3 Shorts from Video 1',
            description: 'Short #1: What is ERP?, Short #2: ERP Architecture, Short #3: Interesting ERP Concept',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 12', 'Week 2'],
            kr: krShortForm
        },

        // DAY 13
        {
            seedId: 'REVOTICAI-30DAY-DAY13-TASK01',
            day: 13,
            title: 'Distribute Video 1 assets (1-2 Shorts/Reels, LinkedIn, X, Facebook)',
            description: 'Publish across all secondary channels.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 13', 'Week 2'],
            kr: krShortForm
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY13-TASK02',
            day: 13,
            title: 'Respond to comments & track initial metrics',
            description: 'Reply to comments, track Views, CTR, Average View Duration, Retention, Subs gained.',
            priority: 'MEDIUM',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 13', 'Week 2'],
            kr: krLongForm
        },

        // DAY 14
        {
            seedId: 'REVOTICAI-30DAY-DAY14-TASK01',
            day: 14,
            title: 'Perform Video 1 Analytics & Questions Review',
            description: 'Analyze drop-offs, retention, comments, thumbnail CTR, and convert audience questions into future video topics.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 14', 'Week 2', 'Review'],
            kr: krLongForm
        },

        // DAY 15
        {
            seedId: 'REVOTICAI-30DAY-DAY15-TASK01',
            day: 15,
            title: 'Document Flagship Product Architecture',
            description: 'Document Frontend, Backend, DB, Auth, APIs, Roles, Organizations, Integrations.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 15', 'Week 3'],
            kr: krProducts
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY15-TASK02',
            day: 15,
            title: 'Create Flagship Architecture Diagram for Content',
            description: 'Export clean diagram for video presentation.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 15', 'Week 3'],
            kr: krProducts
        },

        // DAY 16
        {
            seedId: 'REVOTICAI-30DAY-DAY16-TASK01',
            day: 16,
            title: 'Research Video 2: How to Design a SaaS Product From Scratch',
            description: 'Research Problem, Users, Requirements, DB, Multi-tenancy, APIs, Deployment, Monitoring.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 16', 'Week 3'],
            kr: krLongForm
        },

        // DAY 17
        {
            seedId: 'REVOTICAI-30DAY-DAY17-TASK01',
            day: 17,
            title: 'Script Video 2 & prepare diagrams',
            description: 'Structure: Idea -> Architecture -> Implementation -> Real REVOTICAI Example.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 17', 'Week 3'],
            kr: krLongForm
        },

        // DAY 18
        {
            seedId: 'REVOTICAI-30DAY-DAY18-TASK01',
            day: 18,
            title: 'Record Video 2 & capture extra footage for Shorts',
            description: 'Record talking-head, architecture, product, code, diagrams.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 18', 'Week 3'],
            kr: krLongForm
        },

        // DAY 19
        {
            seedId: 'REVOTICAI-30DAY-DAY19-TASK01',
            day: 19,
            title: 'Edit Video 2 (Main video, thumbnail, chapters, description, CTA)',
            description: 'Complete edit and export Video 2.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 19', 'Week 3'],
            kr: krLongForm
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY19-TASK02',
            day: 19,
            title: 'Prepare 4–5 short-form clips from Video 2',
            description: 'Extract and edit 4-5 standalone Shorts.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 19', 'Week 3'],
            kr: krShortForm
        },

        // DAY 20
        {
            seedId: 'REVOTICAI-30DAY-DAY20-TASK01',
            day: 20,
            title: 'Publish Video 2 on YouTube',
            description: 'Publish full long-form episode.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 20', 'Week 3'],
            kr: krLongForm
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY20-TASK02',
            day: 20,
            title: 'Publish Video 2 repurposed content (LinkedIn, X, Facebook, 1-2 Shorts)',
            description: 'Distribute across all channels.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 20', 'Week 3'],
            kr: krLinkedIn
        },

        // DAY 21
        {
            seedId: 'REVOTICAI-30DAY-DAY21-TASK01',
            day: 21,
            title: 'Perform Week 3 Content & Product Review',
            description: 'Review progress: 2 YouTube, 6-8 Shorts, 6-8 LinkedIn posts, product updates.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 21', 'Week 3', 'Review'],
            kr: krExecution
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY21-TASK02',
            day: 21,
            title: 'Check Personal Execution Metrics (Hours >= 21, Task Completion >= 90%)',
            description: 'Stroovo tracking audit for Week 3.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 21', 'Week 3', 'Review'],
            kr: krExecution
        },

        // DAY 22
        {
            seedId: 'REVOTICAI-30DAY-DAY22-TASK01',
            day: 22,
            title: 'Create Build-in-Public update: Building My SaaS ERP — Week 1',
            description: 'Document starting state, built items, bugs, lessons, screenshots, architecture decisions.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 22', 'Week 4'],
            kr: krLongForm
        },

        // DAY 23
        {
            seedId: 'REVOTICAI-30DAY-DAY23-TASK01',
            day: 23,
            title: 'Script Video 3: I Built a Full ERP System — Here\'s What I Learned',
            description: 'Structure around lessons: Expectations vs reality, architecture, DB, UX, Auth/RBAC, performance, mistakes.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 23', 'Week 4'],
            kr: krLongForm
        },

        // DAY 24
        {
            seedId: 'REVOTICAI-30DAY-DAY24-TASK01',
            day: 24,
            title: 'Record Video 3 & 5+ potential Shorts',
            description: 'Capture product dashboard, architecture, code, problems, and explanation.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 24', 'Week 4'],
            kr: krLongForm
        },

        // DAY 25
        {
            seedId: 'REVOTICAI-30DAY-DAY25-TASK01',
            day: 25,
            title: 'Edit Video 3 (Main video, thumbnail, 5 Shorts, LinkedIn, X content)',
            description: 'Complete full post-production package for Video 3.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 25', 'Week 4'],
            kr: krLongForm
        },

        // DAY 26
        {
            seedId: 'REVOTICAI-30DAY-DAY26-TASK01',
            day: 26,
            title: 'Publish Video 3 on YouTube & distribute across channels',
            description: 'Publish YouTube long-form + 2 Shorts + 1 LinkedIn post + 1 X thread + 1 Facebook post.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 26', 'Week 4'],
            kr: krLongForm
        },

        // DAY 27
        {
            seedId: 'REVOTICAI-30DAY-DAY27-TASK01',
            day: 27,
            title: 'Set up Email Capture & Newsletter/Community Landing Page',
            description: 'Build owned audience lead capture infrastructure.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 27', 'Week 4'],
            kr: krOwnedAudience
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY27-TASK02',
            day: 27,
            title: 'Create Welcome Message & subscriber DB setup with content CTA',
            description: 'Integrate CTA: "Join the REVOTICAI community to follow what I\'m building."',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 27', 'Week 4'],
            kr: krOwnedAudience
        },

        // DAY 28
        {
            seedId: 'REVOTICAI-30DAY-DAY28-TASK01',
            day: 28,
            title: 'Finalize Facebook Page (Profile, cover, bio, website, first posts)',
            description: 'Complete Facebook distribution channel setup.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 28', 'Week 4'],
            kr: krStrategy
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY28-TASK02',
            day: 28,
            title: 'Finalize X Account (Profile, bio, branding, website, pinned post, first posts)',
            description: 'Complete X distribution channel setup.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 28', 'Week 4'],
            kr: krStrategy
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY28-TASK03',
            day: 28,
            title: 'Update LinkedIn profile header & bio ("AI SaaS Builder | Founder at REVOTICAI")',
            description: 'Optimize LinkedIn profile for authority and conversion.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 28', 'Week 4'],
            kr: krLinkedIn
        },

        // DAY 29
        {
            seedId: 'REVOTICAI-30DAY-DAY29-TASK01',
            day: 29,
            title: 'Prepare Video 4: Building My SaaS ERP — Week 1',
            description: 'Document Before, During, Problems, Decisions, After, Next steps.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 29', 'Week 4'],
            kr: krLongForm
        },

        // DAY 30
        {
            seedId: 'REVOTICAI-30DAY-DAY30-TASK01',
            day: 30,
            title: 'Publish Video 4 on YouTube',
            description: 'Publish 4th long-form video.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 30', 'Week 4'],
            kr: krLongForm
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY30-TASK02',
            day: 30,
            title: 'Complete 30-Day Content Scorecard Audit',
            description: 'Record YouTube (4 videos, views, subs, CTR), Shorts (20+), LinkedIn (16+ posts), Product, Community metrics.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 30', 'Week 4', 'Review'],
            kr: krExecution
        },
        {
            seedId: 'REVOTICAI-30DAY-DAY30-TASK03',
            day: 30,
            title: 'Complete 30-Day Monthly CEO Review & Stroovo Tracking',
            description: 'Verify 30-day execution metrics, weekly hours >= 21, task completion >= 90%, and plan September flywheel.',
            priority: 'HIGH',
            tags: ['REVOTICAI', 'Content', '30-Day Plan', 'Day 30', 'Week 4', 'Review'],
            kr: krExecution
        }
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const item of tasksToSeed) {
        // Calculate date offset based on Day N (Day 1 = Aug 1 2026)
        const dayOffsetMs = (item.day - 1) * 86400000;
        const taskStartDate = new Date(startDateBase + dayOffsetMs);
        const taskDueDate = new Date(startDateBase + dayOffsetMs + (12 * 3600000)); // due end of day

        // Check idempotency by matching tag seedId or title + assigneeId
        const existing = await (prisma as any).task.findFirst({
            where: {
                projectId: project.id,
                assigneeId: sayab.id,
                title: item.title
            }
        });

        if (existing) {
            skippedCount++;
            continue;
        }

        await (prisma as any).task.create({
            data: {
                title: item.title,
                description: item.description,
                status: 'TODO',
                priority: item.priority,
                type: 'TASK',
                startDate: taskStartDate,
                dueDate: taskDueDate,
                progress: 0,
                projectId: project.id,
                assigneeId: sayab.id,
                createdBy: sayab.id,
                tenantId: sayab.tenantId,
                tags: [...item.tags, item.seedId],
                goalId: item.kr.goalId || null,
                objectiveId: item.kr.objectiveId || null,
                keyResultId: item.kr.keyResultId || null,
            }
        });

        createdCount++;
    }

    console.log(`--- Seeding Complete: ${createdCount} tasks created, ${skippedCount} existing tasks skipped. Total 30-Day tasks: ${tasksToSeed.length} ---`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
