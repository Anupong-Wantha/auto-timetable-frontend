'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx'; 
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, CalendarDays, User, GraduationCap, Building2, BookOpen, 
  ArrowLeft, Clock, Hash, Users, MapPin, Building, Eraser,
  Download, FileText 
} from "lucide-react";
import Link from 'next/link';

// --- Constants ---
const TIME_SLOTS = [
  "08:00-09:00", 
  "09:00-10:00", 
  "10:00-11:00", 
  "11:00-12:00", 
  "12:00-13:00", 
  "13:00-14:00", 
  "14:00-15:00", 
  "15:00-16:00", 
  "16:00-17:00"
];

const DAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];

// --- Mock Data ---
const DEPARTMENTS = ["เทคโนโลยีสารสนเทศ", "ช่างอิเล็กทรอนิกส์", "ยานยนต์ไฟฟ้า", "ช่างเทคนิคคอมพิวเตอร์", "บัญชี", "การตลาด"];
const YEARS = ["ปวช.1", "ปวช.2", "ปวช.3", "ปวส.1", "ปวส.2"];
const ROOM_TYPES = ["ทฤษฎี", "ปฏิบัติการ", "คอมพิวเตอร์", "โรงฝึกงาน"];

export default function SchedulePage() {
  const [searchType, setSearchType] = useState('student');
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const scheduleRef = useRef<HTMLDivElement>(null);

  // State สำหรับ Filter
  const [filters, setFilters] = useState({
    std_id: '', std_fname: '', std_lname: '', std_year: '', std_group: '', std_dept: '',
    ins_fname: '', ins_lname: '', ins_dept: '',
    room_code: '', room_type: '', room_dept: '', room_building: '',
    subj_code: '', subj_name: '', subj_instructor: ''
  });

  const handleTabChange = (val: string) => {
    setSearchType(val);
    clearFilters();
    setSearched(false);
    setScheduleData([]);
  };

  const clearFilters = () => {
    setFilters({
      std_id: '', std_fname: '', std_lname: '', std_year: '', std_group: '', std_dept: '',
      ins_fname: '', ins_lname: '', ins_dept: '',
      room_code: '', room_type: '', room_dept: '', room_building: '',
      subj_code: '', subj_name: '', subj_instructor: ''
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setScheduleData([]);

    try {
      const params = new URLSearchParams();
      params.append('type', searchType);
      
      // ... (Search Logic เหมือนเดิม)
      if(searchType === 'student') {
        if(filters.std_id) params.append('id', filters.std_id.trim());
        if(filters.std_fname) params.append('fname', filters.std_fname.trim());
        if(filters.std_lname) params.append('lname', filters.std_lname.trim());
        if(filters.std_dept) params.append('dept', filters.std_dept);
        if(filters.std_year) params.append('year', filters.std_year);
        if(filters.std_group) params.append('group', filters.std_group.trim());
      } 
      else if(searchType === 'instructor') {
        if(filters.ins_fname) params.append('fname', filters.ins_fname.trim());
        if(filters.ins_lname) params.append('lname', filters.ins_lname.trim());
        if(filters.ins_dept) params.append('dept', filters.ins_dept);
      }
      else if(searchType === 'room') {
        if(filters.room_code) params.append('room_code', filters.room_code.trim());
        if(filters.room_type) params.append('room_type', filters.room_type);
        if(filters.room_building) params.append('building', filters.room_building.trim());
        if(filters.room_dept) params.append('dept', filters.room_dept);
      }
      else if(searchType === 'subject') {
        if(filters.subj_code) params.append('code', filters.subj_code.trim());
        if(filters.subj_name) params.append('name', filters.subj_name.trim());
        if(filters.subj_instructor) params.append('instructor', filters.subj_instructor.trim());
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schedules/search?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setScheduleData(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error("Search Error:", error);
      setScheduleData([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Export Excel ---
  const handleExportExcel = () => {
    if (!scheduleData || scheduleData.length === 0) {
      alert("ไม่มีข้อมูลให้ Export");
      return;
    }
    const headerRow = ["วัน / เวลา", ...TIME_SLOTS];
    const dataRows: any[][] = [];
    const merges: XLSX.Range[] = []; 

    DAYS.forEach((dayName, dayIndex) => {
      const rowData: string[] = new Array(TIME_SLOTS.length + 1).fill("");
      rowData[0] = dayName;
      let skipUntil = -1; 

      for (let i = 0; i < TIME_SLOTS.length; i++) {
        if (i <= skipUntil) continue;
        const subject = scheduleData.find(s => s.day_of_week === dayIndex && s.start_slot === i);

        if (subject) {
          let span = 1;
          for (let j = i + 1; j < TIME_SLOTS.length; j++) {
            const nextSubject = scheduleData.find(s => s.day_of_week === dayIndex && s.start_slot === j);
            if (nextSubject && nextSubject.subject_code === subject.subject_code && nextSubject.room_code === subject.room_code) {
              span++;
            } else {
              break;
            }
          }

          const cellText = `${subject.subject_name}\n(${subject.subject_code})\nห้อง: ${subject.room_code}\n${subject.department || ''}`;
          rowData[i + 1] = cellText;

          if (span > 1) {
            merges.push({
              s: { r: dayIndex + 1, c: i + 1 }, 
              e: { r: dayIndex + 1, c: i + span } 
            });
          }
          skipUntil = i + span - 1;
        }
      }
      dataRows.push(rowData);
    });

    const wsData = [headerRow, ...dataRows];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!merges'] = merges;
    const cols = [{ wch: 15 }, ...TIME_SLOTS.map(() => ({ wch: 25 }))];
    ws['!cols'] = cols;
    XLSX.utils.book_append_sheet(wb, ws, "ตารางเรียน");
    XLSX.writeFile(wb, `Schedule_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // --- Export PDF ---
  const handleExportPDF = async () => {
    if (!scheduleRef.current || scheduleData.length === 0) {
        alert("ไม่มีข้อมูลให้ Export");
        return;
    }
    try {
        const input = scheduleRef.current;
        const dataUrl = await htmlToImage.toPng(input, { 
            quality: 1.0,
            pixelRatio: 2, 
            backgroundColor: '#ffffff'
        });

        const pdf = new jsPDF('l', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(dataUrl);
        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;
        const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;
        const imgX = (pdfWidth - finalWidth) / 2;
        const imgY = 15; 

        pdf.setFontSize(16);
        pdf.text("Class Schedule", 14, 10); 
        pdf.addImage(dataUrl, 'PNG', imgX, imgY, finalWidth, finalHeight);
        pdf.save(`Schedule_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
        console.error("PDF Export Error:", error);
        alert("เกิดข้อผิดพลาดในการสร้าง PDF");
    }
  };

  const renderRowCells = (dayIndex: number) => {
    const cells = [];
    let skipUntil = -1; 
    for (let i = 0; i < TIME_SLOTS.length; i++) {
        if (i <= skipUntil) continue; 
        const subject = scheduleData.find(s => s.day_of_week === dayIndex && s.start_slot === i);
        if (subject) {
            let span = 1;
            for (let j = i + 1; j < TIME_SLOTS.length; j++) {
                const nextSubject = scheduleData.find(s => s.day_of_week === dayIndex && s.start_slot === j);
                if (nextSubject && nextSubject.subject_code === subject.subject_code && nextSubject.room_code === subject.room_code) {
                    span++;
                } else {
                    break; 
                }
            }
            cells.push(
                <td key={i} colSpan={span} className="border-b border-r p-1 h-28 align-top relative min-w-[100px]">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-md h-full w-full flex flex-col justify-center items-center text-center p-2 shadow-sm hover:bg-indigo-100 cursor-pointer absolute inset-0 m-1 transition-transform active:scale-95">
                        <span className="text-xs font-bold text-indigo-700 line-clamp-2">{subject.subject_name}</span>
                        <span className="text-[10px] text-slate-500 mt-1 font-mono bg-white/50 px-1 rounded">{subject.subject_code}</span>
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-indigo-600 font-medium">
                            <Clock className="w-3 h-3" /> {TIME_SLOTS[i].split('-')[0]} - {TIME_SLOTS[i + span - 1].split('-')[1]}
                        </div>
                        <div className="flex gap-1 mt-2 flex-wrap justify-center">
                            <Badge variant="secondary" className="text-[9px] px-1.5 h-4 bg-white border-slate-200 text-slate-600">📍 {subject.room_code}</Badge>
                        </div>
                    </div>
                </td>
            );
            skipUntil = i + span - 1;
        } else {
            cells.push(<td key={i} className="border-b border-r p-1 h-28 min-w-[100px]"></td>);
        }
    }
    return cells;
  };

  const SearchInput = ({ icon: Icon, ...props }: any) => (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input className="pl-9 bg-slate-50 focus:bg-white transition-colors h-11" {...props} />
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50/50 p-3 md:p-8 font-sans">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header - Responsive Layout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <Link href="/" className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium w-fit">
                <ArrowLeft className="w-4 h-4 mr-2" /> กลับหน้าหลัก
            </Link>
            
            <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200 shrink-0">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl md:text-3xl font-bold text-slate-800">
                    ระบบค้นหาตารางเรียน
                </h1>
            </div>
            {/* Spacer for desktop layout balance */}
            <div className="hidden md:block w-24"></div>
        </div>

        {/* Search Card */}
        <Card className="mb-8 shadow-xl shadow-slate-200/60 border-0 overflow-hidden bg-white">
          <CardHeader className="pb-0 bg-gradient-to-r from-indigo-50 to-white border-b px-4 md:px-6 pt-6">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" /> ค้นหาข้อมูล
            </CardTitle>
            <CardDescription>เลือกประเภทข้อมูลที่ต้องการค้นหา</CardDescription>
            
            {/* Responsive Tabs */}
            <Tabs defaultValue="student" onValueChange={handleTabChange} className="w-full mt-4">
              <TabsList className="flex w-full overflow-x-auto bg-slate-100/80 p-1 rounded-t-lg rounded-b-none h-12 gap-1 no-scrollbar">
                <TabsTrigger value="student" className="flex-1 min-w-[100px] data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm font-medium"><User className="w-4 h-4 mr-2"/> นักเรียน</TabsTrigger>
                <TabsTrigger value="instructor" className="flex-1 min-w-[100px] data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm font-medium"><GraduationCap className="w-4 h-4 mr-2"/> อาจารย์</TabsTrigger>
                <TabsTrigger value="room" className="flex-1 min-w-[100px] data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm font-medium"><Building2 className="w-4 h-4 mr-2"/> ห้อง</TabsTrigger>
                <TabsTrigger value="subject" className="flex-1 min-w-[100px] data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm font-medium"><BookOpen className="w-4 h-4 mr-2"/> วิชา</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="p-4 md:p-8">
            <form onSubmit={handleSearch}>
              
              {/* --- 1. STUDENT SEARCH --- */}
              {searchType === 'student' && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase">รหัสนักศึกษา</label>
                            <SearchInput icon={Hash} placeholder="เช่น 662090100xx" value={filters.std_id} onChange={(e:any) => setFilters({...filters, std_id: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase">ชื่อจริง</label>
                            <SearchInput icon={User} placeholder="ระบุชื่อจริง" value={filters.std_fname} onChange={(e:any) => setFilters({...filters, std_fname: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase">นามสกุล</label>
                            <SearchInput icon={User} placeholder="ระบุนามสกุล" value={filters.std_lname} onChange={(e:any) => setFilters({...filters, std_lname: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase">ระดับชั้น</label>
                            <Select onValueChange={val => setFilters({...filters, std_year: val})} value={filters.std_year}>
                                <SelectTrigger className="bg-slate-50 h-11"><SelectValue placeholder="เลือกชั้นปี" /></SelectTrigger>
                                <SelectContent>
                                    {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase">ห้อง / กลุ่มเรียน</label>
                            <SearchInput icon={Users} placeholder="เช่น 1, 2, A, B" value={filters.std_group} onChange={(e:any) => setFilters({...filters, std_group: e.target.value})} />
                        </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase">แผนกวิชา</label>
                            <Select onValueChange={val => setFilters({...filters, std_dept: val})} value={filters.std_dept}>
                                <SelectTrigger className="bg-slate-50 h-11"><SelectValue placeholder="เลือกแผนก" /></SelectTrigger>
                                <SelectContent>
                                    {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
              )}

              {/* --- 2. INSTRUCTOR SEARCH --- */}
              {searchType === 'instructor' && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">ชื่ออาจารย์</label>
                        <SearchInput icon={User} placeholder="ระบุชื่อ" value={filters.ins_fname} onChange={(e:any) => setFilters({...filters, ins_fname: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">นามสกุลอาจารย์</label>
                        <SearchInput icon={User} placeholder="ระบุนามสกุล" value={filters.ins_lname} onChange={(e:any) => setFilters({...filters, ins_lname: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">แผนกวิชา</label>
                        <Select onValueChange={val => setFilters({...filters, ins_dept: val})} value={filters.ins_dept}>
                            <SelectTrigger className="bg-slate-50 h-11"><SelectValue placeholder="สังกัดแผนก" /></SelectTrigger>
                            <SelectContent>
                                {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
              )}

              {/* --- 3. ROOM SEARCH --- */}
              {searchType === 'room' && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">รหัส/ชื่อห้อง</label>
                        <SearchInput icon={MapPin} placeholder="เช่น 523, LAB-1" value={filters.room_code} onChange={(e:any) => setFilters({...filters, room_code: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">ประเภทห้อง</label>
                        <Select onValueChange={val => setFilters({...filters, room_type: val})} value={filters.room_type}>
                            <SelectTrigger className="bg-slate-50 h-11"><SelectValue placeholder="ประเภท" /></SelectTrigger>
                            <SelectContent>
                                {ROOM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">อาคาร</label>
                        <SearchInput icon={Building} placeholder="เช่น อาคาร 5" value={filters.room_building} onChange={(e:any) => setFilters({...filters, room_building: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">แผนกที่ดูแล</label>
                          <Select onValueChange={val => setFilters({...filters, room_dept: val})} value={filters.room_dept}>
                            <SelectTrigger className="bg-slate-50 h-11"><SelectValue placeholder="แผนกเจ้าของห้อง" /></SelectTrigger>
                            <SelectContent>
                                {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
              )}

               {/* --- 4. SUBJECT SEARCH --- */}
               {searchType === 'subject' && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">รหัสวิชา</label>
                        <SearchInput icon={Hash} placeholder="เช่น 2000-xxxx" value={filters.subj_code} onChange={(e:any) => setFilters({...filters, subj_code: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">ชื่อวิชา</label>
                        <SearchInput icon={BookOpen} placeholder="ชื่อรายวิชา" value={filters.subj_name} onChange={(e:any) => setFilters({...filters, subj_name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">ครูผู้สอน</label>
                        <SearchInput icon={User} placeholder="ชื่อครูผู้สอน" value={filters.subj_instructor} onChange={(e:any) => setFilters({...filters, subj_instructor: e.target.value})} />
                    </div>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 mt-8 border-t pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={clearFilters}
                    className="w-full sm:w-32 h-12 text-slate-500 hover:text-slate-700"
                  >
                    <Eraser className="w-4 h-4 mr-2" /> ล้างค่า
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full sm:w-48 h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105"
                  >
                    {loading ? (
                        <span className="flex items-center"><span className="animate-spin mr-2">⏳</span> กำลังค้นหา...</span>
                    ) : (
                        <span className="flex items-center"><Search className="w-4 h-4 mr-2" /> ค้นหาตารางเรียน</span>
                    )}
                  </Button>
              </div>

            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {searched && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {scheduleData.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
                        <div className="p-4 bg-indigo-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                                <CalendarDays className="w-5 h-5" /> ผลลัพธ์การค้นหา
                                <Badge className="ml-2 bg-indigo-200 text-indigo-800 hover:bg-indigo-300">{scheduleData.length} รายการ</Badge>
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                {/* ปุ่ม Export Excel */}
                                <Button 
                                    onClick={handleExportExcel}
                                    variant="outline"
                                    className="flex-1 sm:flex-none border-green-500 text-green-700 hover:bg-green-50 text-xs sm:text-sm"
                                >
                                    <Download className="w-4 h-4 mr-2" /> Excel
                                </Button>
                                {/* ปุ่ม Export PDF */}
                                <Button 
                                    onClick={handleExportPDF}
                                    variant="outline"
                                    className="flex-1 sm:flex-none border-red-500 text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                                >
                                    <FileText className="w-4 h-4 mr-2" /> PDF
                                </Button>
                            </div>
                        </div>
                        
                        {/* Table Container with Scroll */}
                        <div className="overflow-x-auto w-full">
                            <div ref={scheduleRef} className="bg-white p-2 min-w-fit">
                                <table className="w-full min-w-[1000px] lg:min-w-[1200px]">
                                    <thead>
                                        <tr>
                                            <th className="bg-white p-4 w-24 border-b border-r text-sm font-semibold text-slate-700 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                วัน / เวลา
                                            </th>
                                            {TIME_SLOTS.map((time, i) => (
                                                <th key={i} className="bg-slate-50 p-2 border-b border-r text-xs font-medium text-slate-500 text-center w-[8%] min-w-[80px]">
                                                    <div className="mb-1 bg-slate-200/50 rounded py-0.5 mx-auto w-fit px-2 font-mono">คาบ {i+1}</div>
                                                    {time}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {DAYS.map((day, dayIndex) => (
                                            <tr key={day}>
                                                <td className="bg-slate-50 p-4 border-b border-r font-bold text-slate-700 text-center sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                    {day}
                                                </td>
                                                {renderRowCells(dayIndex)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed shadow-sm">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-900 font-medium text-lg">ไม่พบข้อมูลตารางเรียน</p>
                        <p className="text-slate-500 text-sm mt-1">ลองตรวจสอบคำค้นหา หรือปรับเปลี่ยนเงื่อนไขใหม่</p>
                    </div>
                )}
            </div>
        )}

      </div>
    </main>
  );
}