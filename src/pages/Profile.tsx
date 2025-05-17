import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  UserCircle,
  Building2,
  GraduationCap,
  Users,
  Calendar,
  FileText,
  Settings,
  Mail,
  Phone,
  MapPin,
  Clock,
  Award,
  AlertCircle,
  Camera,
  X,
} from "lucide-react";

interface TherapistStats {
  totalClients: number;
  totalSessions: number;
  totalHours: number;
  notesGenerated: number;
}

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // This would come from your backend in a real app
  const therapistStats: TherapistStats = {
    totalClients: 24,
    totalSessions: 156,
    totalHours: 234,
    notesGenerated: 142,
  };

  const [formData, setFormData] = useState({
    fullName: "Dr. Taylor Parker",
    email: "taylor.parker@psyplex.com",
    phone: "+1 (555) 123-4567",
    address: "123 Therapy Street, Medical District, NY 10001",
    specialization: "Clinical Psychology",
    license: "NY-PSY-12345",
    education: "Ph.D. in Clinical Psychology, Stanford University",
    yearsOfExperience: "12",
    languages: "English, Spanish",
    insuranceAccepted: "Blue Cross, Aetna, United Healthcare",
    emergencyContact: "+1 (555) 987-6543",
  });

  useEffect(() => {
    if (profileImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(profileImage);
    } else {
      setImagePreview(null);
    }
  }, [profileImage]);

  const handleSave = () => {
    // Here you would update the profile in your backend
    setIsEditing(false);
    toast.success("Profile Updated", {
      description: "Your profile has been successfully updated."
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-therapy-gray mb-2">Therapist Profile</h1>
        <p className="text-gray-600 text-base">Manage your professional information and practice overview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-therapy-gray">Professional Details</CardTitle>
                <CardDescription>Your professional information and credentials</CardDescription>
              </div>
              <Button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className={
                  isEditing
                    ? "bg-therapy-purple w-full sm:w-auto"
                    : "bg-therapy-purple/10 text-therapy-purple hover:bg-therapy-purple hover:text-white w-full sm:w-auto"
                }
              >
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-24 h-24 rounded-full bg-therapy-purple/10 flex items-center justify-center overflow-hidden mb-4 sm:mb-0">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      {isEditing && (
                        <button
                          onClick={removeImage}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100 transition"
                          aria-label="Remove profile image"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </>
                  ) : (
                    <UserCircle className="w-12 h-12 text-therapy-purple" />
                  )}
                  {isEditing && (
                    <label
                      htmlFor="profileImageUpload"
                      className="absolute bottom-0 right-0 bg-therapy-purple text-white rounded-full p-1 cursor-pointer shadow hover:bg-therapy-purple-dark transition"
                      aria-label="Upload profile image"
                    >
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        id="profileImageUpload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-semibold text-therapy-gray">{formData.fullName}</h3>
                  <p className="text-gray-600">{formData.specialization}</p>
                  <p className="text-sm text-gray-500">License: {formData.license}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <Input
                      value={formData.email}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <Input
                      value={formData.phone}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <Input
                      value={formData.address}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <Input
                      value={formData.yearsOfExperience}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Education</Label>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-500" />
                    <Input
                      value={formData.education}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Languages</Label>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-gray-500" />
                    <Input
                      value={formData.languages}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Insurance Accepted</Label>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <Input
                      value={formData.insuranceAccepted}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, insuranceAccepted: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact</Label>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    <Input
                      value={formData.emergencyContact}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Right Column - Stats & Activity */}
        <div className="flex flex-col gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-therapy-gray">Practice Stats</CardTitle>
              <CardDescription>Overview of your practice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                <div className="bg-therapy-purple/10 rounded-lg p-4 flex flex-col items-center">
                  <Users className="w-6 h-6 text-therapy-purple mb-1" />
                  <span className="text-xl font-bold text-therapy-purple">{therapistStats.totalClients}</span>
                  <span className="text-xs text-gray-500">Clients</span>
                </div>
                <div className="bg-therapy-blue/10 rounded-lg p-4 flex flex-col items-center">
                  <Calendar className="w-6 h-6 text-therapy-blue mb-1" />
                  <span className="text-xl font-bold text-therapy-blue">{therapistStats.totalSessions}</span>
                  <span className="text-xs text-gray-500">Sessions</span>
                </div>
                <div className="bg-therapy-purple/10 rounded-lg p-4 flex flex-col items-center">
                  <Clock className="w-6 h-6 text-therapy-purple mb-1" />
                  <span className="text-xl font-bold text-therapy-purple">{therapistStats.totalHours}</span>
                  <span className="text-xs text-gray-500">Hours</span>
                </div>
                <div className="bg-therapy-blue/10 rounded-lg p-4 flex flex-col items-center">
                  <FileText className="w-6 h-6 text-therapy-blue mb-1" />
                  <span className="text-xl font-bold text-therapy-blue">{therapistStats.notesGenerated}</span>
                  <span className="text-xs text-gray-500">Notes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
