'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  BrainCircuit, Play, CheckCircle2, AlertCircle, ArrowLeft, 
  Zap, Scale, Diamond, Loader2 
} from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GeneratePage() {
  const router = useRouter();

useEffect(() => {
  const user = localStorage.getItem('sb-user');
  if (!user) {
    router.push('/login'); // ถ้าไม่มี user ให้ดีดไปหน้า login
  }
}, []);
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [mode, setMode] = useState('balanced'); // default mode
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<any>(null);

  // Simulation Progress Bar
  useEffect(() => {
    if (status === 'generating') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev; 
          // ปรับความเร็วตามโหมด (Perfect จะช้ากว่า)
          const increment = mode === 'draft' ? 15 : mode === 'balanced' ? 5 : 2;
          return prev + increment;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [status, mode]);

  const startGeneration = async () => {
    // แจ้งเตือนความชัดเจนตามโหมด
    const confirmMsg = `⚠️ ยืนยันการสร้างตาราง (โหมด: ${mode.toUpperCase()})\n\nข้อมูลตารางเรียนเก่าจะถูกลบทั้งหมด คุณต้องการดำเนินการต่อหรือไม่?`;
    if (!confirm(confirmMsg)) return;

    setStatus('generating');
    setProgress(0);
    setMessage(`AI กำลังประมวลผลในโหมด ${mode.toUpperCase()}...`);

    try {
      // เรียก API พร้อมส่ง Mode ไปด้วย
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schedules/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode: mode }) // ส่งค่า mode ไปที่ Python
      });
      
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'เกิดข้อผิดพลาดจาก Server');

      setProgress(100);
      setStatus('success');
      setResult(data);
      setMessage("🎉 จัดตารางเสร็จสมบูรณ์! ข้อมูลถูกบันทึกลงฐานข้อมูลแล้ว");

    } catch (error: any) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-4xl">
        
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> กลับไปหน้า Dashboard
          </Link>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
          <CardHeader className="text-center pb-6 bg-slate-50/50 border-b">
            <div className="mx-auto bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200 w-fit mb-4">
              <BrainCircuit className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-800">AI Scheduler Generator</CardTitle>
            <CardDescription className="text-lg mt-2">
              ระบบจัดตารางสอนอัตโนมัติ เลือกความละเอียดตามความต้องการ
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            
            {/* --- STATE: IDLE (Selection) --- */}
            {status === 'idle' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Mode Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Option 1: Draft */}
                  <div 
                    onClick={() => setMode('draft')}
                    className={`cursor-pointer border-2 rounded-xl p-6 flex flex-col items-center text-center transition-all hover:scale-[1.02] active:scale-95 ${mode === 'draft' ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-200 shadow-md' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <div className={`p-3 rounded-full mb-4 ${mode === 'draft' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Zap className="w-6 h-6" />
                    </div>
                    <h3 className={`font-bold text-lg ${mode === 'draft' ? 'text-blue-700' : 'text-slate-700'}`}>เร็วมาก (Draft)</h3>
                    <p className="text-xs text-slate-500 mt-2 font-mono bg-white px-2 py-1 rounded border">~30 วินาที</p>
                    <p className="text-xs text-slate-400 mt-3 leading-relaxed">เน้นผลลัพธ์เร็ว เหมาะสำหรับทดสอบระบบ อาจมีตารางชนกันบ้าง</p>
                  </div>

                  {/* Option 2: Balanced */}
                  <div 
                    onClick={() => setMode('balanced')}
                    className={`cursor-pointer border-2 rounded-xl p-6 flex flex-col items-center text-center transition-all hover:scale-[1.02] active:scale-95 ${mode === 'balanced' ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-200 shadow-md' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <div className={`p-3 rounded-full mb-4 ${mode === 'balanced' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Scale className="w-6 h-6" />
                    </div>
                    <h3 className={`font-bold text-lg ${mode === 'balanced' ? 'text-orange-700' : 'text-slate-700'}`}>สมดุล (Balanced)</h3>
                    <p className="text-xs text-slate-500 mt-2 font-mono bg-white px-2 py-1 rounded border">~2 นาที</p>
                    <p className="text-xs text-slate-400 mt-3 leading-relaxed">แนะนำสำหรับใช้งานทั่วไป คุณภาพดี เวลาประมวลผลเหมาะสม</p>
                  </div>

                  {/* Option 3: Perfect */}
                  <div 
                    onClick={() => setMode('perfect')}
                    className={`cursor-pointer border-2 rounded-xl p-6 flex flex-col items-center text-center transition-all hover:scale-[1.02] active:scale-95 ${mode === 'perfect' ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-200 shadow-md' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <div className={`p-3 rounded-full mb-4 ${mode === 'perfect' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Diamond className="w-6 h-6" />
                    </div>
                    <h3 className={`font-bold text-lg ${mode === 'perfect' ? 'text-purple-700' : 'text-slate-700'}`}>แม่นยำสูงสุด (Perfect)</h3>
                    <p className="text-xs text-slate-500 mt-2 font-mono bg-white px-2 py-1 rounded border">5-10 นาที+</p>
                    <p className="text-xs text-slate-400 mt-3 leading-relaxed">ประมวลผลซ้ำหลายรอบเพื่อหาตารางที่ดีที่สุด เหมาะสำหรับออกตารางจริง</p>
                  </div>

                </div>

                <div className="pt-4 border-t">
                  <Button 
                    size="lg" 
                    className="w-full text-lg py-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-[1.01]"
                    onClick={startGeneration}
                  >
                    <div className="flex flex-col items-center">
                      <span className="flex items-center gap-2 font-bold"><Play className="w-5 h-5 fill-current" /> เริ่มประมวลผล AI</span>
                      <span className="text-xs font-normal opacity-80 mt-1">โหมดที่เลือก: {mode.toUpperCase()}</span>
                    </div>
                  </Button>
                </div>
              </div>
            )}

            {/* --- STATE: GENERATING --- */}
            {status === 'generating' && (
              <div className="py-12 px-4 space-y-8 animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center">
                 <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                    <Loader2 className="w-16 h-16 text-indigo-600 animate-spin relative z-10" />
                 </div>
                 
                 <div className="w-full max-w-md space-y-2">
                    <div className="flex justify-between text-sm font-bold text-slate-600">
                      <span>Generating Schedules...</span>
                      <span className="text-indigo-600">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-4 bg-slate-100 [&>div]:bg-indigo-600" />
                 </div>

                 <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-slate-800">กำลังจัดตารางสอน (Mode: {mode})</h3>
                    <p className="text-slate-500 animate-pulse text-sm">
                       {message}
                    </p>
                    <p className="text-xs text-slate-400 mt-4">กรุณาอย่าปิดหน้านี้จนกว่าจะเสร็จสิ้น</p>
                 </div>
              </div>
            )}

            {/* --- STATE: SUCCESS --- */}
            {status === 'success' && (
              <div className="space-y-8 animate-in zoom-in duration-300">
                <Alert className="bg-green-50 border-green-200 flex flex-col items-center text-center py-6">
                  <div className="bg-green-100 p-2 rounded-full mb-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <AlertTitle className="text-xl text-green-800 font-bold mb-2">จัดตารางสำเร็จ!</AlertTitle>
                  <AlertDescription className="text-green-700 text-base">
                    {message}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center shadow-sm">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Penalty Score</p>
                    <p className="text-4xl font-mono font-bold text-indigo-600">{Number(result?.penalty || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-2">คะแนนความผิดพลาด (ยิ่งน้อยยิ่งดี)</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center shadow-sm">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Mode Used</p>
                    <p className="text-4xl font-mono font-bold text-slate-700 capitalize">{result?.mode || mode}</p>
                    <p className="text-xs text-slate-400 mt-2">โหมดการประมวลผล</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button variant="outline" size="lg" className="w-full" onClick={() => setStatus('idle')}>
                    จัดตารางใหม่อีกครั้ง
                  </Button>
                  
                </div>
                <Link href="/" className="w-full">
                    <Button size="lg" className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
                      กลับหน้า Dashboard
                    </Button>
                  </Link>
              </div>
            )}

            {/* --- STATE: ERROR --- */}
            {status === 'error' && (
              <div className="space-y-6 animate-in shake py-8">
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle className="text-lg font-bold ml-2">เกิดข้อผิดพลาด</AlertTitle>
                  <AlertDescription className="ml-7 mt-2 text-red-700">
                    {message}
                  </AlertDescription>
                </Alert>
                <div className="flex justify-center">
                    <Button variant="outline" size="lg" onClick={() => setStatus('idle')}>
                    ลองใหม่อีกครั้ง
                    </Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </main>
  );
}