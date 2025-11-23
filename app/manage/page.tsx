"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Save,
  ArrowLeft,
  Building2,
  BookOpen,
  User,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function ManagePage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("sb-user");
    if (!user) {
      router.push("/login"); // ถ้าไม่มี user ให้ดีดไปหน้า login
    }
  }, []);
  const [loading, setLoading] = useState(false);

  // --- State เก็บข้อมูล (อัปเดตเพิ่ม Field) ---
  const [student, setStudent] = useState({
    student_id: "",
    first_name: "",
    last_name: "",
    department: "",
    year_level: "",
    group_no: "", // +group_no
  });

  const [instructor, setInstructor] = useState({
    first_name: "",
    last_name: "",
    department: "",
    max_hours_per_week: "", // +max_hours
  });

  const [classroom, setClassroom] = useState({
    room_code: "",
    room_type: "",
    capacity: "",
    building: "",
    department_owner: "", // +department_owner
  });

  const [subject, setSubject] = useState({
    subject_code: "",
    subject_name: "",
    theory_hours: "0",
    practice_hours: "0",
    credits: "0",
    instructor_1_fname: "",
    instructor_1_lname: "",
    instructor_2_fname: "",
    instructor_2_lname: "",
  });

  // --- ฟังก์ชัน Submit Generic ---
  const postData = async (endpoint: string, data: any, typeName: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/data/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Failed to save data");
      alert(`✅ บันทึกข้อมูล ${typeName} สำเร็จ!`);
      return true;
    } catch (err) {
      alert(`❌ เกิดข้อผิดพลาด: ${err}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await postData("students", student, "นักเรียน")) {
      setStudent({
        student_id: "",
        first_name: "",
        last_name: "",
        department: "",
        year_level: "",
        group_no: "",
      });
    }
  };

  const submitInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    // แปลง max_hours เป็น int
    const payload = {
      ...instructor,
      max_hours_per_week: parseInt(instructor.max_hours_per_week) || 20,
    };
    if (await postData("instructors", payload, "อาจารย์")) {
      setInstructor({
        first_name: "",
        last_name: "",
        department: "",
        max_hours_per_week: "",
      });
    }
  };

  const submitClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...classroom,
      capacity: parseInt(classroom.capacity) || 0,
    };
    if (await postData("classrooms", payload, "ห้องเรียน")) {
      setClassroom({
        room_code: "",
        room_type: "",
        capacity: "",
        building: "",
        department_owner: "",
      });
    }
  };

  const submitSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...subject,
      theory_hours: parseInt(subject.theory_hours) || 0,
      practice_hours: parseInt(subject.practice_hours) || 0,
      credits: parseInt(subject.credits) || 0,
    };
    if (await postData("subjects", payload, "รายวิชา")) {
      setSubject({
        subject_code: "",
        subject_name: "",
        theory_hours: "0",
        practice_hours: "0",
        credits: "0",
        instructor_1_fname: "",
        instructor_1_lname: "",
        instructor_2_fname: "",
        instructor_2_lname: "",
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="container mx-auto max-w-5xl">
        <Link
          href="/"
          className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> กลับไปหน้า Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          📝 Manage Data Center
        </h1>

        {/* Tabs Menu */}
        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-slate-200/50 gap-1">
            <TabsTrigger
              value="student"
              className="py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <User className="w-4 h-4 mr-2" /> นักเรียน
            </TabsTrigger>
            <TabsTrigger
              value="instructor"
              className="py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <GraduationCap className="w-4 h-4 mr-2" /> อาจารย์
            </TabsTrigger>
            <TabsTrigger
              value="classroom"
              className="py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Building2 className="w-4 h-4 mr-2" /> ห้องเรียน
            </TabsTrigger>
            <TabsTrigger
              value="subject"
              className="py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BookOpen className="w-4 h-4 mr-2" /> รายวิชา
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            {/* --- 1. ฟอร์มนักเรียน --- */}
            <TabsContent value="student">
              <Card>
                <CardHeader>
                  <CardTitle>เพิ่มข้อมูลนักเรียน</CardTitle>
                  <CardDescription>ลงทะเบียนนักเรียนใหม่</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitStudent} className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>รหัสนักศึกษา</Label>
                        <Input
                          required
                          placeholder="66123456"
                          value={student.student_id}
                          onChange={(e) =>
                            setStudent({
                              ...student,
                              student_id: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ชั้นปี</Label>
                        <Input
                          required
                          placeholder="ปวช.1"
                          value={student.year_level}
                          onChange={(e) =>
                            setStudent({
                              ...student,
                              year_level: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>กลุ่มที่</Label>
                        <Input
                          placeholder="1"
                          value={student.group_no}
                          onChange={(e) =>
                            setStudent({ ...student, group_no: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>ชื่อจริง</Label>
                        <Input
                          required
                          placeholder="ชื่อ"
                          value={student.first_name}
                          onChange={(e) =>
                            setStudent({
                              ...student,
                              first_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>นามสกุล</Label>
                        <Input
                          required
                          placeholder="นามสกุล"
                          value={student.last_name}
                          onChange={(e) =>
                            setStudent({
                              ...student,
                              last_name: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>แผนกวิชา</Label>
                      <Input
                        required
                        placeholder="เทคโนโลยีสารสนเทศ"
                        value={student.department}
                        onChange={(e) =>
                          setStudent({ ...student, department: e.target.value })
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full mt-4"
                      disabled={loading}
                    >
                      {loading ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" /> บันทึกนักเรียน
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- 2. ฟอร์มอาจารย์ --- */}
            <TabsContent value="instructor">
              <Card>
                <CardHeader>
                  <CardTitle>เพิ่มข้อมูลอาจารย์</CardTitle>
                  <CardDescription>ลงทะเบียนอาจารย์ผู้สอน</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitInstructor} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>ชื่อจริง</Label>
                        <Input
                          required
                          placeholder="ชื่ออาจารย์"
                          value={instructor.first_name}
                          onChange={(e) =>
                            setInstructor({
                              ...instructor,
                              first_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>นามสกุล</Label>
                        <Input
                          required
                          placeholder="นามสกุล"
                          value={instructor.last_name}
                          onChange={(e) =>
                            setInstructor({
                              ...instructor,
                              last_name: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>แผนก/สาขาวิชา</Label>
                        <Input
                          required
                          placeholder="หมวดวิชาสามัญ"
                          value={instructor.department}
                          onChange={(e) =>
                            setInstructor({
                              ...instructor,
                              department: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>สอนสูงสุด (ชม./สัปดาห์)</Label>
                        <Input
                          type="number"
                          placeholder="20"
                          value={instructor.max_hours_per_week}
                          onChange={(e) =>
                            setInstructor({
                              ...instructor,
                              max_hours_per_week: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
                      disabled={loading}
                    >
                      {loading ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" /> บันทึกอาจารย์
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- 3. ฟอร์มห้องเรียน --- */}
            <TabsContent value="classroom">
              <Card>
                <CardHeader>
                  <CardTitle>เพิ่มข้อมูลห้องเรียน</CardTitle>
                  <CardDescription>ระบุรายละเอียดห้องเรียน</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitClassroom} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>รหัสห้อง (Room Code)</Label>
                        <Input
                          required
                          placeholder="EN 1/1"
                          value={classroom.room_code}
                          onChange={(e) =>
                            setClassroom({
                              ...classroom,
                              room_code: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ประเภทห้อง</Label>
                        <Input
                          placeholder="ปฏิบัติการ"
                          value={classroom.room_type}
                          onChange={(e) =>
                            setClassroom({
                              ...classroom,
                              room_type: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>จำนวนที่นั่ง</Label>
                        <Input
                          type="number"
                          required
                          placeholder="40"
                          value={classroom.capacity}
                          onChange={(e) =>
                            setClassroom({
                              ...classroom,
                              capacity: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>อาคาร</Label>
                        <Input
                          placeholder="3"
                          value={classroom.building}
                          onChange={(e) =>
                            setClassroom({
                              ...classroom,
                              building: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>แผนกเจ้าของ</Label>
                        <Input
                          placeholder="ช่างอิเล็กทรอนิกส์"
                          value={classroom.department_owner}
                          onChange={(e) =>
                            setClassroom({
                              ...classroom,
                              department_owner: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
                      disabled={loading}
                    >
                      {loading ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" /> บันทึกห้องเรียน
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- 4. ฟอร์มรายวิชา --- */}
            <TabsContent value="subject">
              <Card>
                <CardHeader>
                  <CardTitle>เพิ่มข้อมูลรายวิชา</CardTitle>
                  <CardDescription>รายละเอียดวิชาและครูผู้สอน</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitSubject} className="space-y-4">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="col-span-1 space-y-2">
                        <Label>รหัสวิชา</Label>
                        <Input
                          required
                          placeholder="20000-xxxx"
                          value={subject.subject_code}
                          onChange={(e) =>
                            setSubject({
                              ...subject,
                              subject_code: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-span-3 space-y-2">
                        <Label>ชื่อวิชา</Label>
                        <Input
                          required
                          placeholder="ชื่อวิชา"
                          value={subject.subject_name}
                          onChange={(e) =>
                            setSubject({
                              ...subject,
                              subject_name: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>ทฤษฎี (ชม.)</Label>
                        <Input
                          type="number"
                          required
                          value={subject.theory_hours}
                          onChange={(e) =>
                            setSubject({
                              ...subject,
                              theory_hours: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ปฏิบัติ (ชม.)</Label>
                        <Input
                          type="number"
                          required
                          value={subject.practice_hours}
                          onChange={(e) =>
                            setSubject({
                              ...subject,
                              practice_hours: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>หน่วยกิต</Label>
                        <Input
                          type="number"
                          required
                          value={subject.credits}
                          onChange={(e) =>
                            setSubject({ ...subject, credits: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-slate-50 space-y-4">
                      <Label className="text-slate-600">
                        ครูผู้สอนประจำวิชา (ระบุอย่างน้อย 1 คน)
                      </Label>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          placeholder="ชื่อครูคนที่ 1"
                          value={subject.instructor_1_fname}
                          onChange={(e) =>
                            setSubject({
                              ...subject,
                              instructor_1_fname: e.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="นามสกุลครูคนที่ 1"
                          value={subject.instructor_1_lname}
                          onChange={(e) =>
                            setSubject({
                              ...subject,
                              instructor_1_lname: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          placeholder="ชื่อครูคนที่ 2 (ถ้ามี)"
                          value={subject.instructor_2_fname}
                          onChange={(e) =>
                            setSubject({
                              ...subject,
                              instructor_2_fname: e.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="นามสกุลครูคนที่ 2 (ถ้ามี)"
                          value={subject.instructor_2_lname}
                          onChange={(e) =>
                            setSubject({
                              ...subject,
                              instructor_2_lname: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full mt-4 bg-pink-600 hover:bg-pink-700"
                      disabled={loading}
                    >
                      {loading ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" /> บันทึกรายวิชา
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </main>
  );
}
