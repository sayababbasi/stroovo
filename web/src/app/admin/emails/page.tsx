import prisma from '@/lib/prisma';
import { Mail, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EmailLogsPage() {
  const emailLogs = await (prisma as any).emailLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Mail className="h-6 w-6 text-blue-600" />
            Email Delivery Logs
          </h1>
          <p className="text-slate-500 mt-1">
            Track and debug outgoing emails from the Stroovo platform. Showing last 100 emails.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipient</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Provider</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Error Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emailLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No emails have been sent yet.
                  </td>
                </tr>
              ) : (
                emailLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">
                      {log.to}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 max-w-[200px] truncate" title={log.subject}>
                      {log.subject}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        {log.status === 'DELIVERED' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {log.status === 'SENT' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                        {log.status === 'FAILED' && <XCircle className="w-4 h-4 text-red-500" />}
                        {log.status === 'BOUNCED' && <AlertCircle className="w-4 h-4 text-orange-500" />}
                        {log.status === 'DELAYED' && <Clock className="w-4 h-4 text-amber-500" />}
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          log.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' :
                          log.status === 'SENT' ? 'bg-blue-50 text-blue-700' :
                          log.status === 'FAILED' ? 'bg-red-50 text-red-700' :
                          log.status === 'BOUNCED' ? 'bg-orange-50 text-orange-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      <span className="capitalize">{log.provider}</span>
                      {log.providerId && (
                        <div className="text-[10px] text-slate-400 mt-1 font-mono" title={log.providerId}>
                          {log.providerId.substring(0, 15)}...
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 max-w-[250px] truncate" title={log.error || 'None'}>
                      {log.error ? (
                        <span className="text-red-600 font-mono text-xs bg-red-50 px-2 py-1 rounded">
                          {log.error}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
