import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Settings,
  LogOut,
  Mail,
  Phone,
  GraduationCap,
  FileText,
  User,
  Languages,
  Upload,
  ChevronRight,
  Camera,
  X,
} from "lucide-react";
import { profileService } from "@/services/profileService";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DialogClose } from "@/components/ui/dialog";

const profileSchema = z.object({
  profilePicture: z.string().optional(),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  specialization: z.string().min(2, "Specialization is required"),
  languages: z.string(),
  bio: z.string().optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

export function ProfileMenu() {
  const { logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileService.getProfile() || profileService.getInitialProfile(),
  });

  const handleSave = (data: ProfileData) => {
    try {
      profileService.updateProfile(data);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        form.setValue("profilePicture", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('');
  };

  return (
    <>
      <Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm cursor-pointer hover:bg-gray-50/80 transition-all duration-200 border border-gray-100 hover:shadow-md group">
              {form.getValues("profilePicture") ? (
                <Avatar className="w-12 h-12 border-2 border-white shadow transition-transform duration-200 group-hover:scale-105">
                  <AvatarImage 
                    src={form.getValues("profilePicture")} 
                    alt={form.getValues("fullName")} 
                  />
                  <AvatarFallback className="bg-therapy-blue text-therapy-purpleDeep font-bold text-lg">
                    {getInitials(form.getValues("fullName"))}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="w-12 h-12 bg-therapy-blue border-2 border-white shadow transition-transform duration-200 group-hover:scale-105">
                  <AvatarFallback className="bg-therapy-blue text-therapy-purpleDeep font-bold text-lg">
                    {getInitials(form.getValues("fullName"))}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-therapy-gray text-base truncate">{form.getValues("fullName")}</p>
                <p className="text-sm text-gray-500 flex items-center truncate">
                  <GraduationCap className="w-3.5 h-3.5 mr-1 text-therapy-blue/70 flex-shrink-0" />
                  <span className="truncate">{form.getValues("specialization")}</span>
                </p>
              </div>
              <ChevronRight className="ml-auto w-4 h-4 text-gray-400 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-64 p-2" 
            align="end" 
            forceMount
            sideOffset={8}
          >
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{form.getValues("fullName")}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {form.getValues("email")}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuGroup className="space-y-1">
              <DialogTrigger asChild>
                <DropdownMenuItem className="p-2 cursor-pointer rounded-lg hover:bg-gray-100 transition-colors">
                  <Settings className="mr-2 h-4 w-4 text-therapy-blue" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DropdownMenuItem 
                onClick={() => logout()} 
                className="p-2 cursor-pointer rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="max-w-3xl w-full p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row w-full h-full">
            {/* Left: Profile summary and picture */}
            <div className="md:w-1/3 bg-gradient-to-b from-therapy-blue/10 to-white flex flex-col items-center justify-center p-8 border-r border-gray-100 relative">
              <div className="relative group mb-4">
                {form.getValues("profilePicture") ? (
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md transition-transform duration-200 hover:scale-105">
                    <img 
                      src={form.getValues("profilePicture")} 
                      alt={form.getValues("fullName")} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost"
                        className="rounded-full bg-white/90 hover:bg-white text-gray-800"
                        onClick={triggerFileInput}
                      >
                        <Camera className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-full bg-therapy-blue flex items-center justify-center text-therapy-purpleDeep font-bold text-4xl shadow-md border-4 border-white transition-transform duration-200 hover:scale-105">
                    {getInitials(form.getValues("fullName"))}
                    <Button 
                      type="button" 
                      size="icon" 
                      className="absolute bottom-0 right-0 rounded-full bg-therapy-blue hover:bg-therapy-blue/90 shadow-md"
                      onClick={triggerFileInput}
                    >
                      <Camera className="h-5 w-5" />
                    </Button>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-therapy-gray">{form.getValues("fullName")}</p>
                <p className="text-sm text-gray-500 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 mr-1 text-therapy-blue/70" />
                  {form.getValues("specialization")}
                </p>
                <p className="text-xs text-gray-400 mt-2">{form.getValues("email")}</p>
              </div>
            </div>
            {/* Right: Form fields */}
            <div className="flex-1 p-6 md:p-10 bg-white">
              <DialogHeader className="mb-6">
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Update your profile information
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input {...field} className="pl-10 transition-colors focus:border-therapy-blue" />
                            </FormControl>
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input {...field} type="email" className="pl-10 transition-colors focus:border-therapy-blue" />
                            </FormControl>
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input {...field} type="tel" className="pl-10" />
                            </FormControl>
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialization</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input {...field} className="pl-10" />
                            </FormControl>
                            <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="languages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Languages</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input {...field} placeholder="e.g., English, Spanish" className="pl-10" />
                            </FormControl>
                            <Languages className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Write a short bio about yourself" 
                            className="resize-none" 
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          This will be displayed on your public profile
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="mt-6">
                    <Button 
                      type="submit" 
                      className="bg-therapy-blue hover:bg-therapy-blue/90 transition-colors"
                    >
                      Save Changes
                    </Button>
                    <DialogClose asChild>
                      <Button 
                        type="button" 
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
