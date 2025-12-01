"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button"; // ✅ เพิ่ม import Button
import {
  Users,
  GraduationCap,
  BookOpen,
  RefreshCw,
  BrainCircuitIcon,
  Building2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  LogIn, // ✅ เพิ่ม icon
  LogOut // ✅ เพิ่ม icon
} from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

interface StatsData {
  students: number;
  instructors: number;
  subjects: number;
  rooms: number;
}

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ เพิ่ม State สำหรับ User
  const [user, setUser] = useState<any>(null);

 
  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/`);
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // ✅ เพิ่ม Logic เช็ค User จาก LocalStorage
    const storedUser = localStorage.getItem('sb-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("User data error", e);
      }
    }
  }, []);

  // ✅ เพิ่มฟังก์ชัน Logout
  const handleLogout = () => {
    if(confirm("ต้องการออกจากระบบใช่หรือไม่?")) {
        localStorage.removeItem('sb-user');
        setUser(null);
        router.push('/login'); // ดีดไปหน้า Login หรือจะให้อยู่หน้าเดิมก็ได้
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 pb-10">
      {/* Navbar */}
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <BrainCircuitIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Smart Scheduler AI</h1>
        </div>

        {/* ✅ ส่วนขวาของ Navbar ที่เปลี่ยนตามสถานะ Login */}
        <div className="flex items-center gap-3">
          {user ? (
            // กรณีล็อกอินแล้ว: โชว์ชื่อ + ปุ่ม Logout (Avatar)
            <>
              <div className="text-xs text-right hidden sm:block">
                <p className="font-medium text-slate-700">{user.email || 'Admin User'}</p>
                <p className="text-slate-400">System Administrator</p>
              </div>
              <div 
                className="cursor-pointer group relative" 
                onClick={handleLogout}
                title="คลิกเพื่อออกจากระบบ"
              >
                <Avatar className="h-9 w-9 border group-hover:ring-2 group-hover:ring-red-100 transition-all">
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                        AD
                    </AvatarFallback>
                </Avatar>
                {/* Tooltip เล็กๆ */}
                <div className="absolute top-10 right-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Logout
                </div>
              </div>
            </>
          ) : (
            // กรณีไม่ได้ล็อกอิน: โชว์ปุ่ม Login
            <Link href="/login">
              <Button variant="outline" size="sm" className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <LogIn className="w-4 h-4" /> เจ้าหน้าที่เข้าสู่ระบบ
              </Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Content */}
      <div className="p-8 container mx-auto max-w-7xl">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
            <p className="text-slate-500 text-sm mt-1">ภาพรวมข้อมูลและสถานะการทำงานของระบบ</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* ✅ ซ่อนปุ่ม Action ถ้ายังไม่ล็อกอิน */}
            {user && (
              <>
                <Link href="/generate">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm hover:shadow transition-all">
                    <Zap className="w-4 h-4 fill-current" />
                    AI Generate
                  </button>
                </Link>
                <Link href="/manage">
                  <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                    + จัดการข้อมูล
                  </button>
                </Link>
              </>
            )}

            <Link href="/schedule">
              <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                📅 ดูตารางเรียน
              </button>
            </Link>
            
            <button
              onClick={fetchStats}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 1. Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
           {/* ... (ส่วน Card Stats คงเดิม) ... */}
           <Card className="shadow-sm border-slate-200 hover:border-indigo-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Students</CardTitle>
              <Users className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{loading ? "..." : stats?.students || 0}</div>
              <p className="text-xs text-slate-500">นักเรียนทั้งหมดในระบบ</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 hover:border-indigo-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Instructors</CardTitle>
              <GraduationCap className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{loading ? "..." : stats?.instructors || 0}</div>
              <p className="text-xs text-slate-500">อาจารย์ผู้สอนทั้งหมด</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 hover:border-indigo-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{loading ? "..." : stats?.subjects || 0}</div>
              <p className="text-xs text-slate-500">รายวิชาที่เปิดสอน</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 hover:border-indigo-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Classrooms</CardTitle>
              <Building2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{loading ? "..." : stats?.rooms || 0}</div>
              <p className="text-xs text-slate-500">ห้องเรียนทั้งหมด</p>
            </CardContent>
          </Card>
        </div>


      </div>
    </main>
  );
}