import {
  LayoutDashboard,
  CheckSquare,
  Briefcase,
  Users,
  Target,
  Calendar,
  Clock,
  Layout,
  MessageSquare,
  Bell,
  FileText,
  Bot,
  Zap,
  LineChart,
  Shield,
  Settings,
  Code,
  Box,
  Megaphone,
  BriefcaseBusiness,
  Building,
  GraduationCap,
  HeartHandshake,
  Globe,
  BookOpen,
  HelpCircle,
  FileCode,
  Layers,
  Star,
  Map,
  Smile,
  Book,
  Code2
} from "lucide-react";

export const NAVIGATION_CONFIG = {
  product: [
    {
      title: "Core Platform",
      items: [
        { label: "Overview", href: "/features", icon: LayoutDashboard, description: "See the big picture of your work" },
        { label: "Task Management", href: "/tasks", icon: CheckSquare, description: "Track and organize your work" },
        { label: "Project Management", href: "/projects", icon: Briefcase, description: "Plan and execute initiatives" },
        { label: "Team Collaboration", href: "/teams", icon: Users, description: "Work together seamlessly" },
        { label: "Goals & OKRs", href: "/goals", icon: Target, description: "Align work to outcomes" },
        { label: "Calendar", href: "/calendar", icon: Calendar, description: "Visualize work over time" },
        { label: "Timeline", href: "/timeline", icon: Clock, description: "Map out dependencies" },
        { label: "Board", href: "/board", icon: Layout, description: "Agile workflow management" },
      ],
    },
    {
      title: "Collaboration",
      items: [
        { label: "Team Communication", href: "/messages", icon: MessageSquare, description: "Real-time team chat" },
        { label: "Comments & Mentions", href: "/features#comments", icon: Bell, description: "Contextual discussions" },
        { label: "File & Document", href: "/files", icon: FileText, description: "Centralized assets" },
      ],
    },
    {
      title: "Intelligence",
      items: [
        { label: "AI Assistant", href: "/ai/assistant", icon: Bot, description: "Your intelligent copilot" },
        { label: "Automations", href: "/automations", icon: Zap, description: "Eliminate busywork" },
        { label: "Analytics", href: "/analytics", icon: LineChart, description: "Data-driven insights" },
      ],
    },
    {
      title: "Administration",
      items: [
        { label: "Roles & Permissions", href: "/admin/roles", icon: Shield, description: "Granular access control" },
        { label: "Access Policies", href: "/security", icon: Settings, description: "Enterprise security" },
        { label: "Audit Activity", href: "/admin/logs", icon: FileText, description: "Compliance tracking" },
      ],
    },
  ],
  solutions: [
    {
      title: "By Team",
      items: [
        { label: "Engineering", href: "/solutions/engineering", icon: Code },
        { label: "Product", href: "/solutions/product", icon: Box },
        { label: "Marketing", href: "/solutions/marketing", icon: Megaphone },
        { label: "Sales", href: "/solutions/sales", icon: BriefcaseBusiness },
        { label: "Operations", href: "/solutions/operations", icon: Building },
        { label: "HR", href: "/solutions/hr", icon: HeartHandshake },
      ],
    },
    {
      title: "By Use Case",
      items: [
        { label: "Project Management", href: "/solutions/project-management", icon: Briefcase },
        { label: "Task Management", href: "/solutions/task-management", icon: CheckSquare },
        { label: "Goal Tracking", href: "/solutions/goal-tracking", icon: Target },
        { label: "Team Collaboration", href: "/solutions/team-collaboration", icon: Users },
        { label: "Sprint Planning", href: "/sprint-planning", icon: Clock },
      ],
    },
    {
      title: "By Organization",
      items: [
        { label: "Startups", href: "/solutions/startups", icon: Zap },
        { label: "Growing Teams", href: "/solutions/growing-teams", icon: LineChart },
        { label: "Enterprise", href: "/enterprise", icon: Building },
      ],
    },
  ],
  resources: [
    {
      title: "Learn",
      items: [
        { label: "Documentation", href: "/docs", icon: BookOpen, description: "Detailed technical docs" },
        { label: "Help Center", href: "/help", icon: HelpCircle, description: "Support and FAQs" },
        { label: "Guides", href: "/guides", icon: Map, description: "Best practices" },
        { label: "Blog", href: "/blog", icon: Book, description: "Latest articles" },
      ],
    },
    {
      title: "Product",
      items: [
        { label: "Features", href: "/features", icon: LayoutDashboard, description: "Platform overview" },
        { label: "Integrations", href: "/integrations", icon: Layers, description: "Connect your tools" },
        { label: "Templates", href: "/templates", icon: FileCode, description: "Ready-to-use workflows" },
        { label: "Changelog", href: "/changelog", icon: Clock, description: "Recent updates" },
        { label: "Roadmap", href: "/roadmap", icon: Map, description: "What's coming next" },
      ],
    },
    {
      title: "Community",
      items: [
        { label: "Customer Stories", href: "/customers", icon: Star, description: "See how teams succeed" },
        { label: "Developer Resources", href: "/docs", icon: Code2, description: "APIs and Webhooks" },
      ],
    },
  ],
  company: [
    {
      title: "About",
      items: [
        { label: "About Stroovo", href: "/about", icon: Building, description: "Our mission and vision" },
        { label: "Our Story", href: "/story", icon: BookOpen, description: "How we started" },
        { label: "Careers", href: "/careers", icon: Users, description: "Join our team" },
        { label: "Contact Us", href: "/contact", icon: MessageSquare, description: "Get in touch" },
      ],
    },
    {
      title: "Ecosystem",
      items: [
        { label: "Revotic AI", href: "/revotic-ai", icon: Bot, description: "Our parent company" },
        { label: "Partners", href: "/partners", icon: HeartHandshake, description: "Partner program" },
      ],
    },
  ],
};
