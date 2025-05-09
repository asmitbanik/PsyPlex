import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import { toast } from "@/hooks/use-toast";
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

  const handleSave = () => {
    // Here you would update the profile in your backend
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-therapy-gray mb-2">Therapist Profile</h1>
        <p className="text-gray-600">
          Manage your professional information and practice overview
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-therapy-gray">
                  Professional Details
                </CardTitle>
                <CardDescription>
                  Your professional information and credentials
                </CardDescription>
              </div>
              <Button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={isEditing ? "bg-therapy-purple" : "bg-therapy-purple/10 text-therapy-purple hover:bg-therapy-purple hover:text-white"}
              >
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-therapy-purple/10 flex items-center justify-center">
                  <UserCircle className="w-12 h-12 text-therapy-purple" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-therapy-gray">{formData.fullName}</h3>
                  <p className="text-gray-600">{formData.specialization}</p>
                  <p className="text-sm text-gray-500">License: {formData.license}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <Input
                      value={formData.email}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Insurance Accepted</Label>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <Input
                    value={formData.insuranceAccepted}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, insuranceAccepted: e.target.value })}
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
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Activity */}
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-therapy-gray">Practice Overview</CardTitle>
              <CardDescription>Your practice statistics</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-therapy-purple/5 rounded-xl">
                <Users className="w-6 h-6 text-therapy-purple mb-2" />
                <h4 className="text-2xl font-bold text-therapy-gray">{therapistStats.totalClients}</h4>
                <p className="text-sm text-gray-600">Active Clients</p>
              </div>
              
              <div className="p-4 bg-therapy-blue/5 rounded-xl">
                <Calendar className="w-6 h-6 text-therapy-blue mb-2" />
                <h4 className="text-2xl font-bold text-therapy-gray">{therapistStats.totalSessions}</h4>
                <p className="text-sm text-gray-600">Sessions</p>
              </div>
              
              <div className="p-4 bg-therapy-green/5 rounded-xl">
                <Clock className="w-6 h-6 text-therapy-green mb-2" />
                <h4 className="text-2xl font-bold text-therapy-gray">{therapistStats.totalHours}</h4>
                <p className="text-sm text-gray-600">Hours</p>
              </div>
              
              <div className="p-4 bg-therapy-orange/5 rounded-xl">
                <FileText className="w-6 h-6 text-therapy-orange mb-2" />
                <h4 className="text-2xl font-bold text-therapy-gray">{therapistStats.notesGenerated}</h4>
                <p className="text-sm text-gray-600">Notes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-therapy-gray">
                Settings & Preferences
              </CardTitle>
              <CardDescription>Customize your workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-therapy-purple" />
                  <span className="text-sm font-medium">Email Notifications</span>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-therapy-purple" />
                  <span className="text-sm font-medium">Calendar Settings</span>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-therapy-purple" />
                  <span className="text-sm font-medium">Account Settings</span>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
