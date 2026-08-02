import { 
    ShieldAlert, Briefcase, Cpu, Activity, Target, 
    User, Search, Star, Crown, Shield,
    Wrench, ClipboardList, Settings, LayoutDashboard, 
    Bot, Zap, Bell, Users, FolderKanban, CheckSquare, 
    CreditCard, Puzzle, Mail, FileText, Database, ShieldCheck
} from 'lucide-react';
import React from 'react';

export const getRoleIcon = (roleName: string) => {
    switch (roleName) {
        case 'Admin': return ShieldAlert;
        case 'Super Admin': return Crown;
        case 'CEO': return Briefcase;
        case 'CTO': return Cpu;
        case 'COO': return Activity;
        case 'Manager': return Target;
        case 'Employee': return User;
        case 'QA Engineer': return Search;
        case 'Team Lead': return Star;
        default: return Shield;
    }
};

export const getModuleIcon = (moduleName: string) => {
    switch (moduleName.toLowerCase()) {
        case 'access_policies': return Wrench;
        case 'audit_logs': return ClipboardList;
        case 'audit': return ClipboardList;
        case 'settings': return Settings;
        case 'dashboard': return LayoutDashboard;
        case 'ai': return Bot;
        case 'automations': return Zap;
        case 'notifications': return Bell;
        case 'goals': return Target;
        case 'teams': return Users;
        case 'projects': return FolderKanban;
        case 'tasks': return CheckSquare;
        case 'billing': return CreditCard;
        case 'integrations': return Puzzle;
        case 'users': return Users;
        case 'invitations': return Mail;
        case 'organization': return Database;
        case 'roles': return ShieldCheck;
        case 'permissions': return ShieldAlert;
        case 'reports': return FileText;
        case 'security': return Shield;
        case 'system': return Cpu;
        case 'financial': return CreditCard;
        case 'executive': return Briefcase;
        case 'system_logs': return ClipboardList;
        default: return FileText;
    }
};
