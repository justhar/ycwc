"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { useState } from "react";
import {
  Cloud,
  GraduationCap,
  WandSparkles,
  SquarePen,
  Plus,
  X,
  Sparkles,
} from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DashboardPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[] | undefined>();

  // Profile data state
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    dob: "",
    nationality: "Indonesia",
    email: user?.email || "",
    targetLevel: "",
    intendedMajor: "",
    institution: "",
    graduationYear: "",
    academicScore: "",
    scoreScale: "gpa4",
  });

  // State for lists
  const [englishTests, setEnglishTests] = useState([
    { id: 1, type: "IELTS", score: "7.5", date: "2024-06-15" },
  ]);
  const [standardizedTests, setStandardizedTests] = useState([
    { id: 1, type: "GRE", score: "320", date: "2024-05-20" },
  ]);
  const [awards, setAwards] = useState([
    { id: 1, title: "National Math Olympiad", year: "2023", level: "National" },
  ]);
  const [extracurriculars, setExtracurriculars] = useState([
    { id: 1, activity: "Student Council President", period: "2022-2023" },
  ]);

  // Edit dialog state
  const [editingSection, setEditingSection] = useState<string | null>(null);
  
  // AI autofill section visibility state
  const [showAISection, setShowAISection] = useState(false);

  const handleDrop = (files: File[]) => {
    console.log(files);
    setFiles(files);
  };

  return (
    <ProtectedRoute>
      <div className="mx-2">
        <div className="my-2 p-15 bg-blue-50 flex flex-row rounded-lg">
          <div>
            <Avatar className="size-15 mr-2 ">
              <AvatarImage src="/avatars/haroki.jpg" />
              <AvatarFallback className="bg-blue-200">
                {user?.fullName
                  ? user.fullName
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-zinc-900">
              Selamat datang, {user?.fullName || "User"}!
            </h1>
            <p className=" text-zinc-600">
              Ayo lanjutkan progressmu di dashboard.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="border rounded-lg p-4 col-span-2">
            <h2 className="font-semibold text-2xl flex gap-2 items-center flex-row">
              Profile Kamu{" "}
              <Button
                variant="outline"
                className="border p-2 rounded-lg flex flex-row"
                onClick={() => setShowAISection(!showAISection)}
              >
                Autofill <Sparkles />
              </Button>
            </h2>
            <p className="text-zinc-500">
              Lengkapi profilmu untuk rekomendasi universitas terbaik!
            </p>
            {/* <Separator className="my-2" /> */}

            {showAISection && (
              <div className="border mb-5 mt-2 p-6 flex items-center flex-col rounded-xl relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  onClick={() => setShowAISection(false)}
                >
                  <X className="size-4" />
                </Button>
                <div className="items-center flex flex-col mb-5">
                  <h4 className="text-xl font-semibold items-center gap-2 flex flex-row">
                    Isi Profile Otomatis dengan AI{" "}
                    <WandSparkles className="size-5" />
                  </h4>
                  <p className="text-sm text-zinc-500">
                    Upload CV/Resume kamu, dan biarkan AI kami mengisi profilmu
                    secara otomatis.
                  </p>
                </div>
                <Dropzone
                  accept={{ "image/*": [] }}
                  onDrop={handleDrop}
                  onError={console.error}
                  className="border-dashed hover:cursor-pointer"
                  src={files}
                >
                  <DropzoneEmptyState />
                  <DropzoneContent />
                </Dropzone>
              </div>
            )}

            {/* Identitas Section */}
            <div className="flex items-center justify-between mt-6 mb-2">
              <h2 className="font-semibold text-xl">Identitas</h2>
              <Dialog
                open={editingSection === "identitas"}
                onOpenChange={(open: boolean) =>
                  setEditingSection(open ? "identitas" : null)
                }
              >
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <SquarePen className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Identitas</DialogTitle>
                    <DialogDescription>
                      Update your personal information
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={profileData.fullName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            fullName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={profileData.dob}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            dob: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Nationality</Label>
                      <Select
                        value={profileData.nationality}
                        onValueChange={(value) =>
                          setProfileData({ ...profileData, nationality: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Indonesia">Indonesia</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Contact Email</Label>
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={() => setEditingSection(null)}
                  >
                    Save Changes
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
            <Separator className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <strong>Full Name:</strong> {profileData.fullName || "Not set"}
              </div>
              <div>
                <strong>Date of Birth:</strong> {profileData.dob || "Not set"}
              </div>
              <div>
                <strong>Nationality:</strong> {profileData.nationality}
              </div>
              <div>
                <strong>Email:</strong> {profileData.email || "Not set"}
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="flex items-center justify-between mt-6 mb-2">
              <h2 className="font-semibold text-xl">Academic Information</h2>
              <Dialog
                open={editingSection === "academic"}
                onOpenChange={(open: boolean) =>
                  setEditingSection(open ? "academic" : null)
                }
              >
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <SquarePen className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Academic Information</DialogTitle>
                    <DialogDescription>
                      Update your educational background
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label>Target Level</Label>
                      <Select
                        value={profileData.targetLevel}
                        onValueChange={(value) =>
                          setProfileData({ ...profileData, targetLevel: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="undergrad">
                            Undergraduate
                          </SelectItem>
                          <SelectItem value="master">Master's</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                          <SelectItem value="exchange">Exchange</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Intended Major/Program</Label>
                      <Input
                        value={profileData.intendedMajor}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            intendedMajor: e.target.value,
                          })
                        }
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                    <div>
                      <Label>Institution</Label>
                      <Input
                        value={profileData.institution}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            institution: e.target.value,
                          })
                        }
                        placeholder="School/University name"
                      />
                    </div>
                    <div>
                      <Label>Graduation Year</Label>
                      <Input
                        type="number"
                        value={profileData.graduationYear}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            graduationYear: e.target.value,
                          })
                        }
                        placeholder="2024"
                      />
                    </div>
                    <div>
                      <Label>Academic Score</Label>
                      <div className="flex gap-2">
                        <Input
                          value={profileData.academicScore}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              academicScore: e.target.value,
                            })
                          }
                          placeholder="3.45 or 85"
                        />
                        <Select
                          value={profileData.scoreScale}
                          onValueChange={(value) =>
                            setProfileData({
                              ...profileData,
                              scoreScale: value,
                            })
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpa4">GPA (4.0)</SelectItem>
                            <SelectItem value="percentage">
                              Percentage
                            </SelectItem>
                            <SelectItem value="indo">
                              Indonesian Scale
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={() => setEditingSection(null)}
                  >
                    Save Changes
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
            <Separator className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <strong>Target Level:</strong>{" "}
                {profileData.targetLevel || "Not set"}
              </div>
              <div>
                <strong>Intended Major:</strong>{" "}
                {profileData.intendedMajor || "Not set"}
              </div>
              <div>
                <strong>Institution:</strong>{" "}
                {profileData.institution || "Not set"}
              </div>
              <div>
                <strong>Graduation Year:</strong>{" "}
                {profileData.graduationYear || "Not set"}
              </div>
              <div>
                <strong>Academic Score:</strong>{" "}
                {profileData.academicScore
                  ? `${profileData.academicScore} (${profileData.scoreScale})`
                  : "Not set"}
              </div>
            </div>

            {/* English Proficiency Section */}
            <div className="flex items-center justify-between mt-6 mb-2">
              <h2 className="font-semibold text-xl">English Proficiency</h2>
              <Dialog
                open={editingSection === "english"}
                onOpenChange={(open: boolean) =>
                  setEditingSection(open ? "english" : null)
                }
              >
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Plus className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add English Test</DialogTitle>
                    <DialogDescription>
                      Add a new English proficiency test result
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Test Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="toefl">TOEFL iBT</SelectItem>
                          <SelectItem value="ielts">IELTS</SelectItem>
                          <SelectItem value="duolingo">Duolingo</SelectItem>
                          <SelectItem value="pte">PTE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Score</Label>
                      <Input placeholder="110 / 7.5 / 125" />
                    </div>
                    <div>
                      <Label>Test Date</Label>
                      <Input type="date" />
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={() => setEditingSection(null)}
                  >
                    Add Test
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
            <Separator className="my-2" />
            <div className="space-y-2 mb-4">
              {englishTests.map((test) => (
                <Card key={test.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{test.type}</div>
                      <div className="text-sm text-gray-500">
                        Score: {test.score} • Date: {test.date}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEnglishTests(
                          englishTests.filter((t) => t.id !== test.id)
                        )
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Standardized Tests Section */}
            <div className="flex items-center justify-between mt-6 mb-2">
              <h2 className="font-semibold text-xl">Standardized Tests</h2>
              <Dialog
                open={editingSection === "standardized"}
                onOpenChange={(open: boolean) =>
                  setEditingSection(open ? "standardized" : null)
                }
              >
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Plus className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Standardized Test</DialogTitle>
                    <DialogDescription>
                      Add SAT, ACT, GRE, or GMAT test result
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Test Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select test" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sat">SAT</SelectItem>
                          <SelectItem value="act">ACT</SelectItem>
                          <SelectItem value="gre">GRE</SelectItem>
                          <SelectItem value="gmat">GMAT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Score</Label>
                      <Input placeholder="1400 / 32 / 320 / 700" />
                    </div>
                    <div>
                      <Label>Test Date</Label>
                      <Input type="date" />
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={() => setEditingSection(null)}
                  >
                    Add Test
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
            <Separator className="my-2" />
            <div className="space-y-2 mb-4">
              {standardizedTests.map((test) => (
                <Card key={test.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{test.type}</div>
                      <div className="text-sm text-gray-500">
                        Score: {test.score} • Date: {test.date}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setStandardizedTests(
                          standardizedTests.filter((t) => t.id !== test.id)
                        )
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Awards Section */}
            <div className="flex items-center justify-between mt-6 mb-2">
              <h2 className="font-semibold text-xl">Awards & Achievements</h2>
              <Dialog
                open={editingSection === "awards"}
                onOpenChange={(open: boolean) =>
                  setEditingSection(open ? "awards" : null)
                }
              >
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Plus className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Award/Achievement</DialogTitle>
                    <DialogDescription>
                      Add publications, competitions, or awards
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Title</Label>
                      <Input placeholder="e.g., National Math Olympiad" />
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Input placeholder="2023" />
                    </div>
                    <div>
                      <Label>Level</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="school">School</SelectItem>
                          <SelectItem value="local">Local</SelectItem>
                          <SelectItem value="regional">Regional</SelectItem>
                          <SelectItem value="national">National</SelectItem>
                          <SelectItem value="international">
                            International
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={() => setEditingSection(null)}
                  >
                    Add Award
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
            <Separator className="my-2" />
            <div className="space-y-2 mb-4">
              {awards.map((award) => (
                <Card key={award.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{award.title}</div>
                      <div className="text-sm text-gray-500">
                        {award.year} • {award.level}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setAwards(awards.filter((a) => a.id !== award.id))
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Extracurriculars Section */}
            <div className="flex items-center justify-between mt-6 mb-2">
              <h2 className="font-semibold text-xl">Extracurriculars</h2>
              <Dialog
                open={editingSection === "extracurriculars"}
                onOpenChange={(open: boolean) =>
                  setEditingSection(open ? "extracurriculars" : null)
                }
              >
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Plus className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Extracurricular Activity</DialogTitle>
                    <DialogDescription>
                      Add leadership roles, clubs, or activities
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Activity</Label>
                      <Input placeholder="e.g., Student Council President" />
                    </div>
                    <div>
                      <Label>Period</Label>
                      <Input placeholder="e.g., 2022-2023" />
                    </div>
                    <div>
                      <Label>Description (Optional)</Label>
                      <Textarea placeholder="Brief description of your role and achievements" />
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={() => setEditingSection(null)}
                  >
                    Add Activity
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
            <Separator className="my-2" />
            <div className="space-y-2 mb-4">
              {extracurriculars.map((activity) => (
                <Card key={activity.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{activity.activity}</div>
                      <div className="text-sm text-gray-500">
                        {activity.period}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExtracurriculars(
                          extracurriculars.filter((a) => a.id !== activity.id)
                        )
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold text-2xl">Universitas Favorit</h2>
            <Separator className="my-2" />
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <GraduationCap />
                </EmptyMedia>
                <EmptyTitle>Belum ada universitas favorit</EmptyTitle>
                <EmptyDescription>
                  Tambahkan universitas favorit Anda untuk memulai.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" size="sm">
                  Cari Universitas
                </Button>
                <p className="text-zinc-500">atau</p>
                <Button variant="outline" size="sm">
                  Cari dengan Match AI
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
