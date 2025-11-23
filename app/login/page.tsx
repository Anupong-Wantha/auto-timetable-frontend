'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, LogIn, AlertCircle } from "lucide-react";

// สร้าง Client แบบด่วน (ควรย้ายไปไฟล์ config กลางถ้าทำจริงจัง)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // ล็อกอินสำเร็จ -> เก็บ Session -> ไปหน้า Dashboard
      // แนะนำให้ set cookie หรือ localStorage เพื่อเช็คสิทธิ์ในหน้าอื่น
      localStorage.setItem('sb-user', JSON.stringify(data.user));
      router.push('/'); 
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1 text-center pb-6 border-b bg-indigo-50/50">
          <div className="mx-auto bg-indigo-600 p-3 rounded-full w-fit mb-2">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Admin Login</CardTitle>
          <CardDescription>เข้าสู่ระบบจัดการตารางสอน</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input 
                type="email" 
                placeholder="admin@school.ac.th" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? 'Checking...' : <><LogIn className="w-4 h-4 mr-2" /> เข้าสู่ระบบ</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}